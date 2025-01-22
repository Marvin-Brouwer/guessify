import { Dictionary } from '../dictionary'

export const nl_dictionary: Dictionary = {
	spotify: {
		title: 'Spotify',
		explainer: [
			<>
				Wilt u a.u.b met Spotify verbinden? <br />
				U moet ingelogd zijn bij Spotify om muziek in de browser te kunnen spelen.
			</>,
			'Spotify vereist een premuim account voor muziek in de browser.'
		],
		signingIn: 'Inloggen...',
		signIn: 'Log in bij Spotify',
		signOut: 'Uitloggen',
		errors: {
			access_denied: 'Toegang geweigerd, probeer opnieuw!',
			unknown: 'Er ging iets mis, probeer opnieuw!'
		},
		stats: {
			country: 'Land',
			followers: 'Volgers',
			premium: 'Premium',
		},
		details: {
			hasPremium: 'Spotify premium gebruiker.',
			noPremium: "Gebruiker heeft geen premium account!"
		}
	}
}