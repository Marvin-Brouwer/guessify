import { Component, createMemo, ParentProps } from 'solid-js'
import { useCameraContext } from '../context/camera-context'
import { useSpotifyContext } from '../context/spotify-context'
import { SpotifyCard } from './spotify-card'
import { CameraCard } from './camera-card'

import logo from '../../public/guessify-logo.svg'
import { useNetworkStatus } from '../context/network-context'
import { useDictionaries } from '../i18n/dictionary'

export const DependencyGate: Component<ParentProps> = ({ children }) => {

	const spotifyContext = useSpotifyContext()
	const cameraContext = useCameraContext()
	const { online } = useNetworkStatus()
	const { dictionary } = useDictionaries();

	if (!online()) return (<div class="dependency-gate">
		<h1 class="logo"><img src={logo} /> Guessify</h1>
		<p>{dictionary().common.offline}</p>
	</div>)

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