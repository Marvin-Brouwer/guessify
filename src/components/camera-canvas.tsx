import { Component, createMemo, createSignal, onMount } from 'solid-js'

import './camera-canvas.pcss'

import { Camera, useCameraContext } from '../context/camera-context'
import { ViewFinder } from './camera-viewfinder'
import { canvasConfiguration } from '../camera-utilities/canvas'

export const CameraCanvas: Component = () => {

	const cameraContext = useCameraContext()

	const [camera, setCamera] = createSignal<Camera>()
	const cameraStream = createMemo(() => camera()?.stream ?? null, camera)

	const videoDom = <video></video>
	const videoPlayerElement = videoDom as HTMLVideoElement

	const videoPlayer = createMemo(() => {
		videoPlayerElement.srcObject = cameraStream()
		if (videoPlayerElement.srcObject) {
			videoPlayerElement.removeAttribute('src')
			videoPlayerElement.onloadedmetadata = () => {
				videoPlayerElement.play()
			}
			return videoDom
		} else {
			videoPlayerElement.src = ""
			videoPlayerElement.srcObject = null
			videoPlayerElement.pause()
			return <video></video>
		}
	}, [cameraStream])

	onMount(() => {
		if (cameraContext.hasPermission())
			cameraContext
				.getCamera()
				.then(setCamera)
				.catch(console.error)
	})

	return <>
		<div class='camera-canvas'>
			{videoPlayer()}
			{canvasConfiguration.debugEnabled() ? <>
				<div class="video-overlay" />
				<div class="video-overlay debug">
					<ViewFinder videoElement={videoPlayerElement} />
				</div>
			</> :
				<div class="video-overlay">
					<ViewFinder videoElement={videoPlayerElement} />
				</div>
			}
		</div>
	</>
}