import { Component, createMemo, createSignal, onMount } from 'solid-js'

import './camera-card.pcss'
import camera_unknown from '../assets/camera_24dp_E8EAED.svg'
import camera_desktop from '../assets/photo_camera_24dp_E8EAED.svg'
import camera_user from '../assets/person_24dp_E8EAED.svg'
import camera_environment from '../assets/image_24dp_E8EAED.svg'
import changeCameraIcon from '../assets/add_a_photo_24dp_E8EAED.svg'
import cameraSelectIcon from '../assets/cameraswitch_24dp_E8EAED.svg'

import { Camera, useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import { ResetPermissionModal } from './camera-card/reset-permission-modal'

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
		<h2>{dictionary().camera.title}</h2>
		{activeCard()}
	</div>
}
const CameraUnsupportedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				<p>{dictionary().camera.explainer[0]}</p>
				<p>{dictionary().camera.noSupport[0]} </p>
				<p>{dictionary().camera.noSupport[1]} </p>
			</div>
		</div>
	</>
}
const CameraDeniedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				<p>{dictionary().camera.explainer[0]}</p>
				<p>{dictionary().camera.noPermission[0]}</p>
				<p>{dictionary().camera.noPermission[1]} <ResetPermissionModal />.</p>
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
				<p>{dictionary().camera.explainer[0]}</p>
				<p>{dictionary().camera.explainer[1]}</p>
			</div>
			<div class="controls">
				<button disabled={!cameraContext.canPrompt()} onclick={() => {
					cameraContext.requestPermission()
				}}>
					{cameraContext.permission() === 'pending'
						? <span>{dictionary().camera.requestingPermission}</span>
						: <span>{dictionary().camera.requestPermission}</span>
					}
					<img src={changeCameraIcon} />
				</button>
			</div>
		</div>
	</>
}
const CameraAcceptedCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary, template } = useDictionaries()

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

	const cameraOptions = createMemo(() => cameraContext.devices()
		.map(device => <option value={device.deviceId} selected={device.deviceId === camera()?.id}>{device.label}</option>
	), [cameraContext.devices, camera])

	const cameraIcon = createMemo(() => {
		const cameraFacing = camera()?.facing

		if (cameraFacing === 'loading') return null;

		if (cameraFacing === 'desktop') return <img src={camera_desktop} />
		if (cameraFacing === 'user') return <img src={camera_user} />
		if (cameraFacing === 'environment') return <img src={camera_environment} />

		return <img src={camera_unknown} />
	}, camera)
	return <>
		<div class='camera-request-card card'>
			{videoPlayer()}
			<div class="video-overlay">
				{camera() && <div class="stats">
					{cameraIcon()}
					<span>{dictionary().camera.type[camera()?.facing ?? 'unknown']}</span>
				</div>}
			</div>
			<div class="details">
				<p>{template(dictionary().camera.selectedCamera, {
					label: camera()?.label ?? '?'
				})}</p>
				<p><i>{dictionary().camera.switchBanner}</i></p>
			</div>
			<div class="controls">
				<select data-value={camera()?.id} disabled={!camera()} onchange={async (e) => {
					const activeCamera = camera();
					if(e.target.value === activeCamera?.id) return;
					videoPlayerElement.pause();
					videoPlayerElement.srcObject = null;
					const newValue = e.target.value;
					// Temporarily disable camera to make the chance of disposing the camera bigger
					setCamera(undefined)

					await cameraContext
						.getCamera(newValue)
						.then(setCamera)
						.catch((err) => {
							setCamera(activeCamera)
							console.error(err)
						});;
				}}>
					{cameraOptions()}
				</select>
				<div class={camera() ? "fake-button" : "fake-button disabled"}>
					<span>{camera()?.name ?? dictionary().camera.openingCam}</span>
					<img src={cameraSelectIcon} />
				</div>
			</div>
		</div>
	</>
}