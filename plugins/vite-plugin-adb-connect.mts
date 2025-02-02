import { spawn } from 'node:child_process'
import { createLogger, loadEnv, type Plugin } from 'vite'
import { getAndroidToolPath } from "android-tools-bin"
import chalk from 'chalk'
import { asyncExitHook } from 'exit-hook'

const keys = {
	ADB_CONNECT_DEVICES: 'ADB_CONNECT_DEVICES' as const,
	CLEANUP_CONFIGURED: (pluginName: string) => `PLUGIN_CLEANUP_CONFIGURED_${pluginName}` as const
}

/**
 * ## `vite-plugin-connect-adb`
 *
 * Plugin to connect your android phone's chrome browser to your local chrome browser's remote debugging.
 *
 * To use, find your phone's local ip address and debug port by opening the "remote debugging" setting,
 * in the developer settings. \
 * This is both a toggle and a settings menu. \
 * The port number may change as you toggle the setting on and off. \
 * Next add all the device's you'd like to use to your `.env.local` file,
 * named {@link keys.ADB_CONNECT_DEVICES | ADB_CONNECT_DEVICES} using the comma separated `{ipAddress}:{port}` port syntax.
 *
 * **NOTE** \
 * You might need to connect your device via usb the first time, for it to accept remote debugging.
 */
export const connectAdb = (): Plugin => {

	const pluginName = 'vite-plugin-connect-adb'
	let handleClose = false;

	let env_devices: string = process.env[keys.ADB_CONNECT_DEVICES]!
	const devices = () => env_devices?.split(',')?.map(d => d.trim()) ?? []

	const testAdb = (): boolean => {
		try {
			return !!getAndroidToolPath("adb", false)
		} catch {
			return false
		}
	}

	const formatLog = (message: string) => `${chalk.blueBright(`[${pluginName}]`)} ${message}`
	const formatVerbose = (message: string) => formatLog(chalk.italic.gray(message))
	const formatWarn = (message: string) => formatLog(chalk.bold.yellowBright(message))
	const formatError = (message: string) => formatLog(chalk.bold.red(message))

	let logger = createLogger()

	const adb = (...parameters: string[]) => new Promise<void>((resolve) => {
		const adbProcess = spawn(getAndroidToolPath("adb", false), parameters, {
			cwd: process.cwd(),
			detached: false,
			env: process.env,
			windowsHide: true,
			stdio: 'pipe'
		})

		adbProcess.stderr.on('data', (e) => {
			logger.error(formatError(e.toString()))
		})
		adbProcess.stdout.on('data', (e) => {
			const message = e.toString().replace('\n', '')
			if (message.trim() === '') return

			if (message.startsWith('already connected to'))
				return logger.info(formatVerbose(message))
			if (message.startsWith('cannot connect to '))
				return logger.warn(formatWarn(message))
			if (message.startsWith('failed to connect to'))
				return logger.warn(formatWarn(message))

			logger.info(formatLog(message))
		})

		// We don't care about the errors, just write them out, otherwise this is where you'd reject
		adbProcess.once('close', () => {
			adbProcess.removeAllListeners();
			resolve();
		})
	})

	// https://remysharp.com/2016/12/17/chrome-remote-debugging-over-wifi
	const connectAdbDevices = async () => {
		logger.info(formatLog(`connecting ${devices().length} devices...`))
		for (let device of devices()) {
			logger.info(formatLog(`connecting ${device}`))
			await adb('connect', device)
		}
	}

	const disconnectAdbDevices = async () => {
		logger.info(formatLog(`disconnecting ${devices().length} devices...`))
		for (let device of devices()) {
			logger.info(formatLog(`disconnecting ${device}`))
			await adb('disconnect', device)
		}
	}

	const closePlugin = async () => {
		try {
			process.stdin.pause();
			await disconnectAdbDevices()
			process.stdin.resume();
		}
		catch(e) {
			const err = e as Error
			logger.error(formatError(err.stack ?? err.message))
			process.exit(-1)
		}
	}

	return ({
		name: pluginName,
		enforce: 'pre',
		apply: 'serve',

		configResolved(config) {

			if (!testAdb()) throw new Error(`'adb' command was either not found or inaccessible.`)

			env_devices ??= loadEnv(config.mode, process.cwd(), 'ADB')?.[keys.ADB_CONNECT_DEVICES]!
			// TODO validate devices format
			if (!env_devices) config.logger.warn(formatWarn(
				`no devices configured, please set "${keys.ADB_CONNECT_DEVICES}" in your local environment file`
			))

			logger = config.logger
		},

		async configureServer(server) {

			handleClose = true;
			let unsubscribeExitHook = () => { }

			const originalClose = server.close;
			const originalRestart = server.restart;

			server.restart = async () =>{
				handleClose = false;
				await originalRestart();
			}
			server.close = async () =>{
				if(handleClose) {
					unsubscribeExitHook();
					await closePlugin()
				}
				await originalClose();
			}

			process.env[keys.CLEANUP_CONFIGURED(pluginName)] = '1'

			await connectAdbDevices();

			unsubscribeExitHook = asyncExitHook(() => closePlugin(), {
				wait: 300
			})
		}
	})
}