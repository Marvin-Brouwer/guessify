import { defineConfig } from 'vite'

// @ts-expect-error
import eslint from 'vite-plugin-eslint';
import solid from 'vite-plugin-solid'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
	appType: 'spa',
	base: '/guessify/',
	server: {
		port: 5173
	},
	build: {
		target: 'esnext'
	},
	plugins: [
		topLevelAwait(),
		{
			...eslint({
				failOnWarning: false,
				failOnError: true,
				fix: true,
				errorOnUnmatchedPattern: true,
				globInputPaths: true,
				overrideConfigFile: './.eslintrc.cjs'
			}),
			enforce: 'post'
		},
		solid()
	]
})