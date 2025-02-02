import './app-dropdown.pcss'

import { Component, JSX, Accessor, Show, createMemo } from 'solid-js'
import chevronIcon from '../../assets/unfold_more_24dp_E8EAED.svg'

type SelectProps = JSX.ButtonHTMLAttributes<HTMLSelectElement>
type OnChange = JSX.ChangeEventHandler<HTMLSelectElement, Event>
export type SelectValue = { id: string, text: string }
export type AppDropdownButtonProps = {
	value: Accessor<string | undefined>
	options: Accessor<SelectValue[]>
	disabled?: Accessor<SelectProps['disabled']> | undefined
	disabledLabel?: string | undefined
	selectImageUrl?: string | undefined | boolean
	onChange: (event: Parameters<OnChange>[0], selectedValue: string, previousValue: string | undefined) => void
}
export const AppDropdownButton: Component<AppDropdownButtonProps> = ({ disabled, value, onChange, options, selectImageUrl, disabledLabel }) => {

	const text = createMemo(() => options().find(({ id }) => id === value())?.text, [options, value])
	const selectOptions = createMemo(() => options()
		.map(({ id, text }) => <option value={id} selected={id === value()}>{text}</option>
		), [value, options])
	const buttonDisabled = createMemo(() => disabled ? disabled() : false, disabled)
	const dropdownVisible = createMemo(() => options().length > 1, options)

	const showIcon = createMemo(() => selectImageUrl !== false && dropdownVisible(), [dropdownVisible, selectImageUrl])

	const selectIcon = createMemo(() => {
		if(!showIcon()) return undefined
		if (!selectImageUrl) return chevronIcon
		return selectImageUrl as string
	}, [showIcon, selectImageUrl])

	return <div class="app-dropdown">
		<Show when={dropdownVisible()} fallback={undefined}>
			<select disabled={buttonDisabled()} onChange={async (e) => {
				if (e.target.value === value()) return
				const selectedValue = e.target.value
				const previousValue = value()

				onChange(e, selectedValue, previousValue)
			}}>
				{selectOptions()}
			</select>
		</Show>
		<div class={!buttonDisabled() ? "fake-button" : "fake-button disabled"}>
			<span>{(buttonDisabled() && disabledLabel) ? disabledLabel : text()}</span>
			<Show when={showIcon()}fallback={undefined}>
				<img src={selectIcon()} />
			</Show>
		</div>
	</div>
}