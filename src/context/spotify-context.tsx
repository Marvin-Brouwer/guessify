import { Accessor, Component, createContext, createMemo, createSignal, onMount, useContext } from 'solid-js'
import { SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk';
import { useDictionaries } from '../i18n/dictionary'

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
	setErrorCode(undefined)
	const response = await sdk.authenticate();

	// This means the browser is redirected
	if (response.accessToken.access_token === "emptyAccessToken") return

	const currentProfile = await sdk.currentUser.profile();
	setProfile(currentProfile);
	setAuthenticated(response.authenticated)
	setIsAuthenticating(false)
}

type ErrorCode = 'access_denied' | string | undefined
export type SpotifyContext = {
	logOut: () => void
	logIn: () => Promise<void>
	isAuthenticating: Accessor<boolean>,
	isAuthenticated: Accessor<boolean>,
	isValid: Accessor<boolean>,
	errorMessage: Accessor<string | undefined>,
	profile: Accessor<UserProfile | undefined>
}

const hasExistingToken = await sdk.getAccessToken().then(t => !!t)
const [isAuthenticating, setIsAuthenticating] = createSignal(hasExistingToken);
const [isAuthenticated, setAuthenticated] = createSignal(false);

// Errors are put in the redirect url
const [errorCode, setErrorCode] = createSignal<ErrorCode>()
if(initialLocation.searchParams.has('error')) {
	setErrorCode(initialLocation.searchParams.get('error')!)
}

const errorMessage = () => {
	if(!errorCode()) return undefined;

	const { dictionary } = useDictionaries();
	if (errorCode() === 'access_denied') return dictionary.spotify.errors.access_denied;

	return dictionary.spotify.errors.unknown;
}

const [profile, setProfile] = createSignal<UserProfile>()
const checkValid = () => isAuthenticated() && profile()?.product === 'premium'

const spotifyContext = createContext<SpotifyContext>({
	logIn,
	logOut,
	isAuthenticating,
	isAuthenticated,
	isValid: checkValid,
	profile,
	errorMessage
})
export const useSpotifyContext = () => useContext(spotifyContext);

export const SpotifyContext: Component = () => {

	onMount(() => {
		if (hasExistingToken) {
			logIn()
		}
	})

	const { dictionary, locale } = useDictionaries();

	return <spotifyContext.Provider value={{
		...spotifyContext.defaultValue,
		isValid: createMemo(checkValid, isAuthenticated),
		errorMessage: createMemo(errorMessage, [dictionary, locale, errorCode])
	}}>
		<></>
	</spotifyContext.Provider>
}