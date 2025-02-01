import { spawn } from 'node:child_process'
import { loadEnv, ViteDevServer, type Plugin } from 'vite';
import { getAndroidToolPath } from "android-tools-bin";
import chalk from 'chalk'

const keys = {
	ADB_CONNECT_DEVICES: 'ADB_CONNECT_DEVICES' as const
}

// TODO improve to where it warns and retries on starting daemon + store if connected and deconnect if no
// + verbose
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

	const pluginName = 'vite-plugin-connect-adb';

	let env_devices: string = process.env[keys.ADB_CONNECT_DEVICES]!;
	const devices = () => env_devices?.split(',')?.map(d => d.trim()) ?? [];

	const testAdb = (): boolean => {
		try {
			return !!getAndroidToolPath("adb", false);
		} catch {
			return false;
		}
	}

	const formatLog = (message: string) => `${chalk.blueBright(`[${pluginName}]`)} ${message}`
	const formatVerbose = (message: string) => formatLog(chalk.italic.gray(message));
	const formatWarn = (message: string) => formatLog(chalk.bold.yellowBright(message));
	const formatError = (message: string) => formatLog(chalk.bold.red(message));

	const startAdb = (device: string, config: ViteDevServer['config']) => {

		config.logger.info(formatLog(`connecting '${device}'`));
		// https://remysharp.com/2016/12/17/chrome-remote-debugging-over-wifi
		const adbProcess = spawn(getAndroidToolPath("adb", false), [
			'connect', `${device}`
		], {
			cwd: process.cwd(),
			detached: false,
			env: process.env,
			windowsHide: true,
			stdio: 'pipe'
		});

		adbProcess.stderr.on('data', (e) => {
			config.logger.error(formatError(e.toString()))
		})
		adbProcess.stdout.on('data', (e) => {
			const message = e.toString();
			if (message.startsWith('already connected to'))
				return config.logger.info(formatVerbose(message))
			if (message.startsWith('cannot connect to '))
				return config.logger.warn(formatWarn(message))
			if (message.startsWith('failed to connect to'))
				return config.logger.warn(formatWarn(message))

			config.logger.info(formatLog(message));
		})
	}
	return ({
		name: pluginName,
		enforce: 'pre',
		apply: 'serve',

		async configResolved(config) {

			if (!testAdb()) throw new Error(`'adb' command was either not found or inaccessible.`);

			env_devices ??= loadEnv(config.mode, process.cwd(), 'ADB')?.[keys.ADB_CONNECT_DEVICES]!;
			// TODO validate devices format
			if(!env_devices)  config.logger.warn(formatWarn(
				`no devices configured, please set "${keys.ADB_CONNECT_DEVICES}" in your local environment file`
			))
		},

		async configureServer(server) {

			// Wait for server restarted, this is mostly to prevent chaos in the logs
			await new Promise<void>(r => setTimeout(r, 1000))

			server.config.logger.info(formatLog(`connecting ${devices().length} devices...`))
			for(let device of devices()) {
				startAdb(device, server.config);
			}
		},
	});
};