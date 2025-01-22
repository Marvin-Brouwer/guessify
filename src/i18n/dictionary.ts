import * as i18n from "@solid-primitives/i18n"
import { Accessor, createMemo, createSignal } from 'solid-js'
import { default_dictionary } from './dictionaries/_default'
import { nl_dictionary } from './dictionaries/nl'

export type Dictionary = typeof default_dictionary

const dictionaries = {
	en: default_dictionary,
	nl: nl_dictionary
}
export type Locale = keyof typeof dictionaries

const [locale, setLocale] = createSignal<Locale>("nl")

export type Dictionaries = {
	locale: Accessor<Locale>
	dictionary: Dictionary
	template: i18n.Translator<Dictionary>
}
export const useDictionaries: Accessor<Dictionaries> = () => {

	const dict = createMemo<Dictionary>(() => dictionaries[locale()])

	return {
		locale,
		dictionary: dict(),
		template: i18n.translator(dict)
	}
}