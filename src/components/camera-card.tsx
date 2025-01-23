import { Component, createEffect, createMemo, createSignal } from 'solid-js'

import './camera-card.css'
import profilePlaceHolder from '../assets/account_circle_24dp_E8EAED.svg'
import premiumIcon from '../assets/verified_24dp_E8EAED.svg'
import noPremiumIcon from '../assets/warning_24dp_E8EAED.svg'
import logoutIcon from '../assets/logout_24dp_E8EAED.svg'
import loginIcon from '../assets/login_24dp_E8EAED.svg'

import { useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import { ResetPermissionModal } from './reset-permissions'

export const CameraCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary } = useDictionaries()

	return <div class='camera-card'>
		<h2>{dictionary.camera.title}</h2>
		<CameraUnsupportedCard />
		<p></p>
		<CameraDeniedCard />
		<p></p>
		<CameraRequestCard />
		<p></p>
		<CameraAcceptedCard />
	</div>
	// const activeCard = createMemo(() => {
	// 	if (!cameraContext.isAuthenticating() && cameraContext.isAuthenticated())
	// 		return <CameraProfileCard />

	// 	return <CameraLoginCard />
	// }, [cameraContext.isAuthenticated, cameraContext.isAuthenticating])

	// return <div class='camera-card'>
	// 	<h2>{dictionary.camera.title}</h2>
	// 	{activeCard()}
	// </div>
}
const CameraUnsupportedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				details not supported
				{/* <p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.explainer[1]}</p>
				{cameraContext.errorMessage() && <p class='error'>
					{cameraContext.errorMessage()}
				</p>} */}
			</div>
		</div>
	</>
}
const CameraDeniedCard: Component = () => {

	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				details denied <ResetPermissionModal />
				{/* <p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.explainer[1]}</p>
				{cameraContext.errorMessage() && <p class='error'>
					{cameraContext.errorMessage()}
				</p>} */}
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
				details
				{/* <p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.explainer[1]}</p>
				{cameraContext.errorMessage() && <p class='error'>
					{cameraContext.errorMessage()}
				</p>} */}
			</div>
			<div class="controls">
				<button disabled={!cameraContext.canPrompt()} onclick={() => {
					cameraContext.requestPermission()
				}}>
					Knop
					{/* {cameraContext.isAuthenticating()
						? <span>{dictionary.camera.signingIn}</span>
						: <span>{dictionary.camera.signIn}</span>
					}
					{!cameraContext.isAuthenticating() && <img src={loginIcon} />} */}
				</button>
			</div>
		</div>
	</>
}
const CameraAcceptedCard: Component = () => {

	const cameraContext = useCameraContext()
	const { dictionary } = useDictionaries()

	return <>
		<div class='camera-request-card card no-controls'>
			<div class="details">
				details accepted
				{/* <p>{dictionary.camera.explainer[0]}</p>
				<p>{dictionary.camera.explainer[1]}</p>
				{cameraContext.errorMessage() && <p class='error'>
					{cameraContext.errorMessage()}
				</p>} */}
			</div>
		</div>
	</>
}