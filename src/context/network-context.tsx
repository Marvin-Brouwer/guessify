import { Accessor, children, createContext, createMemo, createSignal, onCleanup, onMount, ParentComponent, useContext } from 'solid-js'

export type NetworkStatus = 'online' | 'slow' | 'offline'
const [status, setStatus] = createSignal<NetworkStatus>(window.navigator.onLine ? 'online' : 'offline')
const online = createMemo(() => status() !== 'offline', status)

export type NetworkContext = {
	status: Accessor<NetworkStatus>
	online: Accessor<boolean>
}

const networkContext = createContext<NetworkContext>({
	status,
	online
})
export const useNetworkStatus = () => useContext(networkContext);

export const NetworkStatusContext: ParentComponent = (props) => {

	const handleOnline = () => setStatus( 'online')
	const handleOffline = () => setStatus( 'offline')

	onMount(() => {
		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)
	})
	onCleanup(() => {
		window.removeEventListener('online', handleOnline)
		window.removeEventListener('offline', handleOffline)
	})

	return <networkContext.Provider value={networkContext.defaultValue}>
		{children(() => props.children)()}
	</networkContext.Provider>
}