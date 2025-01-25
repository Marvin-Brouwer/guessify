import { Component, createEffect, createMemo, createSignal } from 'solid-js'

import './spotify-card.css'
import profilePlaceHolder from '../assets/account_circle_24dp_E8EAED.svg'
import premiumIcon from '../assets/verified_24dp_E8EAED.svg'
import noPremiumIcon from '../assets/warning_24dp_E8EAED.svg'
import logoutIcon from '../assets/logout_24dp_E8EAED.svg'
import loginIcon from '../assets/login_24dp_E8EAED.svg'

import { useSpotifyContext } from '../context/spotify-context'
import { useDictionaries } from '../i18n/dictionary'
import { useCameraContext } from '../context/camera-context'

export const SpotifyCard: Component = () => {

	const spotifyContext = useSpotifyContext()
	const { hasMediaSupport } = useCameraContext()

	// No use logging in if we don't have a camera
	if (!hasMediaSupport()) return null

	const { dictionary } = useDictionaries()

	const activeCard = createMemo(() => {
		if (!spotifyContext.isAuthenticating() && spotifyContext.isAuthenticated())
			return <SpotifyProfileCard />

		return <SpotifyLoginCard />
	}, [spotifyContext.isAuthenticated, spotifyContext.isAuthenticating])

	return <div class='spotify-card'>
		<h2>{dictionary().spotify.title}</h2>
		{activeCard()}
	</div>
}
const SpotifyLoginCard: Component = () => {

	const spotifyContext = useSpotifyContext()
	const { dictionary } = useDictionaries()

	return <>
		<div class='spotify-login-card card'>
			<div class="details">
				<p>{dictionary().spotify.explainer[0]}</p>
				<p>{dictionary().spotify.explainer[1]}</p>
				{spotifyContext.errorMessage() && <p class='error'>
					{spotifyContext.errorMessage()}
				</p>}
			</div>
			<div class="controls">
				<button disabled={spotifyContext.isAuthenticating()} onclick={() => {
					spotifyContext.logIn()
				}}>
					{spotifyContext.isAuthenticating()
						? <span>{dictionary().spotify.signingIn}</span>
						: <span>{dictionary().spotify.signIn}</span>
					}
					{!spotifyContext.isAuthenticating() && <img src={loginIcon} />}
				</button>
			</div>
		</div>
	</>
}

const SpotifyProfileCard: Component = () => {

	const spotifyContext = useSpotifyContext()
	const { dictionary } = useDictionaries()

	const profile = spotifyContext.profile()
	if (!profile) return null

	// TODO find a way to downscale to getClientRect
	const profileThumbnail = profile.images?.find(image => image.width === 300) ?? undefined
	const [image, setImage] = createSignal(<img src={profilePlaceHolder} class="placeholder" />)

	createEffect(() => {
		if (!profileThumbnail) return
		if ((image() as HTMLImageElement).src === profileThumbnail.url) return

		const profileImage = ((image() as Node).cloneNode(true)) as HTMLImageElement
		profileImage.className = ''
		profileImage.addEventListener('load', () => setImage(profileImage), { once: true })
		profileImage.src = profileThumbnail.url

	}, profileThumbnail)

	const hasPremium = spotifyContext.isValid()

	return <div class='spotify-profile-card card'>
		<div class="thumbnail">{image()}</div>
		<p class="stats">
			<b>{dictionary().spotify.stats.country}</b>
			<i>{profile.country}</i>
		</p>
		<p class="stats">
			<b>{dictionary().spotify.stats.followers}</b>
			<i>{profile.followers.total}</i>
		</p>
		<p class="stats">
			<b>{dictionary().spotify.stats.premium}</b>
			<i>
				<img src={hasPremium ? premiumIcon : noPremiumIcon} />
			</i>
		</p>

		<div class="details">
			<h3>{profile.display_name}</h3>
			{hasPremium
				? <p>{dictionary().spotify.details.hasPremium}</p>
				: <>
					<p class="no-premium">{dictionary().spotify.details.noPremium}</p>
					<p>{dictionary().spotify.explainer[1]}</p>
				</>
			}
		</div>
		<div class="controls">
			<button onclick={() => spotifyContext.logOut()}>
				<span>{dictionary().spotify.signOut}</span>
				<img src={logoutIcon} />
			</button>
		</div>
	</div>
}