import { Component, createMemo, ParentProps } from 'solid-js'
import { useCameraContext } from './context/camera-context'
import { useSpotifyContext } from './context/spotify-context'
import { SpotifyCard } from './components/spotify-card'
import { CameraCard } from './components/camera-card'

export const DependencyGate: Component<ParentProps> = ({ children }) => {

	const spotifyContext = useSpotifyContext();
	const cameraContext = useCameraContext();

	const dependenciesMet = createMemo(() =>
		spotifyContext.isValid() &&
		cameraContext.hasPermission() &&
		false,
		[
			spotifyContext.isValid,
			cameraContext.hasPermission
		]
	)

	return createMemo(() =>{
		if(dependenciesMet()) return children

		return <div>
			<SpotifyCard />
			<CameraCard />

			<p>&nbsp;</p>
			<button disabled={!cameraContext.canPrompt()} onClick={() => cameraContext.requestPermission()}>request cam</button>
			<p>{cameraContext.permission()}</p>
		</div>
	},	dependenciesMet)()
}