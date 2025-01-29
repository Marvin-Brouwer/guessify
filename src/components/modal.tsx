import { JSXElement, onCleanup, onMount, ParentProps } from 'solid-js'
import { useDictionaries } from '../i18n/dictionary'

import './modal.pcss'
import closeIcon from '../assets/close_24dp_E8EAED.svg'

export type ModalProps = {
	class?: string | undefined,
	beforeClose?: () => void | boolean
}
export type ModalElement = NonNullable<JSXElement>
export type ModalComponent = (props: ParentProps<ModalProps>) => NonNullable<ModalElement>;

export const showModal = (modal: ModalElement) => {
	// Solid behaves differently between production and dev mode.
	// TODO perhaps making a modalContext is a better option
	if (modal instanceof HTMLDialogElement === false) (modal as unknown as () => HTMLDialogElement)().showModal()
	else (modal as unknown as HTMLDialogElement).showModal()
}
export const Modal: ModalComponent = ({ children, class: classname, beforeClose }) => {

	const { dictionary } = useDictionaries();
	const onCloseClick = () => {
		if(!beforeClose) return modalElement.close();
		if(beforeClose() !== false) modalElement.close();
	}

	const modal = <dialog>
		<div class={`modal card ${classname}`}>
			<div class="details">
				{children}
			</div>
			<div class="controls">
				<button onClick={onCloseClick}>
					<span>{dictionary().common.close}</span>
					<img src={closeIcon} />
				</button>
			</div>
		</div>
	</dialog>
	const modalElement = modal as HTMLDialogElement

	const checkBackdropClick = (_event: MouseEvent) => {
		if (modalElement.hidden) return
		// https://stackoverflow.com/a/26984690
		modalElement.addEventListener('click', function (event) {
			const rect = modalElement.getBoundingClientRect()
			const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX && event.clientX <= rect.left + rect.width)
			if (!isInDialog) {
				modalElement.close()
			}
		}, { once: true })
	}

	onMount(() => {
		modalElement.addEventListener('click', checkBackdropClick)
	})
	onCleanup(() => {
		modalElement.removeEventListener('click', checkBackdropClick)
	})

	return modal as ModalElement
};