import { Component, createSignal, onMount } from 'solid-js'

import './camera-canvas.pcss'

import { useCameraContext } from '../context/camera-context'
import { ViewFinder } from './camera-viewfinder'
import { canvasConfiguration } from '../camera-utilities/canvas'
import { VideoPlayer } from '../context/camera-context.player'

export const CameraCanvas: Component = () => {

	const { requestCamera, cameraStream } = useCameraContext()
	const [videoPlayerElement, setVideoPlayerElement] = createSignal<HTMLVideoElement>()


	onMount(() => {
		if (!cameraStream()) requestCamera().catch(console.error)
	})

	return <>
		<div class='camera-canvas'>
			<VideoPlayer stream={cameraStream} ref={setVideoPlayerElement} />
			{canvasConfiguration.debugEnabled() ? <>
				<div class="video-overlay" />
				<div class="video-overlay debug">
					<ViewFinder videoElement={videoPlayerElement()!} />
				</div>
			</> :
				<div class="video-overlay">
					<ViewFinder videoElement={videoPlayerElement()!} />
				</div>
			}
		</div>
	</>
}