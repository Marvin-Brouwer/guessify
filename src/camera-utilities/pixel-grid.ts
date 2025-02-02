import { Canvas } from './canvas'
import { awaitAnimationFrame } from './frame-helper'
import { getSinglePixel, Pixel } from './pixel'

export type GridPixel = [...Pixel,
	x: number,
	y: number,
	edgePixel: 0 | 1 | 2 | 3
]

// TODO we might add some functions like .at(x, y) or .column(x) .row(y)
export type PixelGrid = Array<PixelRow> & { width: number, height: number }
export type PixelRow = Array<GridPixel>

/**
 * Convert the bitmap to a grid of polar coordinate pixels.
 * This makes it easier for trigonometry purposes and every index corresponds to a single pixel.
 */
export async function convertToPixelGrid(imageCanvas: Canvas, invertedCanvas: Canvas) {

	const imageData = imageCanvas.getImageData();
	const invertedImageData = invertedCanvas.getImageData();

	// Very costly operation, makes debugging easier
	if (import.meta.env.DEV && imageData.data.every(v => v === 0)) return Object.assign([], { width: 0, height: 0 });

	return await awaitAnimationFrame(() => {

		const imageGrid: Array<PixelRow> = [];

		const pixels = imageData.data
		const invertedPixels = invertedImageData.data;

		for (var i = 0; i < pixels.length; i += 4) {
			const absolutePixelIndex = Math.floor(i/ 4);
			const rowIndex = Math.floor(absolutePixelIndex / imageData.width);
			// Subtract the row offset
			const pixelIndex = absolutePixelIndex - (imageData.width * rowIndex);
			imageGrid[rowIndex] ??= [];

			const pixel = getSinglePixel(pixels, i);
			const invertedPixel = getSinglePixel(invertedPixels, i);

			// We already mark the pixels here so we don't need to edge-map in a separate pass
			// This should shave significant processing time
			const edgePixelSource = checkEdgeThreshold(pixel) ? 1 : 0;
			const edgePixelInverted = checkEdgeThreshold(invertedPixel) ? 2 : 0;
			const edgePixel = edgePixelSource + edgePixelInverted as 0 | 1 | 2 | 3;

			imageGrid[rowIndex][pixelIndex] = [...pixel, pixelIndex, rowIndex, edgePixel];
		}

		return Object.assign(imageGrid, { width: imageData.width, height: imageData.height })
	})
}


/**
 * Mark pixels as edgePixel when between a certain values.
 */
export function checkEdgeThreshold([red, green, blue]: Pixel) {

	// TODO: These should be constants
	const whiteThreshold = 160
	const blackThreshold = 50

	if (red > whiteThreshold || red < blackThreshold) return false;
	if (green > whiteThreshold || green < blackThreshold) return false;
	if (blue > whiteThreshold || blue < blackThreshold) return false;

	return true;
}