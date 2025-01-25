import { Component, createMemo, ParentProps } from 'solid-js'
import { useCameraContext } from '../context/camera-context'
import { useSpotifyContext } from '../context/spotify-context'
import { SpotifyCard } from './spotify-card'
import { CameraCard } from './camera-card'

import logo from '../../public/guessify-logo.svg'

export const DependencyGate: Component<ParentProps> = ({ children }) => {

	const spotifyContext = useSpotifyContext()
	const cameraContext = useCameraContext()

	const dependenciesMet = createMemo(() =>
		spotifyContext.isValid() &&
		cameraContext.hasPermission(),
		[
			spotifyContext.isValid,
			cameraContext.hasPermission,
			cameraContext.permission
		]
	)

	return <>{createMemo(() => {
		if (dependenciesMet()) return children

		return (<div class="dependency-gate">
			<h1 class="logo"><img src={logo} /> Guessify</h1>
			<SpotifyCard />
			<CameraCard />
		</div>)
	}, dependenciesMet)()}</>
}