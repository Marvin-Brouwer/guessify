/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'

import './index.css'
import { LandingPage, MainApp, SpotifyLoginRedirect } from './app';
import { SpotifyApiContext } from './context/spotify-api-context'

const root = document.getElementById('root')

render(() => <>
	<SpotifyApiContext />
	<Router base={import.meta.env.BASE_URL}>
		<Route path="/spotify-auth" component={SpotifyLoginRedirect} />
		<Route path="/:locale" component={MainApp} />
		<Route path="/" component={LandingPage} />
		{/* TODO 404 */}
		<Route path="/*" component={LandingPage} />
	</Router>
</>, root!)