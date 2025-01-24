import * as i18n from "@solid-primitives/i18n"
import { Accessor, createMemo, JSX } from 'solid-js'
import { default_dictionary } from './dictionaries/_default'
import { nl_dictionary } from './dictionaries/nl'
import { useParams } from '@solidjs/router'

export type Dictionary = typeof default_dictionary

const dictionaries = {
	en: default_dictionary,
	nl: nl_dictionary
}
export type Locale = keyof typeof dictionaries

export type Dictionaries = {
	locale: Accessor<Locale>
	dictionary: Dictionary
	template: i18n.TemplateResolver<string | NonNullable<JSX.Element>>
}
export const useDictionaries: Accessor<Dictionaries> = () => {

	const locale = createMemo(() => {
		const routeParams = useParams();

		return (routeParams.locale && Object.keys(dictionaries).includes(routeParams.locale))
		? routeParams.locale as Locale
		: 'en'
	},useParams)

	const dict = createMemo<Dictionary>(() => dictionaries[locale()])

	return {
		locale,
		dictionary: dict(),
		template: i18n.resolveTemplate
	}
}