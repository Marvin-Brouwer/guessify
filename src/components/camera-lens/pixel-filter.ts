
/**
 * Find the distance between colors that is greatest
 * This is used to determine whether it is close to a gray tone
 */
function calculateBiggestColorDistance(red: number, green: number, blue: number) {

	const rbDist = Math.abs(red - blue)
	const gbDist = Math.abs(green - blue)
	const rgDist = Math.abs(red - green)

	return Math.max(rbDist, gbDist, rgDist)
}

/**
 * Exaggerate the black and white pixels, convert the rest to grayscale
 */
function exaggerateBlackAndWhitePixels(red: number, green: number, blue: number) {

	const distance = calculateBiggestColorDistance(red, green, blue)

	const whiteDifferenceThreshold = 100
	const whiteThreshold = 180
	const offWhiteThreshold = 180
	const whitePixel = [255, 255, 255, 255]
	const offWhitePixel = [220, 220, 220, 255]

	const blackDifferenceThreshold = 40
	const blackThreshold = 50
	const offBlackThreshold = 120
	const blackPixel = [0, 0, 0, 255]
	const offBlackPixel = [80, 80, 80, 255]

	if (distance < whiteDifferenceThreshold) {
		if (red > whiteThreshold && green > whiteThreshold && blue > whiteThreshold) {
			return whitePixel
		}
	}
	if (distance < blackDifferenceThreshold) {
		if (red < blackThreshold && green < blackThreshold && blue < blackThreshold) {
			return blackPixel
		}
	}
	if (red > offWhiteThreshold && green > offWhiteThreshold && blue > offWhiteThreshold) {
		return offWhitePixel
	}
	if (red < offBlackThreshold && green < offBlackThreshold && blue < offBlackThreshold) {
		return offBlackPixel
	}

	return [2,2,2,0]
}

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