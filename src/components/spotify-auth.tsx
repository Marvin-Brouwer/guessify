import { Component, createEffect } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import './spotify-auth.css'

import logo from '../../public/guessify-logo.svg'
import loadingIcon from '../assets/timelapse_24dp_E8EAED.svg'
import { useSpotifyApi } from '../context/spotify-api-context'
import { getStoredLocale, rawDictionary } from '../i18n/dictionary'

export const SpotifyAuthHandler: Component = () => {

	const navigate = useNavigate();
	const { handleAuthReturn } = useSpotifyApi();
	const locale = getStoredLocale();
	const loadingLabel = locale
		? rawDictionary(locale).spotify.signingIn
		: '...'

	createEffect(() => {
		handleAuthReturn()
			.then((path) => {
				navigate(path, { replace: true })
			})
	})

	return <div class="auth">
		<h1 class="logo"><img src={logo} /> Guessify</h1>
		<div class="details">
			<p><img src={loadingIcon} />{loadingLabel}</p>
		</div>
	</div>
}