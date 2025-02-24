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

export type PixelRow = Iterable<Pixel> & {
	pixel(x: number): Pixel
	y: number
}
export type PixelColumn = {
	pixel(y: number): Pixel
}

export type PixelGrid = Iterable<Pixel> & {
	width: number, height: number,
	size: number

	pixel(x: number, y: number): Pixel,
	row(y: number): PixelRow
	column(x: number): PixelColumn

	rows(): Iterable<PixelRow>

	toArray() : Array<Pixel>
}

function pixelFromOffset(
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
export const canvasToPixelGrid = (imageCanvas: OffscreenCanvas): PixelGrid | undefined => imageDataToPixelGrid(
	canvasConfiguration
		.getCanvasContext(imageCanvas)
		.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
);

/**
 * Convert the bitmap to a grid of polar coordinate pixels.
 * This makes it easier for trigonometry purposes and every index corresponds to a single pixel.
 */
export function imageDataToPixelGrid(imageData: ImageData): PixelGrid | undefined {

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
			return pixelFromOffset(imageData, x, y)
		},
		row(y) {
			const rowOffset = Math.min(y, imageData.height)
			const iterator = iterateRow(y, this)
			return {
				y,
				pixel: (x) => pixelFromOffset(imageData, x, rowOffset),
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
				pixel: (y) => pixelFromOffset(imageData, columnOffset, y)
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
}