import { canvasToPixelGrid, PixelGrid } from './pixel-grid'

const barThreshold = 200

function countColumnHeight(grid: PixelGrid, x: number) {

	let whitePixelCount = 0
	for (let y = 0; y < grid.height; y++) {
		const pixel = grid.pixel(x, y)
		if (pixel.r >= barThreshold) {
			whitePixelCount++
		}
	}

	return whitePixelCount
}

function countColumn(barHeight: number, maxHeight: number) {
	const roundResult = Math.round(((barHeight / maxHeight) * 8) - 1)
	// Make sure negatives never happen
	return roundResult > 0 ? roundResult : 0
}

export function parseCode(codeCanvas: OffscreenCanvas | undefined) {
	if (codeCanvas === undefined) return undefined

	const barcodeGrid = canvasToPixelGrid(codeCanvas)
	if (!barcodeGrid) return undefined

	let maxHeight = countColumnHeight(barcodeGrid, 22)

	let code: number[] = []
	for (let x = 0; x <= 44; x += 2) {
		const columnHeight = countColumnHeight(barcodeGrid, x)
		maxHeight = Math.max(maxHeight, columnHeight)
		code.push(columnHeight)
	}

	code = code.map(bar => countColumn(bar, maxHeight))

	if (code.length !== 23) return undefined
	return code
}