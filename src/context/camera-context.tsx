import { Accessor, Component, createContext, createMemo, createSignal, ParentProps, useContext } from 'solid-js'

import {
	MediaPermissionsError,
	MediaPermissionsErrorType,
	requestMediaPermissions
} from 'mic-check'

type CameraPermission =
	'granted' | 'denied' | 'denied:permanent' | 'error' | 'error:inuse' | 'error:nosupport' |
	'pending' | 'unknown'
export type CameraContext = {
	permission: Accessor<CameraPermission>
	hasPermission: Accessor<boolean>
	canPrompt: Accessor<boolean>
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
				return setCameraPermission('denied:permanent')
			} else if (type === MediaPermissionsErrorType.UserPermissionDenied) {
				// user didn't allow app to access camera or microphone
				return setCameraPermission('denied')
			} else if (type === MediaPermissionsErrorType.CouldNotStartVideoSource) {
				// camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)
				// (mostly Windows specific problem)
				return setCameraPermission('error:inuse')
			}else if (type === MediaPermissionsErrorType.Generic && message === "Permission dismissed") {
				// camera is in use by another application (Zoom, Skype) or browser tab (Google Meet, Messenger Video)
				// (mostly Windows specific problem)
				return setCameraPermission('unknown')
			} else {
				console.error(err);
				// not all error types are handled by this library
				return setCameraPermission('error')
			}
		})
}

export const CameraContext: Component = () => {

	return <cameraContext.Provider value={{
		...cameraContext.defaultValue,
		hasPermission: createMemo(() => cameraPermission() === 'granted', cameraPermission),
		canPrompt: createMemo(() => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse', cameraPermission),
	}}>
		<></>
	</cameraContext.Provider>
}