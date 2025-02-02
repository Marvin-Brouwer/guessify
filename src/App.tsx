import './app.pcss'

import { RouteSectionProps } from '@solidjs/router'
import { children, Component } from 'solid-js'

import { DependencyGate } from './components/dependency-gate'
import { SpotifyContext } from './context/spotify-context'
import { CameraCanvas } from './components/camera-canvas'
import { UncaughtErrorBoundary } from './components/ui/uncaught-error-boundary'
import { NetworkStatusContext } from './context/network-context'
import { SpotifyApiContext } from './context/spotify-api-context'
import { AppBar } from './components/ui/app-bar'
import { CameraContext } from './context/camera-context'

export const AppRoot: Component<RouteSectionProps> = (props) => <UncaughtErrorBoundary>
	<NetworkStatusContext>
		<SpotifyApiContext>
			{children(() => props.children)()}
		</SpotifyApiContext>
	</NetworkStatusContext>
</UncaughtErrorBoundary>


export const MainApp: Component = () => <SpotifyContext>
	<CameraContext>
		<DependencyGate>
			<AppBar />
			<CameraCanvas />
		</DependencyGate>
	</CameraContext>
</SpotifyContext>


export const LandingPage: Component = () => <>
	<p>TODO, language selector <a href="/guessify/en/">English</a> / <a href="/guessify/nl/">Nederlands</a></p>
</>