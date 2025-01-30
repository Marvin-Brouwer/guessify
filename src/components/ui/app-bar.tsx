import { Component } from 'solid-js'

import './app-bar.pcss'
import logo from '../../../public/guessify-logo.svg'
import menuIcon from '../../assets/menu_24dp_E8EAED.svg'
import { createModal } from './modal'

export const AppBar: Component = () => {

	const { Modal, showModal } = createModal();

	return <header>
		<h1 class="logo"><img src={logo} /><span>Guessify</span></h1>
		<nav>
			<button onClick={showModal}>
				<img src={menuIcon} />
				<span>Menu</span>
			</button>
		</nav>
		<Modal>
			<Menu />
		</Modal>
	</header>
}

const Menu: Component = () => {

	return <div>
		<h2 class="logo"><img src={logo} /> <span>Guessify</span> <i>{import.meta.env['VITE_APP_VERSION']}</i></h2>
		<p>TODO: This is where you can change camera/language/share the app/logout</p>
	</div>

}