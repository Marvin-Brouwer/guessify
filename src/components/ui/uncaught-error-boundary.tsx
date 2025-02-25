import './uncaught-error-boundary.pcss'

import { children, Component, createSignal, ErrorBoundary, onCleanup, onMount, ParentProps } from 'solid-js'
import { createModal } from './modal'
import { useDictionaries } from '../../i18n/dictionary'
import { ErrorWithRestore } from '../../error'

export const UncaughtErrorBoundary: Component<ParentProps> = (props) => {

	const { dictionary } = useDictionaries()
	const [error, setError] = createSignal<ErrorWithRestore>()
	const versionDisplay = `Application Version: ${import.meta.env['VITE_APP_VERSION']}`
	const versionDivider = Array.from(versionDisplay).fill('-').join('')
	const { Modal, showModal } = createModal()

	const closeErrorModal = () => {
		// If it has a restore func call it.
		error()?.restore?.();
		window.location.reload()
		return false
	}

	const onError = (err: any) => {
		setError(err instanceof Error ? err : new Error(err))
		console.error('Uncaught application error', err)
		debugger
		showModal()
	}

	const handlePromiseRejection = (event: PromiseRejectionEvent) => {
		const rejection = event.reason instanceof Error
			? event.reason :
			Object.assign(new Error(event.reason), { stack: (event.promise as any).__creationPoint })
		onError(rejection)
	}
	const handleError = (event: ErrorEvent) => onError(event.error)
	onMount(() => {
		addEventListener("unhandledrejection", handlePromiseRejection)
		addEventListener("error", handleError)
	})
	onCleanup(() => {
		removeEventListener("unhandledrejection", handlePromiseRejection)
		removeEventListener("error", handleError)
	})

	return <>
		<ErrorBoundary fallback={(_err, _reset) => <></>}>
			{children(() => props.children)()}
		</ErrorBoundary>
		<Modal class='uncaught-error-modal' beforeClose={closeErrorModal}>
			<h1>{dictionary().common.unhandledError.title}</h1>
			<p>{dictionary().common.unhandledError.explainer[0]}</p>
			<p>{dictionary().common.unhandledError.explainer[1]}</p>

			{/* TODO maybe add a link to a bugreport? */}

			{error() && <>
				<details>
					<summary>{dictionary().common.unhandledError.details}</summary>
					<pre class="version">{versionDisplay} {'\n'}{versionDivider}</pre>
					{/* This exposes the error's callstack, normally this is a security flaw. */}
					{/* But also, normally this would be logged to a server, we don't have that. */}
					<pre>{error()!.stack?.toString() ?? error()!.toString()}</pre>
				</details>
				<p></p>
			</>}
			<p><i>{dictionary().common.unhandledError.explainer[2]}</i></p>
		</Modal>
	</>
}