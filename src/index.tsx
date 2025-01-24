/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'

import './index.css'
import {LandingPage, MainApp} from './app.tsx'

const root = document.getElementById('root')

render(() => <Router>
	<Route path={`${import.meta.env.BASE_URL}:locale`} component={MainApp} />
	<Route path="*" component={LandingPage} />
</Router>, root!)