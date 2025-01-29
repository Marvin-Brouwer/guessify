import { Accessor, Component, createSignal, onCleanup, onMount } from 'solid-js'

import './camera-viewfinder.pcss'

import { useCameraContext } from '../context/camera-context'
import { Canvas, canvasConfiguration, getContext, makeCanvas } from '../camera-utilities/canvas';
import { scaleupVideo } from '../camera-utilities/scale-video'
import { blurViewFinder, readViewFinder } from '../camera-utilities/read-viewfinder'
import { convertToPixelGrid, PixelGrid } from '../camera-utilities/pixel-grid';

if (canvasConfiguration.debugEnabled()) await import('./camera-viewfinder.debug.pcss')

// This is just as an example:
const [codeExample, _setCode] = createSignal('')

const [codeDetected, _setCodeDetected] = createSignal(false)
const [viewFinder, setViewFinder] = createSignal<HTMLDivElement>()

function debugCanvas(visible: boolean, canvas: Canvas) {
	if (!visible || canvas instanceof HTMLCanvasElement === false) return
	const existing = document.getElementById(canvas.id)
	existing?.remove()
	viewFinder()?.appendChild(canvas)
}
function debugEdges(visible: boolean, viewFinder: HTMLDivElement, grid: PixelGrid) {
	if (!visible || !grid.width) return
	const canvas = makeCanvas('edge', visible, grid.width, grid.height);
	const element = canvas as HTMLCanvasElement
	const existing = document.getElementById(element.id)
	existing?.remove()
	viewFinder.appendChild(element)
	return canvas;
}

function addDebugDownloads(
	videoFrame: MediaStreamTrack, videoElement: HTMLVideoElement,
	viewfinder: Accessor<HTMLDivElement | undefined>,
	...canvasses: Array<Canvas>
) {
	if (canvasConfiguration.showGrayscaleImage) {
		const viewfinderDownload = async () => {
			const link = document.createElement('a')

			const frameSettings = videoFrame.getSettings()

			const tempCanvas = document.createElement('canvas')
			tempCanvas.width = frameSettings.width!
			tempCanvas.height = frameSettings.height!
			const canvasContext = tempCanvas.getContext('2d')!

			// Draw video to canvas
			canvasContext.drawImage(
				videoElement,
				0, 0
			)

			const date = Date.now()

			link.download = `camera-feed-${date}-raw.png`
			link.href = tempCanvas.toDataURL()
			link.click()

			for(const canvas of canvasses) {
				await canvas.writeOutput?.(date);
			}
		}

		viewfinder()!.ondblclick = viewfinderDownload;
		viewfinder()!.oncontextmenu = viewfinderDownload;
		let touchTimeout: NodeJS.Timeout | undefined;
		let touched = false;

		viewfinder()!.ontouchend = () => {
			if(touched ===  true) viewfinderDownload();
			clearTimeout(touchTimeout)
			touched = true;
			touchTimeout = setTimeout(() => touched = false, 500);
		}
	}
}

export type CameraLensProps = {
	videoElement: HTMLVideoElement
}
export const ViewFinder: Component<CameraLensProps> = ({ videoElement }) => {

	const cameraContext = useCameraContext()

	let interval: NodeJS.Timeout | undefined

	async function scanFrame() {
		if (!cameraContext.hasPermission()) {
			window.location.reload()
			return
		}
		const activeCamera = await cameraContext
			.getCamera()
			.catch(() => undefined)

		if (!activeCamera) {
			window.location.reload()
			return
		}

		if (!viewFinder()) return
		const viewFinderRect = viewFinder()!.getBoundingClientRect()
		if (viewFinderRect.width === 0) return
		// Sometimes this seems to happen and cause issues
		if (videoElement.getBoundingClientRect().width === 0) return

		const videoFrame = activeCamera.stream.getVideoTracks()[0]
		// Check if feed is still alive, this tends to happen when phone lock
		if (!activeCamera.stream.active || !videoFrame.enabled) {
			window.location.reload()
		}

		const scaledUpCanvas = await scaleupVideo(videoElement, videoFrame)
		debugCanvas(canvasConfiguration.showScaleCanvas, scaledUpCanvas)

		const viewFinderCanvasses = await Promise.all([
			readViewFinder(viewFinderRect, scaledUpCanvas, false),
			readViewFinder(viewFinderRect, scaledUpCanvas, true)
		]);
		viewFinderCanvasses.forEach(viewFinderCanvas =>
			debugCanvas(canvasConfiguration.showGrayscaleImage, viewFinderCanvas)
		);
		const blurryViewFinderCanvasses = await Promise.all(viewFinderCanvasses
			.map(viewFinderCanvas => blurViewFinder(viewFinderCanvas, scaledUpCanvas.width))
		);
		blurryViewFinderCanvasses.forEach(blurryViewFinderCanvas =>
			debugCanvas(canvasConfiguration.showGrayscaleImage, blurryViewFinderCanvas)
		);

		const pixelGrid = await convertToPixelGrid(blurryViewFinderCanvasses[0], blurryViewFinderCanvasses[1]);

		const edgeCanvas = debugEdges(canvasConfiguration.showOrientationLines, viewFinder()!, pixelGrid)!;

		getContext(edgeCanvas).clearRect(0, 0, edgeCanvas.width, edgeCanvas.height);
		const uintPixels = pixelGrid.flatMap(row => row.flatMap(pixel => {
			const isEdgePixel = pixel[6];
			if (isEdgePixel === 1) return [0,128,0,100];
			if (isEdgePixel === 2) return [128,255,0,100];
			if (isEdgePixel === 3) return [0,255,0,255];
			return [0,0,0,0];
		}))
		getContext(edgeCanvas).putImageData(new ImageData(
			new Uint8ClampedArray(uintPixels),
			pixelGrid.width, pixelGrid.length), 0,0)

		addDebugDownloads(
			videoFrame, videoElement, viewFinder,
			scaledUpCanvas,
			...viewFinderCanvasses,
			...blurryViewFinderCanvasses,
			edgeCanvas
		);
		// // Get image back from canvas
		// const image = canvasContext.getImageData(
		// 	0, 0,
		// 	viewFinderBoundingBox.width, viewFinderBoundingBox.height
		// );

		// const [result, codeValue] = await scanImage(image, canvasContext);

		// if(result === 'code-detected') {
		// 	setCodeDetected(true);
		// 	setCode(codeValue.toString());
		// }
		// else {
		// 	setCodeDetected(false);
		// 	setCode('');
		// }

		// TODO check if we can move this to a requestAnimationFrame without interval looping back on itself
		interval = setTimeout(() => requestAnimationFrame(scanFrame), canvasConfiguration.sampleRate)
	}

	onMount(async () => {
		if (!cameraContext.hasPermission()) {
			return
		}

		const camera = await cameraContext.getCamera()
		if (!camera) {
			return
		}

		// TODO check if we can move this to a requestAnimationFrame without interval looping back on itself
		interval = setTimeout(() => requestAnimationFrame(scanFrame), canvasConfiguration.sampleRate)
	})

	onCleanup(() => {
		clearTimeout(interval)
	})

	return <>
		<div
			ref={setViewFinder}
			class={codeDetected() ? 'viewfinder scanning' : 'viewfinder'}
		/>
		<div class="feedback">{codeExample()}</div>
	</>
}