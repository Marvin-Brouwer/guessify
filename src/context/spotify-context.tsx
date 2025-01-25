import { Accessor, children, createContext, createMemo, createSignal, onMount, ParentComponent, useContext } from 'solid-js'
import { UserProfile } from '@spotify/web-api-ts-sdk';
import { locale, useDictionaries } from '../i18n/dictionary'
import { SpotifyStatus, useSpotifyApi } from './spotify-api-context'

const isAuthenticated = (status: Accessor<SpotifyStatus>) => status() === 'success'

function logOut() {

	const { api, status } = useSpotifyApi();

	if (!isAuthenticated(status)) {
		setIsAuthenticating(false)
		return;
	}

	api.logOut();
	setIsAuthenticating(false)
}
async function logIn() {

	const { api, status } = useSpotifyApi();
	if (isAuthenticated(status)) {
		setIsAuthenticating(false);
	}
	localStorage.setItem('stored-locale', locale());
	setIsAuthenticating(true)
	const response = await api.authenticate();

	// This means the browser is redirected
	if (response.accessToken.access_token === "emptyAccessToken") return

	const currentProfile = await api.currentUser.profile();
	setProfile(currentProfile);
	setIsAuthenticating(false)
}

export type SpotifyContext = {
	logOut: () => void
	logIn: () => Promise<void>
	isAuthenticating: Accessor<boolean>,
	isAuthenticated: Accessor<boolean>,
	isValid: Accessor<boolean>,
	errorMessage: Accessor<string | undefined>,
	profile: Accessor<UserProfile | undefined>,
}

const [isAuthenticating, setIsAuthenticating] = createSignal(false);
const [profile, setProfile] = createSignal<UserProfile>()

const spotifyContext = createContext<SpotifyContext>({
	logIn,
	logOut,
	isAuthenticating,
	isAuthenticated: () => false,
	isValid: () => false,
	profile,
	errorMessage: () => undefined
})
export const useSpotifyContext = () => useContext(spotifyContext);

export const SpotifyContext: ParentComponent = ({ children: childrenInScope }) => {

	const { api, status } = useSpotifyApi();
	const { dictionary } = useDictionaries();

	onMount(async () => {
		const hasExistingToken = await api.getAccessToken().then(t => !!t);
		if (hasExistingToken) {
			 setIsAuthenticating(true);
			 await logIn();
		}
	})

	const isAuthenticatedMemo = createMemo(() => isAuthenticated(status), status)
	const checkValid = () => isAuthenticatedMemo() && profile()?.product === 'premium'
	const errorMessage = () => {
		if(!status()) return undefined;
		if(status() === 'success') return undefined;

		if (status() === 'error.access_denied') return dictionary().spotify.errors.access_denied;

		return dictionary().spotify.errors.unknown;
	}

	return <spotifyContext.Provider value={{
		...spotifyContext.defaultValue,
		isValid: createMemo(checkValid, isAuthenticated),
		isAuthenticated: isAuthenticatedMemo,
		errorMessage
	}}>
		{children(() => childrenInScope)()}
	</spotifyContext.Provider>
}