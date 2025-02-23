import { Accessor, children, createContext, createMemo, createSignal, onMount, ParentComponent, useContext } from 'solid-js'
import { UserProfile } from '@spotify/web-api-ts-sdk'
import { Locale, storeLocale, useDictionaries } from '../i18n/dictionary'
import { SpotifyStatus, useSpotifyApi } from './spotify-api-context'
import { ensureRejectionStack, ErrorWithRestore } from '../error'
import { decodeMediaRef } from '../spotify-decoder/decode-media-ref'

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
		const response = await ensureRejectionStack(() => api.authenticate())

		// This means the browser is redirected
		if (response.accessToken.access_token === "emptyAccessToken") return

		const currentProfile = await ensureRejectionStack(() => api.currentUser.profile())
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
	getMediaReference: (code: number[]) => Promise<string | undefined>,
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
	getMediaReference: (_: number[]) => Promise.resolve<string | undefined>(undefined),
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
		const hasExistingToken = await ensureRejectionStack(() => api.getAccessToken()).then(t => !!t)
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

	const getMediaReference = async (code: number[]): Promise<string | undefined> => {

		const mediaReference = await decodeMediaRef(code)
		if (!mediaReference) return

		const clientId = import.meta.env['VITE_SPOTIFY_CLIENT']
		const HEADERS_LUT = {
			"X-Client-Id": clientId,
			// "App-Platform": "web",
			"Accept": "*/*",
			"Content-Type": "application/json"
		}


		const MEDIA_REF_LUT_URL = "https://spclient.wg.spotify.com:443/scannable-id/id"

		// TODO, we're getting AUTH issues, I don't think spotify intends us to call this from web.
		try {
			// const auth = await fetch('https://open.spotify.com/get_access_token', {
			// 	method: 'GET',
			// 	credentials: 'include'
			// }).then(r => r.json())
			const test = await fetch(`${MEDIA_REF_LUT_URL}/${75845227563}?format=json`, {
				method: 'GET',
				headers: {
					...HEADERS_LUT,
					"Authorization": `Bearer ${(await api.getAccessToken())?.access_token}`
				},
				mode: 'cors',
				credentials: 'include'

			}).then(r => r.json())

			return test.target
		} catch (e) {
			return mediaReference.toString()
		}

	}

	return <spotifyContext.Provider value={{
		isValid: createMemo(checkValid, [status, profile]),
		isAuthenticated: createMemo(() => isAuthenticated(status), status),
		getMediaReference,
		errorMessage,
		isAuthenticating,
		logIn: () => logIn(locale()),
		logOut,
		profile
	}}>
		{children(() => props.children)()}
	</spotifyContext.Provider>
}