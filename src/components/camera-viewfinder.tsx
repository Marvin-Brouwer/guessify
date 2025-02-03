import { Component, createSignal, onCleanup, onMount } from 'solid-js'

import './camera-viewfinder.pcss'

import { useCameraContext } from '../context/camera-context'
import { canvasConfiguration } from '../camera-utilities/canvas'
import { scaleupVideo } from '../camera-utilities/scale-video'
import { blurViewFinder, readViewFinder } from '../camera-utilities/read-viewfinder'
import { convertToPixelGrid } from '../camera-utilities/pixel-grid'

import debug from './camera-viewfinder.debug'

// This is just as an example:
const [codeExample, _setCode] = createSignal('')

const [codeDetected, _setCodeDetected] = createSignal(false)
const [viewFinder, setViewFinder] = createSignal<HTMLDivElement>()

export type CameraLensProps = {
	videoElement: HTMLVideoElement | undefined
}
export const ViewFinder: Component<CameraLensProps> = ({ videoElement }) => {

	const cameraContext = useCameraContext()

	let interval: NodeJS.Timeout | undefined

	async function scanFrame() {
		if (cameraContext.hasErrored()) return
		if (!cameraContext.hasPermission()) {
			if (import.meta.env.DEV) {
				window.location.reload()
				return
			} else {
				return requestAnimationFrame(scanFrame)
			}
		}

		const stream = await cameraContext.cameraStream()
		if (!stream) return requestAnimationFrame(scanFrame)

		if (!viewFinder()) return requestAnimationFrame(scanFrame)
		const viewFinderRect = viewFinder()!.getBoundingClientRect()
		if (viewFinderRect.width === 0) return requestAnimationFrame(scanFrame)
		// Sometimes this seems to happen and cause issues
		if (!videoElement || videoElement.getBoundingClientRect().width === 0) return requestAnimationFrame(scanFrame)

		const videoFrame = stream.getVideoTracks()[0]
		if (!videoFrame) return requestAnimationFrame(scanFrame)

		const scaledUpCanvas = await scaleupVideo(videoElement, videoFrame)
		if (!scaledUpCanvas) return requestAnimationFrame(scanFrame)
		debug?.debugCanvas(canvasConfiguration.showScaleCanvas, scaledUpCanvas)

		const viewFinderCanvasses = await Promise.all([
			readViewFinder(viewFinderRect, scaledUpCanvas, false),
			readViewFinder(viewFinderRect, scaledUpCanvas, true)
		])
		debug?.debugCanvas(canvasConfiguration.showGrayscaleImage, viewFinderCanvasses[0])
		debug?.debugCanvas(canvasConfiguration.showGrayscaleImage, viewFinderCanvasses[1])

		const blurryViewFinderCanvasses = await Promise.all([
			blurViewFinder(viewFinderCanvasses[0]),
			blurViewFinder(viewFinderCanvasses[1]),
		])
		debug?.debugCanvas(false, blurryViewFinderCanvasses[0])
		debug?.debugCanvas(false, blurryViewFinderCanvasses[1])

		const pixelGrid = convertToPixelGrid(blurryViewFinderCanvasses[0], blurryViewFinderCanvasses[1])
		if (!pixelGrid) return requestAnimationFrame(scanFrame)

		if (canvasConfiguration.showOrientationLines) {
			debug?.debugGridPixels(canvasConfiguration.showOrientationLines, 'edge', pixelGrid, debug?.markLine)
		}

		// TODO detect circle
		// TODO detect code end
		// TODO matrix transform
		// TODO scan code
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
		if (!cameraContext.hasPermission()) return

		// TODO CameraContext.requestStreamStart()
		const camera = cameraContext.camera()
		// rename to cameraContext.requestNewCamera()
		if (!camera && !await cameraContext.requestCamera()) {
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
		>
			{debug && <debug.DebugCanvasDisplay />}
			{debug && <debug.DebugGridDisplay />}
		</div>
		<div class="feedback">{codeExample()}</div>
	</>
}