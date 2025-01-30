import { Accessor, createMemo } from 'solid-js'
import { Camera } from '../context/camera-context'

import camera_unknown from '../assets/camera_24dp_E8EAED.svg'
import camera_desktop from '../assets/photo_camera_24dp_E8EAED.svg'
import camera_user from '../assets/person_24dp_E8EAED.svg'
import camera_environment from '../assets/image_24dp_E8EAED.svg'

export const useCameraDisplayIcon = (camera: Accessor<Camera | undefined>) => createMemo(() => {
	const cameraFacing = camera()?.facing

	if (cameraFacing === 'loading') return null;

	if (cameraFacing === 'desktop') return <img src={camera_desktop} />
	if (cameraFacing === 'user') return <img src={camera_user} />
	if (cameraFacing === 'environment') return <img src={camera_environment} />

	return <img src={camera_unknown} />
}, camera)