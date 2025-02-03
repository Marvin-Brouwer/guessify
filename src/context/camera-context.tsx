import { Accessor, children, createContext, createMemo, createSignal, onCleanup, onMount, ParentComponent, useContext } from 'solid-js'

import {
	MediaPermissionsError,
	MediaPermissionsErrorType,
	requestMediaPermissions
} from 'mic-check'
import { getBrowserMetadata } from '../helpers/browser-metadata'
import { ensureRejectionStack } from '../error'

function getCameraConstraints(deviceId?: string | undefined): MediaStreamConstraints {
	return {
		...cameraConstraints,
		video: {
			...cameraConstraints.video as MediaTrackConstraints,
			deviceId: {
				exact: deviceId
			}
		}
	}
}
const cameraConstraints: MediaStreamConstraints = {
	audio: false,
	video: {
		facingMode: {
			ideal: "environment"
		},
		frameRate: {
			ideal: 60,
			min: 30
		},
		sampleRate: {
			ideal: 60,
			min: 30
		}
	}
}

const [knownDevices, setKnownDevices] = createSignal<MediaDeviceInfo[]>([])

export type Camera = {
	id: string
	label: string
	name: string
	facing: 'user' | 'environment' | 'desktop' | 'loading' | undefined
}

type CameraPermission =
	'granted' | 'denied' | 'denied:system' | 'error' | 'error:inuse' | 'error:nosupport' |
	'pending' | 'unknown'
export type CameraContext = {
	permission: Accessor<CameraPermission>
	hasPermission: Accessor<boolean>
	hasErrored: Accessor<boolean>
	canPrompt: Accessor<boolean>
	hasMediaSupport: Accessor<boolean>
	requestCamera: (id?: string) => Promise<Camera>
	camera: Accessor<Camera | undefined>
	cameraStream: Accessor<MediaStream | undefined>
	stopCameraStream: () => Promise<void>
	devices: Accessor<MediaDeviceInfo[]>
	requestPermission: () => Promise<CameraPermission>
}

async function getDevices() {
	if (!navigator.mediaDevices?.enumerateDevices) return

	try {
		const devices = await ensureRejectionStack(() => navigator.mediaDevices?.enumerateDevices())

		const videoDevices = devices.filter(device => device.kind === 'videoinput')
		if (import.meta.env.DEV && knownDevices().length !== videoDevices.length)
			console.debug('available media devices', devices)
		if (import.meta.env.DEV && knownDevices().length !== videoDevices.length)
			console.debug('available video devices', videoDevices)
		if (knownDevices().length !== videoDevices.length) {
			setKnownDevices(videoDevices)
		}
	} catch (err) {
		// This may happen when the tab falls asleep and we try to list devices.
		// The "user interaction" is no longer valid then.
		if ((err as Error).message.includes('Illegal invocation')) return
		throw err
	}
}

function queryInitialCameraPermissions() {
	const hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
	if (!hasMediaDevices) {
		setCameraPermission('error:nosupport')
		return
	}

	navigator.permissions.query({ name: 'camera' } as any)
		.then((permissionObj) => {
			if (permissionObj.state === 'granted') setCameraPermission('granted')
			if (permissionObj.state === 'denied') setCameraPermission('denied')

		})
		.catch((error) => {
			console.error(error)
		})
		.finally(getDevices)
}
const [cameraPermission, setCameraPermission] = createSignal<CameraPermission>('unknown')
queryInitialCameraPermissions()

const [activeCamera, setActiveCamera] = createSignal<Camera>()
const streams = new Map<string, MediaStream>()
const activeStream = () => activeCamera() ? streams.get(activeCamera()!.id) : undefined

async function stopCameraStreams() {

	for (const [key, stream] of streams) {
		const streamValue = stream
		if (!streamValue) {
			streams.delete(key)
			continue
		}

		if (streamValue.active) {
			streamValue.getTracks().forEach(track => {
				if (track.readyState === 'ended') return
				track.stop()
				track.enabled = false
			})
			try {
				if ((streamValue as any).stop) (streamValue as any).stop()
			} catch {
				//
			}
			setActiveCamera(undefined)
		}
	}
	await new Promise(r => setTimeout(r, 200))
}
const hasErrored = () => cameraPermission().startsWith('error')
const canPrompt = () => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse'
const hasPermission = () => cameraPermission() === 'granted'
const cameraContext = createContext<CameraContext>({
	permission: cameraPermission,
	hasPermission,
	hasErrored,
	canPrompt,
	hasMediaSupport: () => cameraPermission() !== 'error:nosupport',
	requestCamera,
	stopCameraStream: stopCameraStreams,
	requestPermission,
	devices: knownDevices,
	camera: activeCamera,
	cameraStream: () => undefined,
})
export const useCameraContext = () => useContext(cameraContext)

async function requestPermission() {
	if (!canPrompt()) return cameraPermission()
	setCameraPermission('pending')

	const storedCamera = localStorage.getItem('camera') ?? undefined
	return await requestMediaPermissions(getCameraConstraints(storedCamera))
		.then(async () => {
			await getDevices()

			// Just try this once to see if the stream starts
			await getCameraInternal()
			return setCameraPermission('granted')
		})
		.catch((err: MediaPermissionsError) => handleMediaPermissionsError(err, storedCamera))
}

function handleMediaPermissionsError(err: MediaPermissionsError, storedCamera: string | undefined) {
	const { type, message, name } = err
	if (type === MediaPermissionsErrorType.SystemPermissionDenied) {
		// browser does not have permission to access camera or microphone
		return setCameraPermission('denied:system')
	} else if (type === MediaPermissionsErrorType.UserPermissionDenied) {
		// user didn't allow app to access camera or microphone
		return setCameraPermission('denied')
	} else if (type === MediaPermissionsErrorType.CouldNotStartVideoSource) {
		// camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)
		// (mostly Windows specific problem)
		return setCameraPermission('error:inuse')
	} else if (name === 'AbortError' && message === "Starting videoinput failed") {
		// prompt dismissed by user
		return setCameraPermission('error:inuse')
	} else if (name === 'NotReadableError') {
		// prompt dismissed by user
		return setCameraPermission('error:inuse')
	} else if (type === MediaPermissionsErrorType.Generic && message === "Permission dismissed") {
		// prompt dismissed by user
		return setCameraPermission('unknown')
	} else if (name === "OverconstrainedError" && ((err as OverconstrainedError).constraint === "deviceId" || message === "")
		&& storedCamera) {
		// This seems to happen when the browser stores a camera that doesn't exist (perhaps the ideas change on software update)
		// Erase storage and reload
		localStorage.removeItem('camera')
		return setCameraPermission('error:inuse')
	} else {
		console.error(err)
		// not all error types are handled by this library
		return setCameraPermission('error')
	}
}

function requestCamera(id?: string): Promise<Camera> {
	if (cameraPermission() !== 'granted') throw new Error(`Call 'requestPermission' before 'getStream'`)

	return getCameraInternal(id)
}

async function getCameraInternal(id?: string): Promise<Camera> {
	if (hasErrored()) return {
		id: '',
		label: 'X',
		facing: 'loading',
		name: 'X',
	}

	const storedCamera = localStorage.getItem('camera') ?? undefined
	const requestedCamera = id ?? storedCamera ?? undefined
	if (activeCamera()?.id !== requestedCamera) await stopCameraStreams()

	const mediaStream = await ensureRejectionStack(
		() => navigator.mediaDevices.getUserMedia(getCameraConstraints(requestedCamera)))
		.catch(error => {
			// TODO at some point we fixed this, adding a second change camera button broke it.
			// It has something to do with not releasing streams.
			// We need to figure out what's keeping the stream open.
			if (error.name === 'NotReadableError') {
				// Sometimes the browser doesn't close the stream on mobile devices
				// To solve this we store and redirect.
				localStorage.setItem('camera', requestedCamera!)
				window.location.reload();
				return undefined
			}
			const result = handleMediaPermissionsError(error as MediaPermissionsError, storedCamera)
			if (result === 'error') throw error
			return undefined
		})

	if (!mediaStream) return {
		id: requestedCamera!,
		label: '?',
		facing: 'loading',
		name: '',
	}

	// Re-query devices just to be sure
	await getDevices()

	if (id) streams.set(id, mediaStream)

	if (!mediaStream.active || !mediaStream.getTracks()) {
		localStorage.setItem('camera', requestedCamera!)

		if (cameraPermission() === 'error:inuse') {
			setActiveCamera(undefined)
			return {
				id: requestedCamera!,
				label: 'X',
				facing: 'loading',
				name: 'X',
			}
		}

		return {
			id: requestedCamera!,
			label: '?',
			facing: 'loading',
			name: '',
		}
	}

	const deviceId = mediaStream.getTracks()[0].getSettings().deviceId!
	streams.set(deviceId, mediaStream)

	localStorage.setItem('camera', deviceId)

	return setActiveCamera({
		id: deviceId,
		name: mediaStream.getTracks()[0].label,
		label: mediaStream.getTracks()[0].label.split('(')[0].split(',')[0].trim(),
		facing: getBrowserMetadata().platform.type === 'desktop'
			? 'desktop' :
			mediaStream.getTracks()[0].getSettings().facingMode as 'user' | 'environment',
	})
}

export const CameraContext: ParentComponent = (props) => {

	const onPermissionChanged = (permissionStatus: PermissionStatus) => async (_event?: Event) => {
		if (hasErrored()) return

		await getDevices()

		// Don't getCameraInternal if already was granted
		// This is necessary to prevent the video element from rerendering constantly
		if (permissionStatus.state === 'granted' && cameraPermission() !== 'granted' && !hasErrored()) {
			await getCameraInternal()
				.then(() => setCameraPermission('granted'))
		}
		if (permissionStatus.state === 'denied') setCameraPermission('denied')
		if (permissionStatus.state === 'prompt') setCameraPermission('unknown')
	}

	onMount(async () => {
		// The browser doesn't properly update when video is on
		const permissionFix = () => {
			if (cameraPermission() === 'pending') return
			if (hasErrored()) return
			ensureRejectionStack(
				() => navigator.permissions.query({ name: 'camera' } as any))
				.then((permissionStatus) => {
					onPermissionChanged(permissionStatus)()
				})
				.catch(() => {
					// do nothing
				})
				// This timeout is necessary to prevent the video from chopping
				.finally(() => window.setTimeout(() => requestAnimationFrame(permissionFix), 10))
		}

		await ensureRejectionStack(
			() => navigator.permissions.query({ name: 'camera' } as any))
			.then((permissionStatus) => {
				permissionStatus.onchange = onPermissionChanged(permissionStatus)
				requestAnimationFrame(permissionFix)
			})
			.catch(() => {
				// do nothing
			})

		if(hasPermission() && !hasErrored() && !activeStream()) await requestCamera();
	})

	onCleanup(async () => {
		await stopCameraStreams()
	})

	return <cameraContext.Provider value={{
		...cameraContext.defaultValue,
		hasPermission: createMemo(() => cameraPermission() === 'granted', cameraPermission),
		canPrompt: createMemo(() => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse', cameraPermission),
		hasMediaSupport: createMemo(() => cameraPermission() !== 'error:nosupport', cameraPermission),
		cameraStream: createMemo(activeStream, [activeCamera]),
	}}>
		{children(() => props.children)()}
	</cameraContext.Provider>
}