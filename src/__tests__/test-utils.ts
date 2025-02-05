
import { readFile, writeFile } from 'node:fs/promises'
import sizeOf from 'image-size'
import { join } from 'node:path'
import getPixels from 'get-pixels'
import { Canvas, createCanvas, createImageData } from 'canvas'

type Callback = Parameters<typeof getPixels>[2];
type ArrayThing = Parameters<Callback>[1]

global.ImageData = await require('@canvas/image-data')

export const readImageFile = async (dirname: string, file: string) => {
	const buffer = await readFile(join(dirname, file))
	const pixels = await new Promise<ArrayThing>(r => getPixels(join(dirname, file), (_err, pixels) => r(pixels)))
	const byteArray = new Uint8ClampedArray(pixels.data)
	const size = sizeOf(Uint8Array.from(buffer))
	return new ImageData(byteArray, size.width!, size.height!)
}

export const writeImageFile = async (dirname: string, file: string, imageData: ImageData) => {

	const canvas = createCanvas(imageData.width, imageData.height)
	canvas.getContext('2d').putImageData(createImageData(imageData.data, imageData.width, imageData.height), 0, 0)
	await writeCanvas(canvas, dirname, file)
}

export const writeCanvas = async (canvas: Canvas, dirname: string, file: string) => {

	const imageData = canvas.createPNGStream()
	await writeFile(join(dirname, file), imageData)
}