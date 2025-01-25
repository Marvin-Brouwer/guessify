import * as i18n from "@solid-primitives/i18n"
import { Accessor, createMemo, createSignal, JSX, onMount } from 'solid-js';
import { default_dictionary } from './dictionaries/_default'
import { nl_dictionary } from './dictionaries/nl'
import { useParams, useHref } from '@solidjs/router'

export type Dictionary = typeof default_dictionary

const dictionaries = {
	en: default_dictionary,
	nl: nl_dictionary
}
export type Locale = keyof typeof dictionaries
// Using signal so we can access this everywhere
const storedLocale = localStorage.getItem('stored-locale') as Locale | undefined
const [getLocale, setLocale] = createSignal<Locale>(storedLocale ?? 'en');
export const locale = getLocale;

export type Dictionaries = {
	locale: Accessor<Locale>
	dictionary: Accessor<Dictionary>
	template: i18n.TemplateResolver<string | NonNullable<JSX.Element>>
}

function parseLocale(){
	const routeParams = useParams();

	const routeLocale = (routeParams.locale && Object.keys(dictionaries).includes(routeParams.locale))
		? routeParams.locale as Locale
		: undefined

	setLocale(routeLocale ?? storedLocale ?? 'en')
	if(routeLocale) localStorage.setItem('stored-locale', routeLocale)
}
export const useDictionaries: Accessor<Dictionaries> = () => {

	onMount(parseLocale)

	const dictionary = createMemo(() => dictionaries[locale()], [useHref, locale])

	return {
		locale,
		dictionary,
		template: i18n.resolveTemplate
	}
}