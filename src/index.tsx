/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'

import './index.css'
import { AppRoot, LandingPage, MainApp } from './app'
import { SpotifyAuthHandler } from './components/spotify-auth'

const root = document.getElementById('root')

const filterGhPagesUrl = (url: string) => url
	.replace(import.meta.env.BASE_URL + '/?', import.meta.env.BASE_URL)

// For some reason the solid navigation fails on the homepage
// So we turn on explicitLinks ans use normal anchors
render(() =>
	<Router base={import.meta.env.BASE_URL} explicitLinks={true} transformUrl={filterGhPagesUrl} root={AppRoot}>
		<Route path="/spotify-auth" component={SpotifyAuthHandler} />
		<Route path="/:locale/" component={MainApp} />
		<Route path="/" component={LandingPage} />
		{/* TODO 404 */}
		<Route path="*404" component={LandingPage} />
	</Router>,
	root!
)