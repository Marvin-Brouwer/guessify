import { Accessor, createContext, createSignal, onMount, useContext, children, ParentComponent } from 'solid-js';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getStoredLocale } from '../i18n/dictionary'

const clientId = import.meta.env['VITE_SPOTIFY_CLIENT'];
const hostName = import.meta.env['VITE_SPOTIFY_HOST'];

export const spotifyApi = () => SpotifyApi.withUserAuthorization(clientId, `${hostName}${import.meta.env.BASE_URL}spotify-auth`, [
	// Enable in app playback
	"streaming",
	// We need to check fot premium users to enable playback
	"user-read-private",
	// Get access to profile information (TODO Check)
	'user-read-email'
]);

const originalLogout = () => spotifyApi().logOut();
const logOut = () => {
	originalLogout();
	setSpotifyStatusCode(undefined);
}

export type SpotifyApiContext = {
	api: SpotifyApi
	status: Accessor<SpotifyStatus>
	handleAuthReturn: () => Promise<string>
}

async function handleAuthReturn() {

	const newUrl = `../${getStoredLocale()}/`

	// Something doesn't work correctly with the sdk,
	// however, just retrying when 'code' is in the querystring fixes that.
	const initialLocation = new URL(window.location.href);
	if(initialLocation.searchParams.has('code')) {
		const response = await spotifyApi().authenticate();
		setSpotifyStatusCode(response.authenticated ? 'success' : 'error.auth_failed')
		return newUrl
	}

	if (initialLocation.searchParams.has('error')) {
		setSpotifyStatusCode(`error.${initialLocation.searchParams.get('error')!}`)
		return newUrl
	}

	setSpotifyStatusCode('error.invalid_request')
	return newUrl

}

export type SpotifyStatus = undefined | 'success' | `error.${string}`;
const [spotifyStatusCode, setSpotifyStatusCode] = createSignal<SpotifyStatus>()

const spotifyContext = createContext<SpotifyApiContext>({
	api: Object.assign(spotifyApi(), {
		logOut
	}),
	status: spotifyStatusCode,
	handleAuthReturn
})
export const useSpotifyApi = () => useContext(spotifyContext);

export const SpotifyApiContext: ParentComponent = (props) => {

	if (import.meta.env.DEV) {
		onMount(async () => {
			const authToken = await spotifyApi().getAccessToken()
			if (!authToken || authToken.access_token === "emptyAccessToken") {
				console.debug('User not logged into spotify')
			}
			else {
				const userName = await spotifyApi().currentUser.profile().then(p => p.display_name)
				console.debug(`User "${userName}" logged into spotify`, authToken)
			}
		})
	}

	onMount(async () => {

		const hasExistingToken = await spotifyApi().getAccessToken().then(t => !!t);
		if (hasExistingToken) {
			const response = await spotifyApi().authenticate();
			setSpotifyStatusCode(response.authenticated ? 'success' : 'error.auth_failed')
		}
	})

	return <spotifyContext.Provider value={spotifyContext.defaultValue}>
		{children(() => props.children)()}
	</spotifyContext.Provider>
}