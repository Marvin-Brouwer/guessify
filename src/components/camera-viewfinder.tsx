import { Component, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import './camera-viewfinder.css'

import { useCameraContext } from '../context/camera-context'
import { applyPixelFilter } from '../camera-utilities/pixel-filter'
import { scanImage } from '../camera-utilities/scanner'

// TODO https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
const hideFrame = false; // import.meta.env.PROD;

// This is just as an example:
const [codeExample, setCode] = createSignal('');

const [codeDetected, setCodeDetected] = createSignal(false);
const [cameraBox, setCameraBox] = createSignal<HTMLDivElement>();
const [boundingBox, setCameraBoundingBox] = createSignal<DOMRect>(new DOMRect());

function updateBoundingBox() {
	if (!cameraBox()) return;

	setCameraBoundingBox(cameraBox()!.getBoundingClientRect())

	console.log(boundingBox())
}

export type CameraLensProps = {
	videoElement: HTMLVideoElement
}
export const CameraLens: Component<CameraLensProps> = ({ videoElement }) => {

	const cameraContext = useCameraContext()
	const canvas = createMemo(() => <canvas
		width={boundingBox().width}
		height={boundingBox().height}
	/>, boundingBox);
	const canvasElement = () => canvas() as HTMLCanvasElement
	const temp = <div class="temp"></div>

	let interval: NodeJS.Timeout | undefined;

	// Show this when debugging
	if (!hideFrame) {
		canvasElement().style.display = 'block';
		canvasElement().style.marginLeft = '-4px';
		canvasElement().style.marginTop = '-4px';
		//
		canvasElement().onclick = async () => {
			const activeCamera = await cameraContext.getCamera()
			if (!activeCamera) return;
			const link = document.createElement('a');

			const videoFrame = activeCamera.stream.getVideoTracks()[0];
			const frameSettings = videoFrame.getSettings();

			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = frameSettings.width!;
			tempCanvas.height = frameSettings.height!;
			const canvasContext = tempCanvas.getContext('2d')!

			// Draw video to canvas
			canvasContext.drawImage(
				videoElement,
				0,0,
				frameSettings.width!, frameSettings.height!
			);

			const date = Date.now()

			link.download = `camera-feed-${date}.png`;
			link.href = tempCanvas.toDataURL();
			link.click();

			link.download = `processed${date}.png`;
			link.href = canvasElement().toDataURL()
			link.click();
		}
	}

	async function scanFrame() {
		if(!cameraContext.hasPermission()) {
			window.location.reload();
		}
		const activeCamera = await cameraContext.getCamera()
			.catch(() => window.location.reload());
		if (!activeCamera) return undefined

		const videoFrame = activeCamera.stream.getVideoTracks()[0];
		// Check if feed is still alive, this tends to happen when phone lock
		if(!activeCamera.stream.active || !videoFrame.enabled) {
			window.location.reload();
		}
		const frameSettings = videoFrame.getSettings();
		// TODO this seems to be caused by the video not matching the screen
		// It's way worse on desktop, we'll have to calculate the difference if we want to make it perfect.
		// It seems to be good enough on mobile though
		const sourceLeft = frameSettings.width! * .15;
		const sourceWidth = frameSettings.width! * .7;
		// No idea why this is 355 instead of 45,
		// perhaps it has something to do with device UI, TODO figure out later, it's close enough
		const sourceTop = frameSettings.height! * .355;
		const sourceHeight = frameSettings.height! * .3;

		const canvasContext = canvasElement().getContext('2d', {
			willReadFrequently: true,
			desynchronized: hideFrame
		})!

		// Draw video to canvas
		canvasContext.drawImage(
			videoElement,
			sourceLeft, sourceTop,
			sourceWidth, sourceHeight,
			0, 0,
			boundingBox().width, boundingBox().height,
		);

		// Fiddle with the image to make black more clear and glare less obvious
		canvasContext.filter = 'brightness(1) contrast(2)'

		// Get image back from canvas
		const image = canvasContext.getImageData(
			0, 0,
			boundingBox().width, boundingBox().height
		);

		await applyPixelFilter(image);
		if(!hideFrame) canvasContext.putImageData(image, 0, 0);

		const [result, codeValue] = await scanImage(image, canvasContext);

		if(result === 'code-detected') {
				setCodeDetected(true);
				setCode(codeValue.toString());
		}
		else {
			setCodeDetected(false);
			setCode('');
		}
	}

	onMount(async () => {
		if(!cameraContext.hasPermission()) return

		const camera = await cameraContext.getCamera()
		if (!camera) return;


		window.addEventListener('resize', updateBoundingBox)
		updateBoundingBox()

		interval = setInterval(() => requestAnimationFrame(scanFrame), 200);
	});

	onCleanup(() => {
		window.removeEventListener('resize', updateBoundingBox)
		clearInterval(interval);
	})

	return <>
		<div ref={setCameraBox} class={codeDetected() ? 'camera-lens scanning' : 'camera-lens'}>
			{canvas()}
			{temp}
		</div>
		<div class="lens-feedback">{codeExample()}</div>
	</>
}