import { exaggerateBlackAndWhitePixels } from './filters/exaggerate-black-and-white'

export function applyPixelFilter(imageData: ImageData) {
	// Convert image to grayscale
	// https://www.dynamsoft.com/codepool/convert-image-to-grayscale-with-javascript.html
	const pixels = imageData.data
	for (var i = 0; i < pixels.length; i += 4) {
		const _red = pixels[i]
		const _green = pixels[i + 1]
		const _blue = pixels[i + 2]
		const [red, green, blue, alpha] = exaggerateBlackAndWhitePixels(_red, _green, _blue)
		pixels[i] = red
		pixels[i + 1] = green
		pixels[i + 2] = blue
		pixels[i + 3] = alpha
	}
	return imageData
}