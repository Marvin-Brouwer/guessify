export const default_dictionary = {
	common: {
		close: 'Close',
		offline: 'You appear to be offline, please check your network connection',
		refresh: 'Refresh page',
		share: 'Share Guessify',
		unhandledError: {
			title: 'Something went wrong.',
			details: 'Details',
			explainer: [
				'The application has encountered an unhandled error, please try again.',
				// TODO
				'If this problem persists, please file a bug report, using the details below.',
				'Closing this message will restart the application.'
			]
		}
	},
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
	},
	camera: {
		title: 'Camera',
		inUse: 'Your camera is being used by another process, please close and try again.',
		type: {
			'desktop': 'Desktop\ncamera',
			'user': 'Selfie\ncamera',
			'environment': 'Environment\ncamera',
			'unknown': 'Camera',
			'loading': ''
		},
		openingCam: 'Connecting...',
		explainer: [
			`To be able to scan the codes, we need access to your device's camera.`,
			`Please, give your browser permission to access the camera.`
		],
		noSupport: [
			`Your device likely doesn't have a camera, or your system doesn't allow your browser to access the camera.`,
			`Sadly, you cannot use the app.`
		],
		noPermission: [
			`Your browser doesn't have the correct permissions, possibly you denied the use of the camera.`,
			`To use this application, you need to `
		],
		selectedCamera: `You selected "{{label}}" to scan the codes.`,
		switchBanner: `When using the app, you can change the camera at any time.`,
		requestPermission: 'Request permission',
		requestingPermission: 'Requesting permission...',
		permissions: {
			title: 'Reset browser permissions',
			permissionLink: 'reset your browser permissions',
			deviceDetails: 'Device details',
			explainer: `We couldn't find a page for your browser, please look in your settings to reset the browser permissions.`,
			cta: [
				'If you like, you can ',
				'file a request',
				' to add your browser to our instructions.'
			]
		}
	}
}