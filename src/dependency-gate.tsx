import { Component, createMemo, createSignal, ParentProps } from 'solid-js'
import { useCameraContext } from './context/camera-context'
import { useSpotifyContext } from './context/spotify-context'
import { SpotifyCard } from './components/spotify-card'
import { CameraCard } from './components/camera-card'

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

		return <>
			<h1>Guessify</h1>
			<SpotifyCard />
			<CameraCard />
		</>
	}, dependenciesMet)()}</>
}