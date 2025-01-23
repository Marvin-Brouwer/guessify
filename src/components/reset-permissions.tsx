import { Component, onCleanup, onMount } from 'solid-js'
import type { Parser } from 'bowser'
import { Locale, useDictionaries } from '../i18n/dictionary'

import './reset-permissions.css'
import closeIcon from '../assets/close_24dp_E8EAED.svg'

async function parseBrowser(): Promise<Parser.ParsedResult> {
	const { default: bowser } = await import('bowser')
	return bowser.parse(window.navigator.userAgent)
}

export const ResetPermissionModal: Component = () => {

	const { locale, dictionary } = useDictionaries()

	const modal = <dialog>
		<div class="reset-permissions-modal">
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
		const browserDetails = await parseBrowser()

		const instructionUrl = getUrl(browserDetails, locale())
		if (!!instructionUrl) return modalElement.showModal()

		window.open(instructionUrl, '_blank')
	}

	return <>
		<a onClick={requestInfo} href='#instructions'>{dictionary.camera.permissions.permissionLink}</a>
		{modal}
	</>
}

function getUrl(browserDetails: Parser.ParsedResult, locale: Locale): string | undefined {

	if (import.meta.env.DEV) {
		console.debug('browser meta', browserDetails)
	}

	if (browserDetails.browser.name === 'Chrome') {
		if (browserDetails.platform.type === 'desktop') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DDesktop`
		if (browserDetails.os.name === 'android') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DAndroid`
		if (browserDetails.os.name === 'ios') return `https://support.google.com/chrome/answer/114662?hl=${locale}&co=GENIE.Platform%3DiOS`
	}

	return undefined
}