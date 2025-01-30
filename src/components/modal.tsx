import { children, JSXElement, onCleanup, onMount, ParentProps, createSignal, Component } from 'solid-js';
import { useDictionaries } from '../i18n/dictionary'

import './modal.pcss'
import closeIcon from '../assets/close_24dp_E8EAED.svg'
import { Portal } from 'solid-js/web'

export type ModalProps = {
	class?: string | undefined,
	beforeClose?: () => void | boolean
}
export type ModalElement = NonNullable<JSXElement>
export type ModalComponent = (props: ParentProps<ModalProps>) => NonNullable<ModalElement>
export type CreateModal = () => { Modal: ModalComponent, showModal: () => void }

// https://stackoverflow.com/a/26984690
const checkBackdropClick = (modalElement: HTMLDialogElement) => (event: MouseEvent) => {
	if (modalElement.hidden) return
	const rect = modalElement.getBoundingClientRect()
	const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
		rect.left <= event.clientX && event.clientX <= rect.left + rect.width)
	if (!isInDialog) {
		modalElement.close()
	}
}

export const createModal: CreateModal = () => {

	const { dictionary } = useDictionaries();
	const [modalElement, setModalElement] = createSignal<HTMLDialogElement>()


	const Modal: Component<ParentProps<ModalProps>> = (props) => {
		const renderChildren = children(() => props.children);
		setModalElement(
			<dialog>
				<div class={`modal card ${props.class}`}>
					<div class="details">
						{renderChildren()}
					</div>
					<div class="controls">
						<button onClick={onCloseClick}>
							<span>{dictionary().common.close}</span>
							<img src={closeIcon} />
						</button>
					</div>
				</div>
			</dialog> as HTMLDialogElement
		)

			function onCloseClick() {
				if (!props.beforeClose) return modalElement()?.close()
				if (props.beforeClose() !== false) modalElement()?.close()
			}

		onMount(() => {
			modalElement()?.addEventListener('click', checkBackdropClick(modalElement()!))
		})
		onCleanup(() => {
			modalElement()?.removeEventListener('click', checkBackdropClick(modalElement()!))
		})

		return <Portal>{modalElement()}</Portal> as JSXElement
	}

	return {
		Modal: Modal as ModalComponent,
		showModal: import.meta.env.PROD
			? () => modalElement()?.showModal()
			: () => {
				if (!modalElement()) console.warn('A modal has been requested without rendering on the page!')
				modalElement()?.showModal()
			}
	}
}