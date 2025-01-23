import { Accessor, Component, createContext, createMemo, createSignal, onCleanup, onMount, useContext } from 'solid-js'

import {
	MediaPermissionsError,
	MediaPermissionsErrorType,
	requestMediaPermissions
} from 'mic-check'

type CameraPermission =
	'granted' | 'denied' | 'denied:system' | 'error' | 'error:inuse' | 'error:nosupport' |
	'pending' | 'unknown'
export type CameraContext = {
	permission: Accessor<CameraPermission>
	hasPermission: Accessor<boolean>
	canPrompt: Accessor<boolean>
	hasMediaSupport: Accessor<boolean>
	requestPermission: () => Promise<CameraPermission>
}

function queryInitialCameraPermissions() {
	const hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
	if(!hasMediaDevices) {
		setCameraPermission('error:nosupport')
		return;
	}

	navigator.permissions.query({ name: 'camera' } as any)
		.then((permissionObj) => {
			if (permissionObj.state === 'granted') setCameraPermission('granted')
			if (permissionObj.state === 'denied') setCameraPermission('denied')
		})
		.catch((_) => {
			//  console.log('Got error :', error);
		})
}
const [cameraPermission, setCameraPermission] = createSignal<CameraPermission>('unknown')
queryInitialCameraPermissions()

const cameraContext = createContext<CameraContext>({
	permission: cameraPermission,
	hasPermission: () => cameraPermission() === 'granted',
	canPrompt: () => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse',
	hasMediaSupport: () => cameraPermission() !== 'error:nosupport',
	requestPermission
})
export const useCameraContext = () => useContext(cameraContext);

async function requestPermission() {
	setCameraPermission('pending')
	return await requestMediaPermissions({
		audio: false,
		video: true
	})
		.then(() => {
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
			}else if (type === MediaPermissionsErrorType.Generic && message === "Permission dismissed") {
				// prompt dismissed by user
				return setCameraPermission('unknown')
			} else {
				console.error(err);
				// not all error types are handled by this library
				return setCameraPermission('error')
			}
		})
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
				const listener = onPermissionChanged(permissionStatus);
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