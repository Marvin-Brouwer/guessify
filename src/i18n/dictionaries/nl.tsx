import { Dictionary } from '../dictionary'

export const nl_dictionary: Dictionary = {
	common: {
		close: 'Sluiten',
		offline: 'U bent offline, controleer a.u.b. uw verbinding',
		unhandledError: {
			title: 'Er is iets mis gegaan.',
			details: 'Foutgegevens',
			explainer: [
				'Er heeft zich een niet afgehandelde fout voorgedaan, probeer a.u.b. opniew.',
				// TODO
				'Als dit probleem aan blijft houden, verzoeken wij u vriendelijk een bug rapport in te schieten met de onderstaande gegevens.',
				'Het sluiten van dit bericht zal de applicatie herstarten.'
			]
		}
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
		type: {
			'desktop': 'Desktop\ncamera',
			'user': 'Selfie\ncamera',
			'environment': 'Achterkant\ncamera',
			'unknown': 'Camera',
			'loading': ''
		},
		openingCam: 'Verbinden...',
		explainer: [
			`Om de codes te kunnen scannen hebben wij toegang nodig tot uw camera.`,
			`Verleen uw browser a.u.b. toegang tot de camera.`
		],
		noSupport: [
			`Uw apparaat heeft mogelijk geen camera, of uw besturingssysteem staat het gebruik hiervan niet toe.`,
			'Helaas kunt u deze applicatie niet gebruiken.'
		],
		noPermission: [
			`Uw browser geeft geen toestemming tot het gebruik van de camera. Mogelijk heeft u de toestemming geweigerd.`,
			`Om gebruik te kunnen maken van de camera moet u `
		],
		selectedCamera: `U heeft "{{label}}" geselecteerd voor het scannen.`,
		switchBanner: `U kunt dit later altijd nog veranderen.`,
		requestPermission: 'Vraag toestemming',
		requestingPermission: 'Toestemming vragen...',
		permissions: {
			title: 'Browser toestemming herstellen',
			deviceDetails: 'Apparaat details',
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