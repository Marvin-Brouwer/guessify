import { exaggerateBlackAndWhitePixels } from './filters/exaggerate-black-and-white'
import { updateSinglePixel, getSinglePixel } from './filters/pixel'
import { awaitAnimationFrame } from './frame-helper'

export async function applyPixelFilter(imageData: ImageData) {

	return await awaitAnimationFrame(() => {
		// https://www.dynamsoft.com/codepool/convert-image-to-grayscale-with-javascript.html
		const pixels = imageData.data
		for (var i = 0; i < pixels.length; i += 4) {
				const pixel = getSinglePixel(pixels, i);
				const filteredPixel = exaggerateBlackAndWhitePixels(pixel)
				updateSinglePixel(pixels, i, filteredPixel)
		}
		return imageData
	})
}