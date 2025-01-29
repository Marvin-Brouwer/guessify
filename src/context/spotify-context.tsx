import { Accessor, children, createContext, createMemo, createSignal, onMount, ParentComponent, useContext } from 'solid-js'
import { UserProfile } from '@spotify/web-api-ts-sdk'
import { Locale, storeLocale, useDictionaries } from '../i18n/dictionary'
import { SpotifyStatus, useSpotifyApi } from './spotify-api-context'
import { ErrorWithRestore } from '../components/uncaught-error-boundary'

const isAuthenticated = (status: Accessor<SpotifyStatus>) => status() === 'success'

function logOut() {

	const { api, status } = useSpotifyApi()

	if (!isAuthenticated(status)) {
		setIsAuthenticating(false)
		return
	}

	api.logOut()
	setIsAuthenticating(false)
}
async function logIn(locale: Locale) {

	const { api, status } = useSpotifyApi()

	if (isAuthenticated(status)) {
		setIsAuthenticating(false)
	}
	storeLocale(locale)
	setIsAuthenticating(true)

	try {
		const response = await api.authenticate()

		// This means the browser is redirected
		if (response.accessToken.access_token === "emptyAccessToken") return

		const currentProfile = await api.currentUser.profile()
		setProfile(currentProfile)
	}
	catch (err) {
		const error = err as ErrorWithRestore

		error.restore = () => {
			if (error.message.includes(`Unfortunately, re-authenticating the user won't help here`))
				localStorage.removeItem('spotify-sdk:AuthorizationCodeWithPKCEStrategy:token')
		}
		throw error
	} finally {
		setIsAuthenticating(false)
	}
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

const [isAuthenticating, setIsAuthenticating] = createSignal(false)
const [profile, setProfile] = createSignal<UserProfile>()

const spotifyContext = createContext<SpotifyContext>({
	logIn: () => Promise.resolve(),
	logOut: () => Promise.resolve(),
	isAuthenticating,
	isAuthenticated: () => false,
	isValid: () => false,
	profile,
	errorMessage: () => undefined
})
export const useSpotifyContext = () => useContext(spotifyContext)

export const SpotifyContext: ParentComponent = (props) => {

	const { api, status } = useSpotifyApi()
	const { dictionary, locale } = useDictionaries()

	onMount(async () => {
		const hasExistingToken = await api.getAccessToken().then(t => !!t)
		if (hasExistingToken) {
			setIsAuthenticating(true)
			await logIn(locale())
		}
	})

	const checkValid = () => isAuthenticated(status) && profile()?.product === 'premium'
	const errorMessage = () => {
		if (!status()) return undefined
		if (status() === 'success') return undefined

		if (status() === 'error.access_denied') return dictionary().spotify.errors.access_denied

		return dictionary().spotify.errors.unknown
	}

	return <spotifyContext.Provider value={{
		isValid: createMemo(checkValid, [status, profile]),
		isAuthenticated: createMemo(() => isAuthenticated(status), status),
		errorMessage,
		isAuthenticating,
		logIn: () => logIn(locale()),
		logOut,
		profile
	}}>
		{children(() => props.children)()}
	</spotifyContext.Provider>
}