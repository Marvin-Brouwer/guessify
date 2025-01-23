import './app.css'

import { DependencyGate } from './dependency-gate'
import { CameraContext } from './context/camera-context'
import { SpotifyContext } from './context/spotify-context'

function App() {
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