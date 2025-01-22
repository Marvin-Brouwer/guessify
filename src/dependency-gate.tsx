import { Component, createMemo, ParentProps } from 'solid-js'
import { useCameraContext } from './context/camera-context'
import { useSpotifyContext } from './context/spotify-context'

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
			<button disabled={spotifyContext.isAuthenticating() || spotifyContext.isAuthenticated()} onClick={() => spotifyContext.logIn()}>login</button>
			<button disabled={spotifyContext.isAuthenticating() || !spotifyContext.isAuthenticated()} onClick={() => spotifyContext.logOut()}>logout</button>
			<p>{
				spotifyContext.isAuthenticating() ? 'loading' :
				spotifyContext.isAuthenticated() ? 'logged in' : 'not logged in'
			}</p>
			{spotifyContext.isAuthenticated() && <p>{spotifyContext.profile()?.display_name}</p>}
			{spotifyContext.isAuthenticated() && <p>{spotifyContext.profile()?.product}</p>}

			<button disabled={!cameraContext.canPrompt()} onClick={() => cameraContext.requestPermission()}>request cam</button>
			<p>{cameraContext.permission()}</p>
		</div>
	},	dependenciesMet)()
}