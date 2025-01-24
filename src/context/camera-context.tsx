import { Accessor, Component, createContext, createMemo, createSignal, onCleanup, onMount, useContext } from 'solid-js'

import {
	MediaPermissionsError,
	MediaPermissionsErrorType,
	requestMediaPermissions
} from 'mic-check'

const cameraConstraints: MediaStreamConstraints = {
	audio: false,
	video: {
		facingMode: "environment",
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
	stream: MediaStream
}

type CameraPermission =
	'granted' | 'denied' | 'denied:system' | 'error' | 'error:inuse' | 'error:nosupport' |
	'pending' | 'unknown'
export type CameraContext = {
	permission: Accessor<CameraPermission>
	hasPermission: Accessor<boolean>
	canPrompt: Accessor<boolean>
	hasMediaSupport: Accessor<boolean>
	getCamera: (id?: string) => Promise<Camera>
	devices: Accessor<MediaDeviceInfo[]>
	requestPermission: () => Promise<CameraPermission>
}

async function getDevices() {
	const devices = await navigator.mediaDevices?.enumerateDevices();
	if (import.meta.env.DEV) console.debug('available media devices', devices);
	if (import.meta.env.DEV) console.debug('available video devices', devices.filter(device => device.kind === 'videoinput'));
	setKnownDevices(devices.filter(device => device.kind === 'videoinput'))
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
			console.error(error);
		})
		.finally(async () => {
			if(!!navigator.mediaDevices?.enumerateDevices && knownDevices().length === 0)
				await getDevices();
		})
}
const [cameraPermission, setCameraPermission] = createSignal<CameraPermission>('unknown')
queryInitialCameraPermissions()

const cameraContext = createContext<CameraContext>({
	permission: cameraPermission,
	hasPermission: () => cameraPermission() === 'granted',
	canPrompt: () => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse',
	hasMediaSupport: () => cameraPermission() !== 'error:nosupport',
	getCamera,
	requestPermission,
	devices: knownDevices
})
export const useCameraContext = () => useContext(cameraContext)

async function requestPermission() {
	setCameraPermission('pending')
	return await requestMediaPermissions(cameraConstraints)
		.then(async () => {
			if (!!navigator.mediaDevices?.enumerateDevices) {
				await getDevices();
			}
			return setCameraPermission('granted')
		})
		.catch((err: MediaPermissionsError) => {
			const { type, message } = err
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
			} else if (type === MediaPermissionsErrorType.Generic && message === "Permission dismissed") {
				// prompt dismissed by user
				return setCameraPermission('unknown')
			} else {
				console.error(err)
				// not all error types are handled by this library
				return setCameraPermission('error')
			}
		})
}

// TODO locally store selected camera
async function getCamera(id?: string): Promise<Camera> {
	if (cameraPermission() !== 'granted') throw new Error(`Call 'requestPermission' before 'getStream'`);

	const mediaStream = await navigator.mediaDevices.getUserMedia(
		id ? {video:{ deviceId: id }} : cameraConstraints
	);

	// TODO when does this happen?
	if(!mediaStream.active) throw new Error('mediastream died');
	return {
		id: mediaStream.getTracks()[0].getSettings().deviceId!,
		name: mediaStream.getTracks()[0].label,
		label: mediaStream.getTracks()[0].label.split('(')[0].trim(),
		stream: mediaStream
	}
}

export const CameraContext: Component = () => {

	const onPermissionChanged = (permissionStatus: PermissionStatus) => (_event: Event) => {

		if (permissionStatus.state === 'granted') setCameraPermission('granted')
		if (permissionStatus.state === 'denied') setCameraPermission('denied')
		if (permissionStatus.state === 'prompt') setCameraPermission('unknown')
	}

	onMount(() => {
		navigator.permissions
			.query({ name: 'camera' } as any)
			.then((permissionStatus) => {
				const listener = onPermissionChanged(permissionStatus)
				permissionStatus.addEventListener('change', listener)
				onCleanup(() => {
					permissionStatus.removeEventListener('change', listener)
				})
			})
			.catch(() => {
				// do nothing
			})
	})

	return <cameraContext.Provider value={{
		...cameraContext.defaultValue,
		hasPermission: createMemo(() => cameraPermission() === 'granted', cameraPermission),
		canPrompt: createMemo(() => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse', cameraPermission),
		hasMediaSupport: createMemo(() => cameraPermission() !== 'error:nosupport', cameraPermission),
	}}>
		<></>
	</cameraContext.Provider>
}