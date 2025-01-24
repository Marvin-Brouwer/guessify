import './app.css'

import { DependencyGate } from './dependency-gate'
import { CameraContext } from './context/camera-context'
import { SpotifyContext } from './context/spotify-context'
import { Component } from 'solid-js'

export const MainApp: Component = () => <>
	<SpotifyContext />
	<CameraContext />
	<DependencyGate>
		<p>TODO</p>
	</DependencyGate>
</>

export const LandingPage: Component = () => <>
	<p>TODO, language selector <a href="/guessify/en">English</a> / <a href="/guessify/nl">Nederlands</a></p>
</>