import { checkEdgeScore, EdgeScore } from './edge-map'
import { canvasConfiguration } from './canvas';

const rowPos = Symbol.for('rowPos')
const rowS = Symbol.for('rowSize')
const colPos = Symbol.for('colPos')
const length = Symbol.for('length')
const absLength = Symbol.for('absLength')

export type Pixel = {

	r: number,
	g: number,
	b: number,
	a: number,

	abs: number,

	x: number,
	y: number,
}

export type GridPixel = Pixel & {

	edgeScore: EdgeScore
}

export type PixelRow = Iterable<GridPixel> & {
	pixel(x: number): GridPixel
	y: number
}
export type PixelColumn = {
	pixel(y: number): GridPixel
}

export type PixelGrid = Iterable<GridPixel> & {
	width: number, height: number,
	size: number

	pixel(x: number, y: number): GridPixel,
	row(y: number): PixelRow
	column(x: number): PixelColumn

	rows(): Iterable<PixelRow>

	toArray() : Array<GridPixel>
}

export function pixelDataFromOffset(
	imageData: ImageData,
	xIn: number, yIn: number
): Pixel {

	const x = Math.floor(xIn)
	const y = Math.floor(yIn)

	const pixelSize = 4
	const rowSize = imageData.width * 4

	const columnOffset = x * pixelSize
	const rowOffset = y * rowSize

	const start = columnOffset + rowOffset
	const [r, g, b, a] = imageData.data.slice(start, start + 4)

	const debugInfo = import.meta.env.PROD
		? {}
		: {
			[rowPos]: rowOffset,
			[rowS]: rowSize,
			[colPos]: columnOffset,
		}

	return {
		r, g, b, a,

		x, y, abs: start,

		...debugInfo
	}
}

function pixelFromOffset(
	imageData: ImageData,
	blurryImageData: ImageData,
	invertedBlurryImageData: ImageData,
	xIn: number, yIn: number
): GridPixel {

	const x = Math.floor(xIn)
	const y = Math.floor(yIn)

	const pixelSize = 4
	const rowSize = imageData.width * 4

	const columnOffset = x * pixelSize
	const rowOffset = y * rowSize

	const start = columnOffset + rowOffset
	const [r, g, b, a] = imageData.data.slice(start, start + 4)
	const [rb, gb, bb] = blurryImageData.data.slice(start, start + 4)
	const [rbi, gbi, bbi] = invertedBlurryImageData.data.slice(start, start + 4)

	// We already mark the pixels here so we don't need to edge-map in a separate pass
	// This should shave significant processing time
	const edgeScore = checkEdgeScore(rb, gb, bb, rbi, gbi, bbi);

	const debugInfo = import.meta.env.PROD
		? {}
		: {
			[rowPos]: rowOffset,
			[rowS]: rowSize,
			[colPos]: columnOffset,
		}

	return {
		r, g, b, a,

		x, y, abs: start,

		edgeScore,

		...debugInfo
	}
}

function *convertToIterable(grid: PixelGrid) {
	for (let x = 0; x < grid.width; x++) {
		const column = grid.column(x)
		for (let y = 0; y < grid.height; y++) {
			yield column.pixel(y)
		}
	}
}

function *iterateRows(grid: PixelGrid) {
	for (let y = 0; y < grid.height; y++) {
		yield grid.row(y)
	}
}

function *iterateRow(y: number, grid: PixelGrid) {
	for (let x = 0; x < grid.width; x++) {
		yield grid.pixel(x, y)
	}
}
/**
 * Convert the bitmap to a grid of polar coordinate pixels.
 * This makes it easier for trigonometry purposes and every index corresponds to a single pixel.
 */
export function canvasToPixelGrid(
	imageCanvas: OffscreenCanvas,
	blurryCanvas: OffscreenCanvas,
	invertedBlurryCanvas: OffscreenCanvas
): PixelGrid | undefined {
	return imageDataToPixelGrid(
		canvasConfiguration.getCanvasContext(imageCanvas).getImageData(0, 0, imageCanvas.width, imageCanvas.height),
		canvasConfiguration.getCanvasContext(blurryCanvas).getImageData(0, 0, blurryCanvas.width, blurryCanvas.height),
		canvasConfiguration.getCanvasContext(invertedBlurryCanvas).getImageData(0, 0, invertedBlurryCanvas.width, invertedBlurryCanvas.height),
	);
}

/**
 * Convert the bitmap to a grid of polar coordinate pixels.
 * This makes it easier for trigonometry purposes and every index corresponds to a single pixel.
 */
export function imageDataToPixelGrid(
	imageData: ImageData,
	blurryImageData: ImageData,
	invertedBlurryImageData: ImageData
): PixelGrid | undefined {

	if (Number.isNaN(imageData.width) || imageData.width === 0) return undefined
	// Very costly operation, makes debugging easier
	if (import.meta.env.DEV && imageData.data.every(v => v === 0)) return undefined

	const debugInfo = import.meta.env.PROD
		? {}
		: {
			[length]: imageData.data.length / 4,
			[absLength]: imageData.data.length,
		}

	return {
		width: imageData.width, height: imageData.height, size: imageData.data.length,
		pixel(x, y) {
			return pixelFromOffset(imageData, blurryImageData, invertedBlurryImageData, x, y)
		},
		row(y) {
			const rowOffset = Math.min(y, imageData.height)
			const iterator = iterateRow(y, this)
			return {
				y,
				pixel: (x) => pixelFromOffset(imageData, blurryImageData, invertedBlurryImageData, x, rowOffset),
				[Symbol.iterator]() {
					return iterator;
				},
			}
		},
		rows(){
			return iterateRows(this)
		},
		column(x) {
			const columnOffset = Math.min(x, imageData.width)
			return {
				pixel: (y) => pixelFromOffset(imageData, blurryImageData, invertedBlurryImageData, columnOffset, y)
			}
		},
		[Symbol.iterator]() {
			return convertToIterable(this)
		},
		toArray() {
			return Array.from(this)
		},

		...debugInfo
	}


	// return await awaitAnimationFrame(() => {

	// 	const imageGrid: Array<PixelRow> = [];

	// 	const pixels = imageData.data
	// 	const invertedPixels = invertedImageData.data;

	// 	for (var i = 0; i < pixels.length; i += 4) {
	// 		const absolutePixelIndex = Math.floor(i/ 4);
	// 		const rowIndex = Math.floor(absolutePixelIndex / imageData.width);
	// 		// Subtract the row offset
	// 		const pixelIndex = absolutePixelIndex - (imageData.width * rowIndex);
	// 		imageGrid[rowIndex] ??= [];

	// 		const pixel = getSinglePixel(pixels, i);
	// 		const invertedPixel = getSinglePixel(invertedPixels, i);

	// 		// We already mark the pixels here so we don't need to edge-map in a separate pass
	// 		// This should shave significant processing time
	// 		const edgePixelSource = checkEdgeThreshold(pixel) ? 1 : 0;
	// 		const edgePixelInverted = checkEdgeThreshold(invertedPixel) ? 2 : 0;
	// 		const edgePixel = edgePixelSource + edgePixelInverted as 0 | 1 | 2 | 3;

	// 		imageGrid[rowIndex][pixelIndex] = [...pixel, pixelIndex, rowIndex, edgePixel];
	// 	}

	// 	return Object.assign(imageGrid, { width: imageData.width, height: imageData.height })
	// })
}