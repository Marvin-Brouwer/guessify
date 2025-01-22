import { Component, createEffect, createMemo, createSignal } from 'solid-js'

import './spotify-card.css'
import profilePlaceHolder from '../assets/account_circle_24dp_E8EAED.svg'
import premiumIcon from '../assets/verified_24dp_E8EAED.svg'
import noPremiumIcon from '../assets/warning_24dp_E8EAED.svg'
import logoutIcon from '../assets/logout_24dp_E8EAED.svg'
import loginIcon from '../assets/login_24dp_E8EAED.svg'

import { useSpotifyContext } from '../context/spotify-context'

export const SpotifyCard: Component = () => {

	const spotifyContext = useSpotifyContext();

	const activeCard = createMemo(() => {
		if (!spotifyContext.isAuthenticating() && spotifyContext.isAuthenticated())
			return <SpotifyProfileCard />

		return <SpotifyLoginCard />
	}, [spotifyContext.isAuthenticated, spotifyContext.isAuthenticating])

	return <div class='spotify-card'>
		<h2>Spotify</h2>
		{activeCard()}
	</div>
}
const SpotifyLoginCard: Component = () => {

	const spotifyContext = useSpotifyContext();

	return <>
		<div class='spotify-login-card card'>
			<div class="details">
				<p>Please connect to spotify. <br/>
				We need you to log into spotify to be able to play music in the browser.</p>
				<p>For spotify to allow this app to play music, your account needs to be a premium subscription</p>
				{spotifyContext.errorMessage() && <p class='error'>
					{spotifyContext.errorMessage()}
				</p>}
			</div>
			<div class="controls">
				<button disabled={spotifyContext.isAuthenticating()} onclick={() => {
					spotifyContext.logIn()
				}}>
					{spotifyContext.isAuthenticating()
						? <span>Signing in</span>
						: <span>Sign in to spotify</span>
					}
					{!spotifyContext.isAuthenticating() && <img src={loginIcon} />}
				</button>
			</div>
		</div>
	</>
}

const SpotifyProfileCard: Component = () => {

	const spotifyContext = useSpotifyContext();

	const profile = spotifyContext.profile();
	if(!profile) return null;

	// TODO find a way to downscale to getClientRect
	const profileThumbnail = profile.images?.find(image => image.width === 300) ?? undefined;
	const [image, setImage] = createSignal(<img src={profilePlaceHolder} class="placeholder" />);

	createEffect(() =>{
		if (!profileThumbnail) return;
		if ((image() as HTMLImageElement).src === profileThumbnail.url) return

		console.info(`loading ${profileThumbnail.url}`)

		const profileImage = ((image() as Node).cloneNode(true)) as HTMLImageElement;
		profileImage.className = ''
		profileImage.addEventListener('load', () => { setImage(profileImage) ; console.log('yay'); }, { once: true });
		profileImage.src = profileThumbnail.url;

	}, profileThumbnail)

	const hasPremium = spotifyContext.isValid();

	console.log(profile)
	return <div class='spotify-profile-card card'>
		<div class="thumbnail">{image()}</div>
		<p class="stats">
			<b>Country</b>
			<i>{profile.country}</i>
		</p>
		<p class="stats">
			<b>Followers</b>
			<i>{profile.followers.total}</i>
		</p>
		<p class="stats">
			<b>Premium</b>
			<i>
				<img	src={hasPremium ? premiumIcon : noPremiumIcon} />
			</i>
		</p>

		<div class="details">
			<h3>{profile.display_name}</h3>
			{hasPremium
				? <p>Spotify premium user</p>
				: <>
					<p class="no-premium">User doesn't have premium account</p>
					<p>For spotify to allow this app to play music, your account needs to be a premium subscription</p>
				</>
			}
		</div>
		<div class="controls">
			<button onclick={() => spotifyContext.logOut()}>
				<span>Sign out</span>
				<img src={logoutIcon} />
			</button>
		</div>
	</div>
}