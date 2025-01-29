import './uncaught-error-boundary.pcss';

import { children, Component, createSignal, ErrorBoundary, onCleanup, onMount, ParentProps } from 'solid-js'
import { Modal, ModalElement } from './modal'
import { useDictionaries } from '../i18n/dictionary'

export type ErrorWithRestore<T extends Error = Error> = T & { restore?: () => void }
export const UncaughtErrorBoundary: Component<ParentProps> = (props) => {

	const { dictionary } = useDictionaries()
	const [error, setError] = createSignal<ErrorWithRestore>()

	const closeErrorModal = () => {
		// If it has a restore func call it.
		error()?.restore?.();
		window.location.reload();
		return false;
	}

	const modal = (<Modal class='uncaught-error-modal' beforeClose={closeErrorModal}>
		<h1>{dictionary().common.unhandledError.title}</h1>
		<p>{dictionary().common.unhandledError.explainer[0]}</p>
		<p>{dictionary().common.unhandledError.explainer[1]}</p>

		{/* TODO maybe add a link to a bugreport? */}

		{error() && <>
			<details>
				<summary>{dictionary().common.unhandledError.details}</summary>
				{/* This exposes the error's callstack, normally this is a security flaw. */}
				{/* But also, normally this would be logged to a server, we don't have that. */}
				<pre>{error()!.stack?.toString() ?? error()!.toString()}</pre>
			</details>
			<p></p>
		</>}
		<p><i>{dictionary().common.unhandledError.explainer[2]}</i></p>
	</Modal>) as ModalElement

	const onError = (err: any) => {
		setError(err instanceof Error ? err : new Error(err))
		modal().showModal()
	}

	const handlePromiseRejection = (event: PromiseRejectionEvent) => onError(event.reason)
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
		{modal}
		<ErrorBoundary fallback={(_err, _reset) => null}>
			{children(() => props.children)()}
		</ErrorBoundary>
	</>
}