import { Component, createSignal, onCleanup, onMount } from 'solid-js'

import './camera-viewfinder.css'

import { useCameraContext } from '../context/camera-context'
import { canvasConfiguration } from '../camera-utilities/canvas'
import { scaleupVideo } from '../camera-utilities/scale-video'
import { readViewFinder } from '../camera-utilities/video-viewfinder'

if (canvasConfiguration.debugEnabled()) await import('./camera-viewfinder.debug.css')

// This is just as an example:
const [codeExample, _setCode] = createSignal('')

const [codeDetected, _setCodeDetected] = createSignal(false)
const [viewFinder, setViewFinder] = createSignal<HTMLDivElement>()

function debugCanvas(visible: boolean, canvas: HTMLCanvasElement | OffscreenCanvas) {
	if (!visible) return
	const element = canvas as HTMLCanvasElement
	const existing = document.getElementById(element.id)
	existing?.remove()
	viewFinder()?.appendChild(element)
}

function addDebugDownloads(
	videoFrame: MediaStreamTrack, videoElement: HTMLVideoElement,
	scaledUpCanvas: HTMLCanvasElement | OffscreenCanvas, viewFinderCanvas: HTMLCanvasElement | OffscreenCanvas
) {
	if (canvasConfiguration.showGrayscaleImage) {
		const viewFinderCanvasElement = (viewFinderCanvas as HTMLCanvasElement)
		viewFinderCanvasElement.onclick = async () => {
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

			if(scaledUpCanvas instanceof HTMLCanvasElement) {
				link.download = `camera-feed-${date}-scaled.png`
				link.href = scaledUpCanvas.toDataURL()
				link.click()
			}

			link.download = `camera-feed-${date}-viewfinder.png`
			link.href = viewFinderCanvasElement.toDataURL()
			link.click()
		}
	}
}

export type CameraLensProps = {
	videoElement: HTMLVideoElement
}
export const CameraLens: Component<CameraLensProps> = ({ videoElement }) => {

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

		const viewFinderCanvas = await readViewFinder(viewFinderRect, scaledUpCanvas)
		addDebugDownloads(videoFrame, videoElement, scaledUpCanvas, viewFinderCanvas)
		debugCanvas(canvasConfiguration.showGrayscaleImage, viewFinderCanvas)

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
		interval = setInterval(() => requestAnimationFrame(scanFrame), canvasConfiguration.sampleRate)
	})

	onCleanup(() => {
		clearInterval(interval)
	})

	return <>
		<div ref={setViewFinder} class={codeDetected() ? 'camera-lens scanning' : 'camera-lens'}>

		</div>
		<div class="lens-feedback">{codeExample()}</div>
	</>
}