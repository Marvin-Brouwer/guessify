import { Component, onMount } from 'solid-js'

import './app-bar.pcss'
import logo from '../../../public/guessify-logo.svg'
import menuIcon from '../../assets/menu_24dp_E8EAED.svg'
import { createModal } from './modal'
import { useCameraContext } from '../../context/camera-context'
import { useDictionaries } from '../../i18n/dictionary'
import { useSpotifyContext } from '../../context/spotify-context'
import { CameraSelectButton } from '../camera-select-button'
import { AppButton } from '../controls/app-button'
import { AppDropdownButton } from '../controls/app-dropdown'

export const AppBar: Component = () => {

	const { Modal, showModal, closeModal } = createModal();

	// TEMP
	onMount(() => showModal())

	onMount(async () => {
		if (import.meta.env.PROD) return
		try {
			await navigator.wakeLock.request("screen");
			console.debug('wakelock on')
		  } catch (err) {
			// the wake lock request fails - usually system related, such being low on battery
			console.log(err);
		  }
	})

	return <header>
		<h1 class="logo"><img src={logo} /><span>Guessify</span></h1>
		<nav>
			<button onClick={showModal}>
				<img src={menuIcon} />
				<span>Menu</span>
			</button>
		</nav>
		<Modal>
			<Menu closeModal={closeModal} />
		</Modal>
	</header>
}

type MenuProps = {
	closeModal: () => void
}
const Menu: Component<MenuProps> = ({ closeModal }) => {

	const { logOut } = useSpotifyContext();
	const { locale } = useDictionaries();

	return <div class='menu'>
		<div class='details'>
		<h2 class="logo"><img src={logo} /> <span>Guessify</span> <sub>{import.meta.env['VITE_APP_VERSION']}</sub></h2>

		<AppDropdownButton
			disabled={() => false}
			value={locale}
			options={() => [{ id: 'en', text: 'English (en)' }, { id: 'nl', text: 'Nederlands (nl)' }]}
			onChange={() => {
				closeModal()
			}}
		/>
		<AppButton disabled text='Share' />
		<hr />
		<CameraSetting closeModal={closeModal} />
		<p></p>
		<p>Account</p>
		<AppButton text='Logout' onClick={logOut} />
		</div>
	</div>
}

type CameraSettingProps = {
	closeModal: () => void
}
const CameraSetting: Component<CameraSettingProps> = ({ closeModal }) => {

	const { camera } = useCameraContext();
	const { dictionary, template } = useDictionaries();

	return <>
		<div class='camera-settings'>
			<p>{template(dictionary().camera.selectedCamera, {
				label: camera()?.label ?? '?'
			})}</p>
			<CameraSelectButton onClick={closeModal} />
		</div>
	</>
}