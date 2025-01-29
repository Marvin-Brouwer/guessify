import { Component } from 'solid-js'

import { Locale, useDictionaries } from '../../i18n/dictionary'
import { BrowserMetadata, getBrowserMetadata } from '../../helpers/browser-metadata'
import { Modal, ModalElement } from '../modal'

export const ResetPermissionModal: Component = () => {

	const { locale, dictionary } = useDictionaries()

	const modal = (<Modal>
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
	</Modal>) as ModalElement

	const requestInfo = async () => {
		const browserMetadata = getBrowserMetadata()

		const instructionUrl = getUrl(browserMetadata, locale())
		if (!!instructionUrl) return modal().showModal()

		window.open(instructionUrl, '_blank')
	}

	return <>
		<a onClick={requestInfo} href='#instructions'>{dictionary().camera.permissions.permissionLink}</a>
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