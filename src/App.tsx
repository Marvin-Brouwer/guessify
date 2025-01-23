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
				<p>TODO</p>
			</DependencyGate>
		</>
	)
}

export default App