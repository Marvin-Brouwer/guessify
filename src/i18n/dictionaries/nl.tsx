import { Dictionary } from '../dictionary'

export const nl_dictionary: Dictionary = {
	common: {
		close: 'Sluiten'
	},
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
	},
	camera: {
		title: 'Video camera',
		permissions: {
			title: 'Browser toestemming herstellen',
			permissionLink: 'uw browser toestemming herstellen',
			explainer: `Wij konden geen uitleg vinden voor jouw browser, probeer a.u.b. in uw instellingen te zoeken hoe u de camera toestemming kunt herstellen.`,
			cta: [
				'Wilt u a.u.b. ook ',
				'een verzoek indienen',
				' om uw eigen browser toe te voegen aan onze instructies?'
			]
		}
	}
}