import './app-button.pcss';

import { Component, JSX, Show } from 'solid-js'

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>
export type AppButtonProps = Pick<ButtonProps, 'disabled' | 'onClick'> & {
	text: string
	imageUrl?: string | undefined | false
}
export const AppButton: Component<AppButtonProps> = ({ text, imageUrl, ...props}) => {
	return <button class='app-button' {...props}>
		<span>{text}</span>
		<Show when={imageUrl}><img src={imageUrl as string} /></Show>
	</button>
}