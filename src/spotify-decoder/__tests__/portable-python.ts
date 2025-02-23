
import pythonExe from "@bjia56/portable-python-3.13";
import { exec } from "node:child_process"
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const handleOut = ({stdout, stderr}: {stdout?: Buffer  | string, stderr?: Buffer | string}) => {
	if (stderr) return stderr.toString()
	return stdout?.toString() ?? ''
}

export const pipInstall = (lib: string) =>
	execAsync(
		`${pythonExe} -m pip install ${lib} --disable-pip-version-check`, {
		cwd: __dirname
	})
	.then(handleOut)
	.catch(e => e.toString())

export const py = async (code: TemplateStringsArray, ...values: any[]) => {

	const zippedTemplate = code.flatMap(function(e, i) {
		return values[i] !== undefined ? [e.trim(), JSON.stringify(values[i]).trim()] : e.trim();
	}).join('')
	const command = `${pythonExe} -c "${zippedTemplate.split('\n').map(line => line.trim()).filter(Boolean).join('')}"`;
	const result = await execAsync(command, {
		cwd: __dirname
	}).then(handleOut)

	if (result.trim() === "True") return true;
	if (result.trim() === "False") return false;
	try {
		return JSON.parse(result.trim())
	} catch {
		return result
	}
}