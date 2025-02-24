import { canvasToPixelGrid, PixelGrid } from './pixel-grid'

const barThreshold = 130

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

function countColumn(grid: PixelGrid, x: number, midHeight: number) {


	const barHeight = countColumnHeight(grid, x)

	const roundResult = Math.round((barHeight / midHeight) * 8) - 1
	// Make sure negatives never happen
	return roundResult > 0 ? roundResult : 0
}

export function parseCode(codeCanvas: OffscreenCanvas | undefined) {
	if (codeCanvas === undefined) return undefined

	const barcodeGrid = canvasToPixelGrid(codeCanvas)
	if (!barcodeGrid) return undefined

	const midHeight = countColumnHeight(barcodeGrid, 22)

	let code: number[] = []
	for (let x = 0; x <= 44; x += 2) {
		const columnHeight = countColumn(barcodeGrid, x, midHeight)
		// Some validation logic to make sure it's actually a spotify code
		if (x === 0 && columnHeight != 0) return undefined;
		if (x === 22 && columnHeight != 7) return undefined;
		if (x === 44 && columnHeight != 0) return undefined;
		code.push(columnHeight)
	}

	if (code.length !== 23) return undefined
	return code
}