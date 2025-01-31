import { Component, createSignal } from 'solid-js'

import './camera-canvas.pcss'

import { ViewFinder } from './camera-viewfinder'
import { canvasConfiguration } from '../camera-utilities/canvas'
import { VideoPlayer } from '../context/camera-context.player'

export const CameraCanvas: Component = () => {

	const [videoPlayerElement, setVideoPlayerElement] = createSignal<HTMLVideoElement>()

	return <>
		<div class='camera-canvas'>
			<VideoPlayer ref={setVideoPlayerElement} />
			{canvasConfiguration.debugEnabled() ? <>
				<div class="video-overlay" />
				<div class="video-overlay debug">
					<ViewFinder videoElement={videoPlayerElement()} />
				</div>
			</> :
				<div class="video-overlay">
					<ViewFinder videoElement={videoPlayerElement()} />
				</div>
			}
		</div>
	</>
}