import './app.css'

import { DependencyGate } from './components/dependency-gate'
import { SpotifyContext } from './context/spotify-context'
import { children, Component } from 'solid-js'
import { SpotifyAuthHandler } from './components/spotify-auth'
import { CameraCanvas } from './components/camera-canvas'
import { RouteSectionProps } from '@solidjs/router'
import { UncaughtErrorBoundary } from './components/uncaught-error-boundary'

export const AppRoot: Component<RouteSectionProps> = (props) =>
	<UncaughtErrorBoundary>
		{children(() => props.children)()}
	</UncaughtErrorBoundary>


export const MainApp: Component = () => <>
		<SpotifyContext>
			<DependencyGate>
				<CameraCanvas />
			</DependencyGate>
		</SpotifyContext>
</>

export const LandingPage: Component = () => <>
	<p>TODO, language selector <a href="/guessify/en/">English</a> / <a href="/guessify/nl/">Nederlands</a></p>
</>

export const SpotifyLoginRedirect: Component = () => <>
	<SpotifyAuthHandler />
</>