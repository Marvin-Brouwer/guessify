import { Component, createMemo, Show } from 'solid-js'

import './camera-card.pcss'
import changeCameraIcon from '../assets/add_a_photo_24dp_E8EAED.svg'

import { useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import { ResetPermissionModal } from './camera-card/reset-permission-modal'
import { useCameraDisplayIcon } from './camera-card.icon'
import { CameraSelectButton } from './camera-select-button'
import { VideoPlayer } from '../context/camera-context.player'

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

	const permissionButton = createMemo(() => {

		console.log(cameraContext.permission())
		if (cameraContext.permission() === 'pending') return <button disabled>
			<span>{dictionary().camera.requestingPermission}</span>
			<img src={changeCameraIcon} />
		</button>
		if (cameraContext.permission() === 'error:inuse') return <button onClick={(e) => {
			(e.target as HTMLButtonElement).disabled = true
			window.location.reload()
		}}>
			<span>{dictionary().common.refresh}</span>
			<img src={changeCameraIcon} />
		</button>

		return <button disabled={!cameraContext.canPrompt()} onclick={() => {
			cameraContext.requestPermission()
		}}>
			<span>{dictionary().camera.requestPermission}</span>
			<img src={changeCameraIcon} />
		</button>
	}, [cameraContext.canPrompt, cameraContext.permission])

	return <>
		<div class='camera-request-card card'>
			<div class="details">
				<p>{dictionary().camera.explainer[0]}</p>
				<p>{dictionary().camera.explainer[1]}</p>
				<Show when={cameraContext.permission() === 'error:inuse'}>
					<p class='error'>{dictionary().camera.inUse}</p>
				</Show>
			</div>
			<div class="controls">
				{permissionButton()}
			</div>
		</div>
	</>
}
const CameraAcceptedCard: Component = () => {

	const { camera } = useCameraContext()
	const { dictionary, template } = useDictionaries()

	const cameraIcon = useCameraDisplayIcon(camera);

	return <>
		<div class='camera-request-card card'>
			<VideoPlayer />
			<div class="video-overlay">
				{camera() && <div class="stats">
					{cameraIcon()}
					<span>{dictionary().camera.type[camera()?.facing ?? 'unknown']}</span>
				</div>}
			</div>
			<div class="details">
				<p>{template(dictionary().camera.selectedCamera, {
					label: camera()?.label ?? '...'
				})}</p>
				<p><i>{dictionary().camera.switchBanner}</i></p>
			</div>
			<div class='controls'>
				<CameraSelectButton />
			</div>
		</div>
	</>
}