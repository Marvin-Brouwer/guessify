/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'

import './index.css'
import { LandingPage, MainApp, SpotifyLoginRedirect } from './app';
import { SpotifyApiContext } from './context/spotify-api-context'
import { NetworkStatusContext } from './context/network-context'

const root = document.getElementById('root')

const filterGhPagesUrl = (url: string) => url
	.replace(import.meta.env.BASE_URL + '/?', import.meta.env.BASE_URL);

render(() => <>
	<NetworkStatusContext>
		<SpotifyApiContext>
			{/* For some reason the solid navigation fails on the homepage */}
			{/* So we turn on explicitLinks ans use normal anchors */}
			<Router base={import.meta.env.BASE_URL} explicitLinks={true} transformUrl={filterGhPagesUrl}>
				<Route path="/spotify-auth" component={SpotifyLoginRedirect} />
				<Route path="/:locale/" component={MainApp} />
				<Route path="/" component={LandingPage} />
				{/* TODO 404 */}
				<Route path="*404" component={LandingPage} />
			</Router>
		</SpotifyApiContext>
	</NetworkStatusContext>
</>, root!)