export const default_dictionary = {
	spotify: {
		title: 'Spotify',
		explainer: [
			<>
				Please connect to Spotify. <br />
				We need you to log into Spotify to be able to play music in the browser.
			</>,
			'For Spotify to allow this app to play music, your account needs to be a premium subscription.'
		],
		signingIn: 'Signing in...',
		signIn: 'Sign in to Spotify',
		signOut: 'Sign out',
		errors: {
			access_denied: 'Access denied, please try again!',
			unknown: 'Something went wrong, please try again!'
		},
		stats: {
			country: 'Country',
			followers: 'Followers',
			premium: 'Premium',
		},
		details: {
			hasPremium: 'Spotify premium user.',
			noPremium: "User doesn't have premium account!"
		}
	}
}