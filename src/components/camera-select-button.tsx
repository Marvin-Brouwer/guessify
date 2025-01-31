import { Component, createMemo, Setter } from 'solid-js'
import { useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import cameraSelectIcon from '../assets/cameraswitch_24dp_E8EAED.svg'

import './camera-select-button.pcss'

export type CameraSelectButtonProps = {
	nameRef?: Setter<string>
}
export const CameraSelectButton: Component<CameraSelectButtonProps> = ({ nameRef }) => {

	const { camera, devices, requestCamera, stopCameraStream } = useCameraContext()
	const { dictionary } = useDictionaries();

	const cameraOptions = createMemo(() => devices()
		.map(device => <option value={device.deviceId} selected={device.deviceId === camera()?.id}>{device.label}</option>
	), [devices, camera])

	return <div class="camera-select-button">
		<select disabled={!camera() || cameraOptions().length === 1} onchange={async (e) => {
			if(e.target.value === camera()?.id) return;
			const newValue = e.target.value;

			console.log('i', e.target.innerText)
			nameRef?.(e.target.innerText!)
			await stopCameraStream();
			await requestCamera(newValue);
		}}>
			{cameraOptions()}
		</select>
		<div class={camera() ? "fake-button" : "fake-button disabled"}>
			<span>{camera()?.name ?? dictionary().camera.openingCam}</span>
			{cameraOptions().length > 1 && <img src={cameraSelectIcon} />}
		</div>
	</div>
}