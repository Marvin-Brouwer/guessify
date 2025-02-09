
import { readFile, writeFile } from 'node:fs/promises'
import sizeOf from 'image-size'
import { join } from 'node:path'
import getPixels from 'get-pixels'
import { ImageData, Canvas } from 'skia-canvas'

type Callback = Parameters<typeof getPixels>[2];
type ArrayThing = Parameters<Callback>[1]

export const fixTestEnvironment = () => {
	global.ImageData = ImageData as unknown as typeof global.ImageData
	global.OffscreenCanvas = Canvas as unknown as typeof OffscreenCanvas
	global.requestAnimationFrame = (cb) => { cb(-1); return -1 }
}

export const readImageFile = async (dirname: string, file: string) => {
	const buffer = await readFile(join(dirname, file))
	const pixels = await new Promise<ArrayThing>(r => getPixels(join(dirname, file), (_err, pixels) => r(pixels)))
	const byteArray = new Uint8ClampedArray(pixels.data)
	const size = sizeOf(Uint8Array.from(buffer))
	return new ImageData(byteArray, size.width!, size.height!)
}

export const writeImageFile = async (dirname: string, file: string, imageData: ImageData) => {

	const canvas = new Canvas(imageData.width, imageData.height)
	canvas.getContext('2d')!.putImageData(imageData, 0, 0)
	await writeCanvas(canvas, dirname, file)
}

export const writeCanvas = async (canvas: Canvas | OffscreenCanvas | undefined, dirname: string, file: string) => {

	if (canvas === undefined) return;

	if (canvas.constructor.name !== 'Canvas') {
		throw new Error('Tests incorrectly configured '+ canvas.constructor.name)
	}

	const skiaCanvas = (canvas as Canvas)
	if (!skiaCanvas.getContext('2d')) return

	const imageData = await skiaCanvas.toBuffer('png')
	await writeFile(join(dirname, file), imageData)
}