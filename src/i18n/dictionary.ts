import * as i18n from "@solid-primitives/i18n"
import { Accessor, createEffect, createMemo, createSignal, JSX, onMount } from 'solid-js';
import { default_dictionary } from './dictionaries/_default'
import { nl_dictionary } from './dictionaries/nl'
import { useParams, useHref } from '@solidjs/router'

export type Dictionary = typeof default_dictionary

const dictionaries = {
	en: default_dictionary,
	nl: nl_dictionary
}
export type Locale = keyof typeof dictionaries
const locales = Object
	.getOwnPropertyNames(dictionaries)
	.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })) as Locale[]

export const getStoredLocale = () => localStorage.getItem('stored-locale') as Locale | undefined
export const storeLocale = (locale: Locale) => localStorage.setItem('stored-locale', locale)
export const rawDictionary = (locale: Locale) => {
	const supportedLocale = (locale && Object.keys(dictionaries).includes(locale))
		? locale
		: 'en'

	return dictionaries[supportedLocale];
}

const [locale, setLocale] = createSignal<Locale>(getStoredLocale() ?? 'en');

export type Dictionaries = {
	locale: Accessor<Locale>
	locales: Locale[]
	dictionary: Accessor<Dictionary>
	template: i18n.TemplateResolver<string | NonNullable<JSX.Element>>
}

function parseLocale(){
	const routeParams = useParams();

	const routeLocale = (routeParams.locale && Object.keys(dictionaries).includes(routeParams.locale))
		? routeParams.locale as Locale
		: undefined

	setLocale(routeLocale ?? getStoredLocale() ?? 'en')
	if(routeLocale) storeLocale(routeLocale)
}
export const useDictionaries: Accessor<Dictionaries> = () => {

	try {
		onMount(parseLocale)
	}
	catch (err) {
		// The useParams error doesn't trace very well when used outside of context.
		console.error(console.trace(), err)
	}

	createEffect(parseLocale, useHref)

	const dictionary = createMemo(() => dictionaries[locale()], [locale])

	return {
		locale,
		locales,
		dictionary,
		template: i18n.resolveTemplate
	}
}