import { Component, createMemo, createSignal, onMount } from 'solid-js'

import './camera-canvas.css'

import { Camera, useCameraContext } from '../context/camera-context'

export const CameraCanvas: Component = () => {

	const cameraContext = useCameraContext()

	const [camera, setCamera] = createSignal<Camera>();
	const cameraStream = createMemo(() => camera()?.stream ?? null, camera);

	const videoDom = <video></video>;
	const videoPlayerElement = videoDom as HTMLVideoElement

	const videoPlayer = createMemo(() => {
		videoPlayerElement.srcObject = cameraStream();
		if (videoPlayerElement.srcObject) {
			videoPlayerElement.removeAttribute('src');
			videoPlayerElement.onloadedmetadata = () => {
				videoPlayerElement.play();
			};
			return videoDom
		} else {
			videoPlayerElement.src = "";
			videoPlayerElement.srcObject = null;
			videoPlayerElement.pause();
			return <video></video>
		}
	}, [cameraStream])

	onMount(() => {
		cameraContext
			.getCamera()
			.then(setCamera)
			.catch(console.error);
	});

	return <>
		<div class='camera-canvas'>
			{videoPlayer()}
			<div class="video-overlay"></div>
			<div class="video-lens">
				<div class='lens'></div>
			</div>
		</div>
	</>
}