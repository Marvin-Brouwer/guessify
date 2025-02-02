import { Component, createEffect, onMount } from 'solid-js'

import './app-bar.pcss'
import logo from '../../../public/guessify-logo.svg'
import menuIcon from '../../assets/menu_24dp_E8EAED.svg'
import logoutIcon from '../../assets/logout_24dp_E8EAED.svg'

import { createModal } from './modal'
import { useCameraContext } from '../../context/camera-context'
import { useDictionaries } from '../../i18n/dictionary'
import { useSpotifyContext } from '../../context/spotify-context'
import { CameraSelectButton } from '../camera-select-button'
import { AppButton } from '../controls/app-button'
import { AppDropdownButton } from '../controls/app-dropdown'
import { useNavigate } from '@solidjs/router'
import { languageNames } from '../../i18n/names'

export const AppBar: Component = () => {

	const { Modal, showModal, closeModal } = createModal()

	onMount(async () => {
		if (import.meta.env.PROD) return;
		try {
			await navigator.wakeLock.request("screen")
			console.debug('wakelock on')
		} catch (err) {
			// the wake lock request fails - usually system related, such being low on battery
			console.log(err)
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

	return <div class='menu'>
		<div class='details'>
			<h2 class="logo"><img src={logo} /> <span>Guessify</span> <sub>{import.meta.env['VITE_APP_VERSION']}</sub></h2>
			<LanguageSetting />
			<ShareSetting />
			<hr />
			<CameraSetting closeModal={closeModal} />
			<AccountSetting closeModal={closeModal} />
		</div>
	</div>
}

const LanguageSetting: Component = () => {

	const { locale, locales } = useDictionaries()
	const appLocales = locales.map(cultureCode => ({ id: cultureCode, text: languageNames[cultureCode] }))
	const navigate = useNavigate()

	return <AppDropdownButton
		value={locale}
		options={() => appLocales}
		onChange={(_e, value) => {
			navigate('/' + value + '/')
		}}
	/>
}
// TODO SHARE dialog
const ShareSetting: Component = () => {

	const { dictionary } = useDictionaries()

	return <AppButton disabled text={dictionary().common.share} />
}
type CameraSettingProps = {
	closeModal: () => void
}
const CameraSetting: Component<CameraSettingProps> = ({ closeModal }) => {

	const { camera, hasPermission, hasErrored } = useCameraContext()
	const { dictionary, template } = useDictionaries()

	createEffect(() => {
		if (!hasPermission() || hasErrored()) closeModal()
	}, [hasPermission, hasErrored])

	return <div class='camera-settings'>
		<p>{template(dictionary().camera.selectedCamera, {
			label: camera()?.label ?? '?'
		})}</p>
		<CameraSelectButton />
	</div>
}
type AccountSettingProps = {
	closeModal: () => void
}
const AccountSetting: Component<AccountSettingProps> = ({ closeModal }) => {

	const { logOut, profile } = useSpotifyContext()
	const { dictionary } = useDictionaries()

	return <div class='account-settings'>
		<p>Account: {profile()?.display_name}</p>
		<AppButton
			text={dictionary().spotify.signOut}
			imageUrl={logoutIcon}
			onClick={(e) => {
				e.currentTarget.disabled = true
				closeModal()
				logOut()
			}} />
	</div>
}