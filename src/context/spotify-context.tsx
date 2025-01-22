import { Accessor, Component, createContext, createMemo, createSignal, useContext } from 'solid-js'
import { SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk';

const clientId = import.meta.env['VITE_SPOTIFY_CLIENT'];
const hostName = import.meta.env['VITE_SPOTIFY_HOST'];

const sdk = SpotifyApi.withUserAuthorization(clientId, hostName, [
		// Enable in app playback
		"streaming",
		// We need to check fot premium users to enable playback
		"user-read-private",
		// Get access to profile information (TODO Check)
		'user-read-email'
	]);

// Something doesn't work correctly with the sdk,
// however, just retrying when 'code' is in the querystring fixes that.
const initialLocation = new URL(window.location.href);
if(initialLocation.searchParams.has('code')) {
	await sdk.authenticate();
}

if (import.meta.env.DEV) {
	const authToken = await sdk.getAccessToken()
	if (!authToken) {
		console.debug('User not logged into spotify')
	}
	else {
		const userName = await sdk.currentUser.profile().then(p => p.display_name)
		console.debug(`User "${userName}" logged into spotify`, authToken)
	}
}

function logOut() {

	sdk.logOut();
	setAuthenticated(false);
	setIsAuthenticating(false)
}
async function logIn() {

	setIsAuthenticating(true)
	const response = await sdk.authenticate();
	setAuthenticated(response.authenticated)
	const currentProfile = await sdk.currentUser.profile();
	setProfile(currentProfile);
	setIsAuthenticating(false)
}

export type SpotifyContext = {
	logOut: () => void
	logIn: () => Promise<void>
	isAuthenticating: Accessor<boolean>,
	isAuthenticated: Accessor<boolean>,
	isValid: Accessor<boolean>,
	profile: Accessor<UserProfile | undefined>
}

const hasExistingToken = await sdk.getAccessToken().then(t => !!t)
const [isAuthenticating, setIsAuthenticating] = createSignal(hasExistingToken);
const [isAuthenticated, setAuthenticated] = createSignal(false);

const [profile, setProfile] = createSignal<UserProfile>()
const checkValid = () => isAuthenticated() && profile()?.product === 'premium'

const spotifyContext = createContext<SpotifyContext>({
	logIn,
	logOut,
	isAuthenticating,
	isAuthenticated,
	isValid: checkValid,
	profile
	// permission: cameraPermission,
	// hasPermission: () => cameraPermission() === 'granted',
	// canPrompt: () => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse',
	// requestPermission
})
export const useSpotifyContext = () => useContext(spotifyContext);


export const SpotifyContext: Component = () => {

	if (isAuthenticating()) {
		logIn()
	}

	return <spotifyContext.Provider value={{
		...spotifyContext.defaultValue,
		isValid: createMemo(checkValid, isAuthenticated)
		// hasPermission: createMemo(() => cameraPermission() === 'granted', cameraPermission),
		// canPrompt: createMemo(() => cameraPermission() === 'unknown' || cameraPermission() === 'error:inuse', cameraPermission),
	}}>
		<></>
	</spotifyContext.Provider>
}