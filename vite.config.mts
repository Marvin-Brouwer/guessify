import { defineConfig } from 'vite'

import packageJson from './package.json' with { type: 'json' }

// @ts-expect-error
import eslint from 'vite-plugin-eslint'
import solid from 'vite-plugin-solid'
import topLevelAwait from 'vite-plugin-top-level-await'
import htmlConfig from 'vite-plugin-html-config'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import postcssNesting from 'postcss-nesting';
// @ts-expect-error
import postcssDesignTokens from 'postcss-design-tokens';
import { viewfinderConstants } from './src/constants/viewfinder-constants';
// @ts-expect-error
import postCssImport from 'postcss-import'

import { connectAdb } from './plugins/vite-plugin-adb-connect.mjs'

const designTokens = {
	viewfinderConstants
}

// We'd like to display this in the settings menu
process.env.VITE_APP_VERSION = packageJson.version

const devHostEnabled = process.argv.includes('--host')

export default defineConfig({
	appType: 'spa',
	base: '/guessify',
	server: {
		port: 5173
	},
	build: {
		target: 'esnext'
	},
	plugins: [
		devHostEnabled ? basicSsl() : undefined,
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
		solid(),
		htmlConfig({
			metas: [
				// This is mainly to check whether deploy was successful
				{
					name: 'version',
					content: packageJson.version
				}
			]
		}),
		viteStaticCopy({
			targets: [
				{
					src: './404.html',
					dest: ''
				}
			]
		}),
		connectAdb()
	],
	css: {
		postcss: {
			plugins: [
				postCssImport(),
				postcssNesting,
				postcssDesignTokens({ tokens: designTokens })
			]
		}
	}
})