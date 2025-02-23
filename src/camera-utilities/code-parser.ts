import { canvasConfiguration } from './canvas'
import { pixelDataFromOffset } from './pixel-grid'

const barThreshold = 130

function countColumnHeight(image: globalThis.ImageData, x: number) {

	let whitePixelCount = 0
	for (let y = 0; y < image.height; y++) {
		const pixel = pixelDataFromOffset(image, x, y)
		if (pixel.r >= barThreshold) {
			whitePixelCount++
		}
	}

	return whitePixelCount
}

function countColumn(image: globalThis.ImageData, x: number, midHeight: number) {


	const barHeight = countColumnHeight(image, x)

	const roundResult = Math.round((barHeight / midHeight) * 8) - 1
	// Make sure negatives never happen
	return roundResult > 0 ? roundResult : 0
}

export function parseCode(codeCanvas: OffscreenCanvas | undefined) {
	if (codeCanvas === undefined) return undefined

	const codeImage = canvasConfiguration
		.getCanvasContext(codeCanvas!)
		.getImageData(0, 0, codeCanvas!.width, codeCanvas!.height)

	const midHeight = countColumnHeight(codeImage, 22)

	let code: number[] = []
	for (let x = 0; x <= 44; x += 2) {
		const columnHeight = countColumn(codeImage, x, midHeight)
		// Some validation logic to make sure it's actually a spotify code
		if (x === 0 && columnHeight != 0) return undefined;
		if (x === 22 && columnHeight != 7) return undefined;
		if (x === 44 && columnHeight != 0) return undefined;
		code.push(columnHeight)
	}

	return code;
}