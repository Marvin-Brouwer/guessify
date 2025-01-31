import { children, Component, createMemo, ParentProps, Show } from 'solid-js'
import { useCameraContext } from '../context/camera-context'
import { useSpotifyContext } from '../context/spotify-context'
import { SpotifyCard } from './spotify-card'
import { CameraCard } from './camera-card'

import logo from '../../public/guessify-logo.svg'
import { useNetworkStatus } from '../context/network-context'
import { useDictionaries } from '../i18n/dictionary'

export const DependencyGate: Component<ParentProps> = (props) => {

	const spotifyContext = useSpotifyContext()
	const cameraContext = useCameraContext()
	const { online } = useNetworkStatus()
	const { dictionary } = useDictionaries()
	const renderChildren = children(() => props.children)

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
	const fallback = <div class="dependency-gate">
		<h1 class="logo"><img src={logo} /> Guessify</h1>
		<SpotifyCard />
		<CameraCard />
	</div>

	return <Show
		when={dependenciesMet()}
		children={renderChildren()}
		fallback={fallback}
	/>
}