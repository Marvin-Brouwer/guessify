import { children, JSXElement, onCleanup, ParentProps, createSignal, Component, onMount, Accessor } from 'solid-js'
import { useDictionaries } from '../../i18n/dictionary'

import './modal.pcss'
import closeIcon from '../../assets/close_24dp_E8EAED.svg'
import { Portal } from 'solid-js/web'
import { AppButton } from '../controls/app-button'

export type ModalProps = {
	class?: string | undefined,
	beforeClose?: () => void | boolean
}
export type ModalElement = NonNullable<JSXElement>
export type ModalComponent = (props: ParentProps<ModalProps>) => NonNullable<ModalElement>
export type CreateModal = () => { Modal: ModalComponent, showModal: () => void, closeModal: () => void }

// https://stackoverflow.com/a/26984690
const checkBackdropClick = (modalElement: HTMLDialogElement, close: Accessor<() => void>) => (event: MouseEvent) => {
	if (modalElement.hidden) return
	const rect = modalElement.getBoundingClientRect()
	const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
		rect.left <= event.clientX && event.clientX <= rect.left + rect.width)
	if (!isInDialog) {
		close()()
	}
}

export const createModal: CreateModal = () => {

	const { dictionary } = useDictionaries()
	const [modalElement, setModalElement] = createSignal<HTMLDialogElement>()
	const [opened, setOpened] = createSignal(false)
	const [onClose, setOnClose] = createSignal(() => {modalElement()?.close()})

	const Modal: Component<ParentProps<ModalProps>> = (props) => {
		const renderChildren = () => opened() ? children(() => props.children)() : children(() => undefined)()
		setModalElement(
			<dialog class="app-dialog" inert={!opened()}>
				<div class={`modal ${props.class ?? ''}`}>
					<div class="details">
						{renderChildren()}
					</div>
					<div class="controls">
						<AppButton
							text={dictionary().common.close}
							imageUrl={closeIcon}
							onClick={onClose()}
						/>
					</div>
				</div>
			</dialog> as HTMLDialogElement
		)
		setOnClose(() => () => {
			if (!props.beforeClose) {
				setOpened(false)
				return modalElement()?.close()
			}
			if (props.beforeClose() !== false) {
				setOpened(false)
				modalElement()?.close()
			}
		})

		onMount(() => {
			modalElement()?.addEventListener('click', checkBackdropClick(modalElement()!, onClose))
		})
		onCleanup(() => {
			modalElement()?.removeEventListener('click', checkBackdropClick(modalElement()!, onClose))
		})

		return <Portal>{modalElement()}</Portal> as JSXElement
	}

	return {
		Modal: Modal as ModalComponent,
		showModal: import.meta.env.PROD
			? () => {
				setOpened(true)
				modalElement()?.showModal()
			}
			: () => {
				if (!modalElement()) console.warn('A modal has been requested without rendering on the page!')
				modalElement() && setOpened(true)
				modalElement()?.showModal()
			},
		closeModal: () => onClose()()
	}
}