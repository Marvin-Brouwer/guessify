import { Component, createEffect } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import logo from '../../public/guessify-logo.svg'
import { useSpotifyApi } from '../context/spotify-api-context'

export const SpotifyAuthHandler: Component = () => {

	const navigate = useNavigate();
	const { handleAuthReturn } = useSpotifyApi();

	createEffect(() => {
		handleAuthReturn()
			.then((path) => {
				navigate(path, { replace: true })
			})
	})
	return <div>
		<h1 class="logo"><img src={logo} /> Guessify</h1>
	</div>
}