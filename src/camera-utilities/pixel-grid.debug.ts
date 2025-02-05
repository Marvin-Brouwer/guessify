import { edgeScores } from './edge-score'
import { GridPixel, Pixel, PixelGrid } from './pixel-grid'

export function toPixelArray(grid: PixelGrid) {
	const uintPixels = new Uint8ClampedArray(grid.size)
	for (let pixel of grid) {
		pixel = { ...pixel, ...markLine(pixel) }

		uintPixels[pixel.abs + 0] = pixel.r
		uintPixels[pixel.abs + 1] = pixel.g
		uintPixels[pixel.abs + 2] = pixel.b
		uintPixels[pixel.abs + 3] = pixel.a
	}
	return uintPixels
}

const markLine = ({ edgeScore }: GridPixel): Pixel => {

	if (edgeScore === edgeScores.primaryEdge) return {
		r: 0, g: 128, b: 100, a: 50
	}

	if (edgeScore === edgeScores.secondaryEdge) return {
		r: 128, g: 255, b: 0, a: 50
	}

	if (edgeScore === edgeScores.compoundEdge) return {
		r: 0, g: 255, b: 0, a: 255
	}

	return {
		r: 0, g: 0, b: 0, a: 0
	}
}