import { Canvas } from './canvas'

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
}

export type GridPixel = Pixel & {

	x: number,
	y: number,

	edgePixel: 0 | 1 | 2 | 3,
	abs: number
}

export type PixelRow = {
	pixel(x: number): GridPixel
}
export type PixelColumn = {
	pixel(y: number): GridPixel
}
export type PixelGrid = {
	width: number, height: number,
	pixel(x: number, y: number): GridPixel,
	// all(): Generator<GridPixel>
	row(y: number): PixelRow
	column(x: number): PixelColumn
	size: number
	toIterable(mapFunc?: (pixel: GridPixel) => Pixel): PixelGenerator
	toIterableRaw(mapFunc?: (pixel: GridPixel) => Pixel): Generator<GridPixel>
	// image(): ImageData
}

function pixelFromOffset(imageData: ImageData, invertedImageData: ImageData, x: number, y: number): GridPixel {

	const pixelSize = 4
	const rowSize = imageData.width * 4

	const columnOffset = x * pixelSize
	const rowOffset = y * rowSize

	const start = columnOffset + rowOffset
	const [r, g, b, a] = imageData.data.slice(start, start + 4)
	const [ri, gi, bi] = invertedImageData.data.slice(start, start + 4)

	// We already mark the pixels here so we don't need to edge-map in a separate pass
	// This should shave significant processing time
	const edgePixelSource = checkEdgeThreshold(r, g, b) ? 1 : 0
	const edgePixelInverted = checkEdgeThreshold(ri, gi, bi) ? 2 : 0
	const edgePixel = edgePixelSource + edgePixelInverted as 0 | 1 | 2 | 3

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

		edgePixel,

		// image(): ImageData,

		...debugInfo
	}
}

export type PixelGenerator = Generator<GridPixel> & {
	width: number
	height: number
	size: number
	toArray(): Array<GridPixel>
	toPixelArray(): Uint8ClampedArray
	// map(mapFunc?: (pixel: GridPixel) => Pixel): PixelGenerator
}

/**
 * Convert the bitmap to a grid of polar coordinate pixels.
 * This makes it easier for trigonometry purposes and every index corresponds to a single pixel.
 */
export function convertToPixelGrid(imageCanvas: Canvas, invertedCanvas: Canvas): PixelGrid | undefined {

	const imageData = imageCanvas.getImageData()
	const invertedImageData = invertedCanvas.getImageData()

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
			return pixelFromOffset(imageData, invertedImageData, x, y)
		},
		row(y) {
			const rowOffset = Math.min(y, imageData.height)
			return {
				pixel: (x) => pixelFromOffset(imageData, invertedImageData, x, rowOffset)
			}
		},
		column(x) {
			const columnOffset = Math.min(x, imageData.width)
			return {
				pixel: (y) => pixelFromOffset(imageData, invertedImageData, columnOffset, y)
			}
		},
		toIterable(mapFunc) {
			const generator = this.toIterableRaw(mapFunc);
			return Object.assign(generator, {
				width: this.width,
				height: this.height,
				size: this.size,
				toArray: () => Array.from(generator),
				toPixelArray: () => {
					const uintPixels = new Uint8ClampedArray(this.size)
					for (const pixel of generator) {
						uintPixels[pixel.abs + 0] = pixel.r
						uintPixels[pixel.abs + 1] = pixel.g
						uintPixels[pixel.abs + 2] = pixel.b
						uintPixels[pixel.abs + 3] = pixel.a
					}
					return uintPixels
				}
			})
		},
		*toIterableRaw(mapFunc) {
			for (let x = 0; x < this.width; x++) {
				const column = this.column(x)
				for (let y = 0; y < this.height; y++) {
					const pixel = column.pixel(y)

					const newPixel = !mapFunc
						? pixel
						: {
							...pixel,
							...mapFunc(pixel)
						}

					yield newPixel
				}
			}
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


/**
 * Mark pixels as edgePixel when between a certain values.
 */
export function checkEdgeThreshold(red: number, green: number, blue: number) {

	// TODO: These should be constants
	const whiteThreshold = 160
	const blackThreshold = 50

	if (red > whiteThreshold || red < blackThreshold) return false
	if (green > whiteThreshold || green < blackThreshold) return false
	if (blue > whiteThreshold || blue < blackThreshold) return false

	return true
}