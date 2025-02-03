import { Component, createEffect, createMemo, onCleanup, Setter } from 'solid-js'
import { useCameraContext } from './camera-context'

export type VideoPlayerProps = {
	ref?: Setter<HTMLVideoElement | undefined>
}
export const VideoPlayer: Component<VideoPlayerProps> = (props) => {

	const { cameraStream, camera } = useCameraContext();
	const videoDom = <video loop />
	const videoPlayerElement = videoDom as HTMLVideoElement

	props.ref?.(videoPlayerElement)

	onCleanup(() => {
		props.ref?.(undefined)
		const player = videoPlayerElement;
		player.pause()

		// Apparently the stream gets duplicated when assigned to a video.
		const sourceStream = player.srcObject as MediaStream | undefined
		const activeTracks = sourceStream?.getTracks() ?? []
		for (const track of activeTracks) sourceStream?.removeTrack(track)

		player.src = ''
		player.srcObject = null
	})

	createEffect(() => {
		const player = videoPlayerElement
		const stream = cameraStream()

		if (getSourceActive(stream)) {
			if (sameDevice(stream, player.srcObject! as MediaStream)) return
			player.removeAttribute('src')
			player.srcObject = stream!
			player.onloadedmetadata = () => {
				player.play()
			}
			player.srcObject.addEventListener('removetrack', () => {
				player.pause()
			}, { once: true })
			const p = player.srcObject.getTracks()[0]
			p.addEventListener('ended', () => {
				player.pause()
			}, { once: true })

			if (import.meta.env.DEV)
				player.setAttribute('data-stream', (player.srcObject! as MediaStream)?.id ?? '')
		}
		else {
			player.pause()

			// Apparently the stream gets duplicated when assigned to a video.
			const sourceStream = player.srcObject as MediaStream | undefined
			const activeTracks = sourceStream?.getTracks() ?? []
			for (const track of activeTracks) sourceStream?.removeTrack(track)

			player.src = ''
			player.srcObject = null

			if (import.meta.env.DEV)
				player.removeAttribute('data-stream')

		}
	}, [cameraStream, camera])

	const player = createMemo(() => getSourceActive(cameraStream()) ? videoPlayerElement : <video />)

	return <>{player()}</>
}
const getSourceActive = (stream: MediaStream | undefined) => {
	if (!stream) return false
	if (!stream.active) return false
	if (stream.getTracks().length === 0) return false
	return stream.getTracks()[0].enabled
}
const sameDevice = (streamA: MediaStream | undefined, streamB: MediaStream | undefined) => {
	return streamA?.getTracks()[0]?.getSettings().deviceId
		== streamB?.getTracks()[0]?.getSettings().deviceId
}