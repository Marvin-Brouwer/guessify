import { Component, createMemo, onMount } from 'solid-js'
import { useCameraContext } from '../context/camera-context'
import { useDictionaries } from '../i18n/dictionary'
import cameraSelectIcon from '../assets/cameraswitch_24dp_E8EAED.svg'

import './camera-select-button.pcss'

export const CameraSelectButton: Component = () => {

	const { camera, ...cameraContext} = useCameraContext()
	const { dictionary } = useDictionaries()

	onMount(() => {
		if(!camera()) cameraContext.requestCamera().catch(console.error);
	});

	const cameraOptions = createMemo(() => cameraContext.devices()
		.map(device => <option value={device.deviceId} selected={device.deviceId === camera()?.id}>{device.label}</option>
	), [cameraContext.devices, camera])

	return <div class="camera-select-button">
		<select data-value={camera()?.id} disabled={!camera() || cameraOptions().length === 1} onchange={async (e) => {
			const activeCamera = camera();
			if(e.target.value === activeCamera?.id) return;
			const newValue = e.target.value;

			await cameraContext
				.requestCamera(newValue)
				.catch((err) => {
					cameraContext.requestCamera(activeCamera?.id)
					console.error(err)
				});;
		}}>
			{cameraOptions()}
		</select>
		<div class={camera() ? "fake-button" : "fake-button disabled"}>
			<span>{camera()?.name ?? dictionary().camera.openingCam}</span>
			{cameraOptions().length > 1 && <img src={cameraSelectIcon} />}
		</div>
	</div>
}