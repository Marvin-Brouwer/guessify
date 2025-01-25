import { Component, createMemo, createSignal, onCleanup, onMount } from 'solid-js'

import './camera-lens.css'

import { useCameraContext } from '../context/camera-context'

// TODO if quagga nor barcodedetector work, just make it ourselves and uninstall
import { BarcodeDetector } from "barcode-detector/pure";

const barcodeDetector: BarcodeDetector = new BarcodeDetector({
	// formats: ["qr_code"],
});

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

	let interval: NodeJS.Timeout | undefined;

	// Show this when debugging
	if (import.meta.env.DEV) {
		canvasElement().style.display = 'block';
		canvasElement().style.marginLeft = '-4px';
		canvasElement().style.marginTop = '-4px';
		canvasElement().style.opacity = '.5';
	}

	async function scanFrame() {
		const activeCamera = await cameraContext.getCamera();
		if (!activeCamera) return undefined

		setCodeDetected(false);

		const frameSettings = activeCamera.stream.getVideoTracks()[0].getSettings();
		const sourceLeft = frameSettings.width! * .15;
		const sourceWidth = frameSettings.width! * .7;
		// No idea why this is 355 instead of 45,
		// perhaps it has something to do with device UI, TODO figure out later, it's close enough
		const sourceTop = frameSettings.height! * .355;
		const sourceHeight = frameSettings.height! * .3;

		canvasElement().getContext('2d', { willReadFrequently: true })!.drawImage(
			videoElement,
			sourceLeft, sourceTop,
			sourceWidth, sourceHeight,
			0, 0,
			boundingBox().width, boundingBox().height,
		);
		const image = canvasElement().getContext('2d')!.getImageData(0,0,boundingBox().width, boundingBox().height)

		const barcodeCandidate = await barcodeDetector.detect(image);
		if(barcodeCandidate.length) {

			setCodeDetected(true);
			setCode(barcodeCandidate[0].rawValue);
			console.log(barcodeCandidate);
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
		</div>
		<div class="lens-feedback">{codeExample()}</div>
	</>
}