import './camera-select-button.pcss'
import cameraSelectIcon from '../assets/cameraswitch_24dp_E8EAED.svg'

import { Component, createMemo, Setter } from 'solid-js'

import { useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import { AppDropdownButton } from './controls/app-dropdown';

export type CameraSelectButtonProps = {
	nameRef?: Setter<string>
}
export const CameraSelectButton: Component<CameraSelectButtonProps> = ({ nameRef }) => {

	const { camera, devices, requestCamera, stopCameraStream } = useCameraContext()
	const { dictionary } = useDictionaries();

	const cameraOptions = createMemo(() => devices()
		.map(device => ({id: device.deviceId, text: device.label }))
	, [devices, camera])

	return <div class="camera-select-button">
		<AppDropdownButton
			value={() => camera()?.id}
			options={cameraOptions}
			disabled={() => !camera()}
			disabledLabel={dictionary().camera.openingCam}
			selectImageUrl={cameraSelectIcon}
			onChange={async (_e, selectValue) => {
				nameRef?.(selectValue)
				await stopCameraStream();
				await requestCamera(selectValue);
			}}
		/>
	</div>
}