import { AngleDetail } from './angle-scan'
import { GridEllipsoid } from './ellipse-detect'
import { pixelDataFromOffset, PixelGrid } from './pixel-grid'
import { canvasConfiguration } from './canvas'

export function redrawCode(
	viewFinderCanvas: OffscreenCanvas,
	grid: PixelGrid | undefined,
	ellipsoid: GridEllipsoid | undefined,
	angles: AngleDetail | undefined
) {

	if (ellipsoid === undefined) return undefined
	if (angles === undefined) return undefined

	// The rotation needs to be a square, otherwise we get weird results
	// We do twice the size so it never leaves the canvas
	const centerCanvas = new OffscreenCanvas(viewFinderCanvas.width * 2, viewFinderCanvas.width * 2)
	const centerContext = canvasConfiguration.getCanvasContext(centerCanvas, false)
	const rotateCanvas = new OffscreenCanvas(viewFinderCanvas.width * 2, viewFinderCanvas.width * 2)
	const rotateContext = canvasConfiguration.getCanvasContext(rotateCanvas, false)

	rotateContext.fillStyle = 'yellow'

	// Move the circle to the middle
	centerContext.translate((rotateCanvas.width / 2) - ellipsoid.averageX, 0)
	centerContext.translate(0, (rotateCanvas.height / 2) - ellipsoid.averageY)
	centerContext.drawImage(
		viewFinderCanvas,
		0, 0,
		viewFinderCanvas.width, viewFinderCanvas.height
	)
	centerContext.resetTransform()

	const codeHeight = Math.floor((ellipsoid.radiusA / 8)) * 8
	// Move the center slightly off left top according to logo radius
	// And where the first 0 starts
	rotateContext.translate(-angles.lengthAC + 2, codeHeight + 3)
	// Rotate back to horizontal
	rotateContext.rotate(-angles.alphaRad)
	// Draw at left top
	rotateContext.drawImage(centerCanvas, -centerCanvas.width / 2, -centerCanvas.height / 2)
	rotateContext.save()
	rotateContext.resetTransform()

	// This seems to work better than grayscale
	rotateContext.globalCompositeOperation = 'saturation'
	rotateContext.fillStyle = "rgba(0, 0, 0, 1)"
	rotateContext.fillRect(0, 0, rotateCanvas.width, rotateCanvas.height)
	rotateContext.save()

	const resizeCanvas = new OffscreenCanvas((23 * 16), (8 * 8) + 4)
	const resizeContext = canvasConfiguration.getCanvasContext(resizeCanvas, false)
	// Scale down to lose detail (4x the expected size for tolerance)
	const scaleFactor = (resizeCanvas.height - 8) / ((codeHeight) * 2)
	resizeContext.scale(scaleFactor, scaleFactor)
	resizeContext.drawImage(
		rotateCanvas,
		0, 0
	)
	resizeContext.globalCompositeOperation = 'screen'
	resizeContext.drawImage(
		rotateCanvas,
		2, 0
	)
	resizeContext.drawImage(
		rotateCanvas,
		4, 0
	)
	resizeContext.drawImage(
		rotateCanvas,
		-2, 0
	)
	resizeContext.save()
	resizeContext.resetTransform()
	resizeContext.globalCompositeOperation = 'source-over'

	// resizeContext.fillStyle = 'magenta'
	const imageData = resizeContext.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height)
	let lastBar = Infinity
	for (let x = 0; x <= imageData.width / 4; x++) {
		const xFromEnd = imageData.width - x
		const pixelTop = pixelDataFromOffset(imageData, xFromEnd, 0)
		const pixelBottom = pixelDataFromOffset(imageData, xFromEnd, imageData.height - 1)

		if (pixelTop.r !== 0) {
			// resizeContext.fillStyle = 'red'
			// resizeContext.fillRect(xFromEnd, 0, 1, 1)
			x++
			continue
		}
		if (pixelBottom.r !== 0) {
			// resizeContext.fillStyle = 'blue'
			// resizeContext.fillRect(xFromEnd, imageData.height, 1, 1)
			x++
			continue
		}

		let pixelMiddle = pixelDataFromOffset(imageData, xFromEnd, imageData.height / 2)
		if (pixelMiddle.r === 255 && pixelMiddle.g == 255 && pixelMiddle.b == 255) {
			// resizeContext.fillRect(pixelMiddle.x, pixelMiddle.y, 1, 1)
			lastBar = pixelMiddle.x
			break
		}
		pixelMiddle = pixelDataFromOffset(imageData, xFromEnd, (imageData.height / 2) - 2)
		if (pixelMiddle.r === 255 && pixelMiddle.g == 255 && pixelMiddle.b == 255) {
			// resizeContext.fillRect(pixelMiddle.x, pixelMiddle.y, 1, 1)
			lastBar = pixelMiddle.x
			break
		}
		pixelMiddle = pixelDataFromOffset(imageData, xFromEnd, (imageData.height / 2) + 2)
		if (pixelMiddle.r === 255 && pixelMiddle.g == 255 && pixelMiddle.b == 255) {
			// resizeContext.fillRect(pixelMiddle.x, pixelMiddle.y, 1, 1)
			lastBar = pixelMiddle.x
			break
		}
	}

	// return resizeCanvas

	if (lastBar === Infinity) return undefined


	const codeWidth = Math.round((23 + 21) + 1)
	const scaleFactorW = codeWidth / (lastBar + 4)
	resizeContext.globalCompositeOperation = 'source-over'
	resizeContext.scale(scaleFactorW, 1)
	resizeContext.drawImage(
		resizeCanvas,
		scaleFactorW, 0
	)
	resizeContext.resetTransform()
	resizeContext.save()
	resizeContext.globalCompositeOperation = 'source-over'

	// for (let x = 0; x <= codeWidth; x += 4) {
	// 	resizeContext.fillStyle = 'rgba(234, 0, 255, 0.2)'
	// 	resizeContext.fillRect(x, 0, 2, 100)
	// 	resizeContext.fillStyle = 'rgba(0, 255, 30, 0.2)'
	// 	resizeContext.fillRect(x + 2, 0, 2, 100)
	// }
	for (let x = 0; x <= codeWidth; x += 2) {
		resizeContext.fillStyle = 'rgb(0, 0, 0)'
		resizeContext.fillRect(x+1, 0, 1, 100)
	}

	resizeContext.globalCompositeOperation = 'source-over'
	resizeContext.fillStyle = 'black'
	resizeContext.fillRect(codeWidth, 0, 400, 100)
	resizeContext.save()

	resizeContext.globalCompositeOperation = 'screen'
	for (let y = 0; y < 8 * 4; y += 4) {
		resizeContext.fillStyle = 'rgba(0, 251, 0, 0.3)'
		resizeContext.fillRect(0, y, codeWidth, 1)
	}
	for (let y = 0; y < 8 * 4; y += 4) {
		resizeContext.fillStyle = 'rgba(0, 251, 255, 0.3)'
		resizeContext.fillRect(0, y + 37, codeWidth, 1)
	}

	return resizeCanvas
}