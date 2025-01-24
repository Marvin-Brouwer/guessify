import { Component, onCleanup, onMount } from 'solid-js'
import { Locale, useDictionaries } from '../i18n/dictionary'

import './reset-permissions.css'
import closeIcon from '../assets/close_24dp_E8EAED.svg'
import { BrowserMetadata, getBrowserMetadata } from '../helpers/browser-metadata'

export const ResetPermissionModal: Component = () => {

	const { locale, dictionary } = useDictionaries();

	const modal = <dialog>
		<div class="reset-permissions-modal card">
			<div class="details">
				<h2>{dictionary.camera.permissions.title}</h2>
				<p>{dictionary.camera.permissions.explainer}</p>
				{/* // todo github issue link */}
				{/* Template didn't work with links */}
				<p>
					{dictionary.camera.permissions.cta[0]}
					<a href="#todo" target='_blank'>{dictionary.camera.permissions.cta[1]}</a>
					{dictionary.camera.permissions.cta[2]}
				</p>
				<details>
					<summary>{dictionary.camera.permissions.deviceDetails}</summary>
					<pre>
{JSON.stringify(getBrowserMetadata(), null, 4)}
					</pre>
				</details>
				<p></p>
			</div>
			<div class="controls">
				<button onClick={() => modalElement.close()}>
					<span>{dictionary.common.close}</span>
					<img src={closeIcon} />
				</button>
			</div>
		</div>
	</dialog>
	const modalElement = modal as HTMLDialogElement

	const checkBackdropClick = (_event: MouseEvent) => {
		if (modalElement.hidden) return
		// https://stackoverflow.com/a/26984690
		modalElement.addEventListener('click', function (event) {
			const rect = modalElement.getBoundingClientRect()
			const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX && event.clientX <= rect.left + rect.width)
			if (!isInDialog) {
				modalElement.close()
			}
		}, { once: true })
	}

	onMount(() => {
		modalElement.addEventListener('click', checkBackdropClick)
	})
	onCleanup(() => {
		modalElement.removeEventListener('click', checkBackdropClick)
	})

	const requestInfo = async () => {
		const browserMetadata = getBrowserMetadata()

		const instructionUrl = getUrl(browserMetadata, locale())
		if (!instructionUrl) return modalElement.showModal()

		window.open(instructionUrl, '_blank')
	}

	return <>
		<a onClick={requestInfo} href='#instructions'>{dictionary.camera.permissions.permissionLink}</a>
		{modal}
	</>
}

function getUrl(browserDetails: BrowserMetadata, locale: Locale): string | undefined {

	if (browserDetails.browser.name === 'Chrome') {
		if (browserDetails.platform.type === 'desktop') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DDesktop`
		if (browserDetails.os.name === 'Android') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DAndroid`
		if (browserDetails.os.name === 'IOS') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DiOS`
	}

	return undefined
}