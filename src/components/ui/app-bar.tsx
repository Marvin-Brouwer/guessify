import { Component, onMount } from 'solid-js'

import './app-bar.pcss'
import logo from '../../../public/guessify-logo.svg'
import menuIcon from '../../assets/menu_24dp_E8EAED.svg'
import { createModal } from './modal'
import { useCameraContext } from '../../context/camera-context'
import { useDictionaries } from '../../i18n/dictionary'
import { useSpotifyContext } from '../../context/spotify-context'
import { CameraSelectButton } from '../camera-select-button'

export const AppBar: Component = () => {

	const { Modal, showModal } = createModal();

	// TEMP
	// onMount(() => showModal())

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
			<Menu />
		</Modal>
	</header>
}

const Menu: Component = () => {

	const { logOut } = useSpotifyContext();

	return <div class='menu'>
		<div class='details'>
		<h2 class="logo"><img src={logo} /> <span>Guessify</span> <sub>{import.meta.env['VITE_APP_VERSION']}</sub></h2>
		<p>TODO: This will be styled later</p>
		<select disabled>
			<option>English (en)</option>
			<option>Nederlands (nl)</option>
		</select>
		<CameraSetting />
		<button onClick={logOut}><span>Logout</span></button>
		<button disabled><span>Share</span></button>
		</div>
	</div>
}

const CameraSetting: Component = () => {

	const { camera } = useCameraContext();
	const { dictionary, template } = useDictionaries();

	return <>
		<div class='camera-settings'>
			<p>{template(dictionary().camera.selectedCamera, {
				label: camera()?.label ?? '?'
			})}</p>
			<CameraSelectButton />
		</div>
	</>
}