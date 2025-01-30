import './reset-permission-modal.pcss'

import { Component, createMemo } from 'solid-js'

import { Locale, useDictionaries } from '../../i18n/dictionary'
import { BrowserMetadata, getBrowserMetadata } from '../../helpers/browser-metadata'
import { createModal } from '../modal'

const browserMetadata = getBrowserMetadata()

export const ResetPermissionModal: Component = () => {

	const { locale, dictionary } = useDictionaries()
	const { Modal, showModal } = createModal()

	const instructionUrl = createMemo(() => getUrl(browserMetadata, locale()), locale)

	const requestInfo = async (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		showModal()
		return false
	}

	const instructionLink = createMemo(() => {
		if (!instructionUrl()) return <a onClick={requestInfo} href='#instructions'>{dictionary().camera.permissions.permissionLink}</a>

		return <a href={instructionUrl()} target='_blank'>{dictionary().camera.permissions.permissionLink}</a>
	}, instructionUrl)

	return <>
		{instructionLink()}
		<Modal class='reset-permission-modal'>
			<h2>{dictionary().camera.permissions.title}</h2>
			<p>{dictionary().camera.permissions.explainer}</p>
			{/* // todo github issue link */}
			{/* Template didn't work with links */}
			<p>
				{dictionary().camera.permissions.cta[0]}
				<a href="#todo" target='_blank'>{dictionary().camera.permissions.cta[1]}</a>
				{dictionary().camera.permissions.cta[2]}
			</p>
			<details>
				<summary>{dictionary().camera.permissions.deviceDetails}</summary>
				<pre>{JSON.stringify(getBrowserMetadata(), null, 4)}</pre>
			</details>
			<p></p>
		</Modal>
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