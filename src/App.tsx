import { createSignal } from 'solid-js'
import solidLogo from './assets/compare_24dp_E8EAED.svg'
import viteLogo from './assets/play_arrow_24dp_E8EAED.svg'
import './app.css'
import { DependencyGate } from './dependency-gate'
import { CameraContext } from './context/camera-context'
import { SpotifyContext } from './context/spotify-context'

function App() {
	const [count, setCount] = createSignal(0)

	return (
		<>
			<SpotifyContext />
			<CameraContext />
			<DependencyGate>
				<div>
					<a href="https://vite.dev" target="_blank">
						<img src={viteLogo} class="logo" alt="Vite logo" />
					</a>
					<a href="https://solidjs.com" target="_blank">
						<img src={solidLogo} class="logo solid" alt="Solid logo" />
					</a>
				</div>
				<h1>Vite + Solid</h1>
				<div class="card">
					<button onClick={() => setCount((count) => count + 1)}>
						count is {count()}
					</button>
					<p>
						Edit <code>src/App.tsx</code> and save to test HMR
					</p>
				</div>
				<p class="read-the-docs">
					Click on the Vite and Solid logos to learn more
				</p>
			</DependencyGate>
		</>
	)
}

export default App