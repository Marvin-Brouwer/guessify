import './app.css'

import { DependencyGate } from './components/dependency-gate'
import { CameraContext } from './context/camera-context'
import { SpotifyContext } from './context/spotify-context'
import { Component } from 'solid-js'
import { SpotifyAuthHandler } from './components/spotify-auth'

export const MainApp: Component = () => <>
	<CameraContext>
		<SpotifyContext>
			<DependencyGate>
				<p>TODO</p>
			</DependencyGate>
		</SpotifyContext>
	</CameraContext>
</>

export const LandingPage: Component = () => <>
	<p>TODO, language selector <a href="/guessify/en">English</a> / <a href="/guessify/nl">Nederlands</a></p>
</>

export const SpotifyLoginRedirect: Component = () => <>
	<SpotifyAuthHandler />
</>