import { Component, createMemo, createSignal, onMount } from 'solid-js'

import './camera-card.css'
import cameraIcon from '../assets/add_a_photo_24dp_E8EAED.svg'
import cameraSelectIcon from '../assets/photo_camera_24dp_E8EAED.svg'

import { Camera, useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import { ResetPermissionModal } from './reset-permissions'

export const CameraCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary } = useDictionaries()

	const activeCard = createMemo(() => {
		if (!cameraContext.hasMediaSupport())
			return <CameraUnsupportedCard />
		if (cameraContext.canPrompt() || cameraContext.permission() === 'pending')
			return <CameraRequestCard />
		if (cameraContext.hasPermission())
			return <CameraAcceptedCard />

		return <CameraDeniedCard />
	}, [cameraContext.hasMediaSupport, cameraContext.canPrompt, cameraContext.hasPermission])


	return <div class='camera-card'>
		<h2>{dictionary.camera.title}</h2>
		{activeCard()}
	</div>
}
const CameraUnsupportedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				<p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.noSupport[0]} </p>
				<p>{dictionary.camera.noSupport[1]} </p>
			</div>
		</div>
	</>
}
const CameraDeniedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				<p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.noPermission[0]}</p>
				<p>{dictionary.camera.noPermission[1]} <ResetPermissionModal />.</p>
			</div>
		</div>
	</>
}
const CameraRequestCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card'>
			<div class="details">
				<p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.explainer[1]}</p>
			</div>
			<div class="controls">
				<button disabled={!cameraContext.canPrompt()} onclick={() => {
					cameraContext.requestPermission()
				}}>
					{cameraContext.permission() === 'pending'
						? <span>{dictionary.camera.requestingPermission}</span>
						: <span>{dictionary.camera.requestPermission}</span>
					}
					<img src={cameraIcon} />
				</button>
			</div>
		</div>
	</>
}
const CameraAcceptedCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary, template } = useDictionaries()

	const [camera, setCamera] = createSignal<Camera>();
	const cameraStream = createMemo(() => camera()?.stream ?? new MediaStream(), camera);

	const videoDom = <video></video>;

	const videoPlayer = createMemo(() => {
		const videoPlayerElement = videoDom as HTMLVideoElement

		videoPlayerElement.srcObject = cameraStream();
		videoPlayerElement.onloadedmetadata = () => {
			videoPlayerElement.play();
		};

		return videoDom
	}, [cameraStream])

	onMount(() => {
		cameraContext
			.getCamera()
			.then(setCamera)
			// TODO handle error
			.catch(console.error);
	});

	const cameraOptions = createMemo(() => cameraContext.devices()
		.map(device => <option value={device.deviceId} selected={device.deviceId === camera()?.id}>{device.label}</option>
	), [cameraContext.devices, camera])

	return <>
		<div class='camera-request-card card'>
			{videoPlayer()}
			<div class="video-blur" />
			<div class="details">
				<p>{template(dictionary.camera.selectedCamera, {
					label: camera()?.label ?? '?'
				})}</p>
				<p><i>{dictionary.camera.switchBanner}</i></p>
			</div>
			<div class="controls">
				<select data-value={camera()?.id} onchange={async (e) => {
					if(e.target.value === camera()?.id) return;

					const selectedCamera = await cameraContext.getCamera(e.target.value);
					setCamera(selectedCamera);
				}}>
					{cameraOptions()}
				</select>
				<div class="fake-button">
					<span>{camera()?.name}</span>
					<img src={cameraSelectIcon} />
				</div>
			</div>
		</div>
	</>
}