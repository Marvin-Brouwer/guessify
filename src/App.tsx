import './app.css'

import { DependencyGate } from './dependency-gate'
import { CameraContext } from './context/camera-context'
import { SpotifyContext } from './context/spotify-context'

function App() {

	console.log(import.meta.env)
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