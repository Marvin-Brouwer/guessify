import { defineConfig } from 'vite'

import eslint from 'vite-plugin-eslint';
import solid from 'vite-plugin-solid'

export default defineConfig({
	appType: 'spa',
	server: {
		port: 5173
	},
	plugins: [
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