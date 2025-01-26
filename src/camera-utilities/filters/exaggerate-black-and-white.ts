
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
export function exaggerateBlackAndWhitePixels(red: number, green: number, blue: number) {

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

	// Return 0 alpha so it's easy to scan
	return [2,2,2,0]
}