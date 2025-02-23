import { AngleDetail } from './angle-scan'
import { GridEllipsoid } from './ellipse-detect'
import { canvasConfiguration } from './canvas'
import { BoundaryDetail } from './boundary-scan'

export function redrawCode(
	viewFinderCanvas: OffscreenCanvas,
	ellipsoid: GridEllipsoid | undefined,
	angles: AngleDetail | undefined,
	boundary: BoundaryDetail | undefined
) {

	if (ellipsoid === undefined) return undefined
	if (angles === undefined) return undefined
	if (boundary === undefined) return undefined

	// The rotation needs to be a square, otherwise we get weird results
	// We do twice the size so it never leaves the canvas
	const centerCanvas = new OffscreenCanvas(viewFinderCanvas.width * 2, viewFinderCanvas.width * 2)
	const centerContext = canvasConfiguration.getCanvasContext(centerCanvas, false)
	const rotateCanvas = new OffscreenCanvas(viewFinderCanvas.width * 2, viewFinderCanvas.width * 2)
	const rotateContext = canvasConfiguration.getCanvasContext(rotateCanvas, false)

	rotateContext.fillStyle = 'yellow'

	// Move the 0 to the middle
	centerContext.translate((rotateCanvas.width / 2) - boundary.zeroLeftX, 0)
	centerContext.translate(0, (rotateCanvas.height / 2) - boundary.zeroLeftY)
	centerContext.drawImage(
		viewFinderCanvas,
		0, 0,
		viewFinderCanvas.width, viewFinderCanvas.height
	)
	centerContext.resetTransform()

	const codeHeight = Math.floor((ellipsoid.averageRadius / 8)) * 8
	const bigAC = (boundary.zeroRightX - boundary.zeroLeftX) / Math.cos(boundary.recalculatedAlphaDegree)
	// Move the center slightly off left top according to logo radius
	// And where the first 0 starts
	rotateContext.translate(0, codeHeight + 2)
	// Rotate back to horizontal
	rotateContext.rotate(-boundary.recalculatedAlphaDegree)
	// Draw at left top
	rotateContext.drawImage(centerCanvas, -centerCanvas.width / 2, -centerCanvas.height / 2)
	rotateContext.save()
	rotateContext.resetTransform()

	// This seems to work better than grayscale
	rotateContext.globalCompositeOperation = 'saturation'
	rotateContext.fillStyle = "rgba(0, 0, 0, 1)"
	rotateContext.fillRect(0, 0, rotateCanvas.width, rotateCanvas.height)
	rotateContext.save()

	const resizeCanvas = new OffscreenCanvas((22+23), (8 * 8) + 8)
	const resizeContext = canvasConfiguration.getCanvasContext(resizeCanvas, false)
	// Scale down to lose detail (4x the expected size for tolerance)
	const scaleFactorH = (resizeCanvas.height - 8) / ((codeHeight) * 2)
	const scaleFactorW2 = (resizeCanvas.width) / (bigAC)
	resizeContext.scale(scaleFactorW2, scaleFactorH)
	resizeContext.drawImage(
		rotateCanvas,
		0, 0
	)
	resizeContext.resetTransform()

	// resizeContext.globalCompositeOperation = 'source-over'
	// for (let x = 0; x <= resizeCanvas.width; x += 4) {
	// 	resizeContext.fillStyle = 'rgb(255, 0, 251)'
	// 	resizeContext.fillRect(x+2, 0, 2, resizeCanvas.height)
	// }

	// resizeContext.globalCompositeOperation = 'screen'
	// for (let y = 0; y <= resizeCanvas.height ; y += 3) {
	// 	resizeContext.fillStyle = 'rgb(251, 151, 0)'
	// 	resizeContext.fillRect(1, y, 1, 1)
	// }
	resizeContext.fillStyle = 'rgb(251, 151, 0)'
	resizeContext.fillRect(1, 4 * 8, 1, 1)
	resizeContext.fillRect(1, 4 * 7, 1, 1)
	resizeContext.fillRect(1, 4 * 6, 1, 1)
	resizeContext.fillRect(1, 4 * 5, 1, 1)
	resizeContext.fillRect(1, 4 * 4, 1, 1)
	resizeContext.fillRect(1, 4 * 3, 1, 1)
	resizeContext.fillRect(1, 4 * 2, 1, 1)
	resizeContext.fillRect(1, 4 * 1, 1, 1)
	resizeContext.fillStyle = 'rgb(0, 213, 251)'
	resizeContext.fillRect(1, 4 * 8 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 7 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 6 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 5 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 4 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 3 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 2 + 4 * 9, 1, 1)
	resizeContext.fillRect(1, 4 * 1 + 4 * 9, 1, 1)

	return resizeCanvas
}