import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { loadEnv, type Plugin } from 'vite';
import { getAndroidToolPath } from "android-tools-bin";

const terminationSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP',];

// TODO improve to where it warns and retries on starting daemon + store if connected and deconnect if no
// + verbose
export const connectAdb = (): Plugin => {

	const pluginName = 'vite-plugin-connect-adb';

	let ipAddress: string = process.env.ADB_ADDRESS!;
	let port = process.env.ADB_PORT!;

	let adbProcess: ChildProcessWithoutNullStreams | undefined = undefined;

	const testAdb = (): boolean => {
		try {
			return !!getAndroidToolPath("adb", false);
		} catch {
			return false;
		}
	}

	const closeAdbSession = () => {

		try {
			if (adbProcess) {
				adbProcess.removeAllListeners();
				adbProcess.stdin.destroy();
				adbProcess.stdout.destroy();
				adbProcess.stderr.destroy();
				adbProcess.kill('SIGINT');
				adbProcess.unref();
				adbProcess = undefined;
			}
		} finally {
			//
		}
	}
	const close = () => {

		try {
			process.stdin.pause();
			process.stdout.pause();
			process.stderr.pause();
			terminationSignals.forEach((signal) => {
				process.removeAllListeners(signal);
			});
			closeAdbSession();
		} finally {
			process.exit(0);
		}
	}

	const startAdb = () => {

		if (!!adbProcess) return;


		// https://remysharp.com/2016/12/17/chrome-remote-debugging-over-wifi
		adbProcess = spawn(getAndroidToolPath("adb", false), [
			'connect', `${ipAddress}:${port}`
		], {
			cwd: process.cwd(),
			detached: false,
			env: process.env,
			windowsHide: true,
			stdio: 'pipe'
		});

		let errorAggregate = '';
		adbProcess.stderr.on('data', (e) => {
			errorAggregate += '\n';
			errorAggregate += e.toString();
		})
		adbProcess.stdout.on('data', (e) => {
			console.info('    ' + e.toString())
		})
		adbProcess.on('close', () => {
			if (errorAggregate.length === 0) return;
			throw new Error(errorAggregate);
		})
		closeServerOnTermination();
	}

	function closeServerOnTermination() {
		return terminationSignals.forEach((signal) => {
			process.on(signal, close);
		});
	}

	return ({
		name: pluginName,
		enforce: 'pre',
		apply: 'serve',

		async configResolved(config) {

			console.log(getAndroidToolPath("adb", false), 'connect', `${ipAddress}:${port}`)
			if (!testAdb()) {
				// https://www.minitool.com/news/adb-install-windows-10-mac.html
				throw new Error(
					`ADB command was either not found or inaccessible. \n` +
					'You need to install: "https://developer.android.com/tools/releases/platform-tools#downloads"'
				);
			}

			ipAddress ??= loadEnv(config.mode, process.cwd(), 'ADB')?.ADB_ADDRESS!
			port ??= loadEnv(config.mode, process.cwd(), 'ADB')?.ADB_PORT ?? '5555'
			if (!ipAddress) {
				throw new Error(
					'No ipAddress configured, please set "ADB_ADDRESS" in your local environment file'
				);
			}
		},

		closeWatcher() {
			closeAdbSession();
		},

		configureServer() {
			if (adbProcess) return;

			console.log('ADB connecting...');
			startAdb();
		},
	});
};