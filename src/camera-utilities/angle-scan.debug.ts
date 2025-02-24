import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'

export function drawAngleDetail<T extends OffscreenCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (ellipsoid === undefined) return canvas
	if (angles === undefined) return canvas

	illustrateFirstBarScanArea(ctx, ellipsoid)
	drawMetaDetails(ctx, ellipsoid, angles)
	drawFirstZeroTriangle(ctx, ellipsoid, angles)

	return canvas
}

/** Mark the triangle from the ellipsoid to the first 0 */
function drawFirstZeroTriangle(ctx: OffscreenCanvasRenderingContext2D, ellipsoid: GridEllipsoid, angles: AngleDetail) {

	ctx.lineWidth = 1
	if (Math.abs(angles.zeroY - ellipsoid.averageY) > 5) {
		ctx.beginPath()
		ctx.strokeStyle = 'rgb(64, 0, 255)'
		ctx.setLineDash([2, 4])
		ctx.moveTo(Math.round(ellipsoid.averageX + 3), Math.round(ellipsoid.averageY))
		ctx.lineTo(Math.round(angles.zeroX), Math.round(ellipsoid.averageY))
		ctx.lineTo(Math.round(angles.zeroX), Math.round(angles.zeroY))
		ctx.stroke()
	}

	ctx.beginPath()
	ctx.strokeStyle = 'rgb(0, 225, 255)'
	ctx.setLineDash([3])
	ctx.moveTo(ellipsoid.averageX + 3, ellipsoid.averageY)
	ctx.lineTo(Math.round(angles.zeroX), Math.round(angles.zeroY))
	ctx.stroke()
	ctx.fillStyle = 'rgb(0, 225, 255)'
	ctx.fillRect(Math.round(angles.zeroX - 1), Math.round(angles.zeroY), 3, 1)
	ctx.fillRect(Math.round(angles.zeroX), Math.round(angles.zeroY - 2), 1, 5)
}

/** Write out angle and length details for extra context */
function drawMetaDetails(ctx: OffscreenCanvasRenderingContext2D, ellipsoid: GridEllipsoid, angles: AngleDetail) {

	ctx.font = "10px Arial"
	ctx.fillStyle = 'rgb(0, 95, 0)'
	ctx.strokeStyle = 'white'

	const textX = ellipsoid.averageX - ellipsoid.averageRadius
	const textY = ellipsoid.averageY - ellipsoid.averageRadius
	const drawText = (text: string, x: number, y: number) => {
		// We do both stroke and fill so this is also visible in debug mode on a real camera
		ctx.strokeText(text, textX + x, textY + y)
		ctx.fillText(text, textX + x, textY + y)
	}
	// Show Triangle lengths
	drawText(`AB = ${Math.round(angles.lengthAB * 100000) / 100000}`, +45, -30)
	drawText(`BC = ${Math.round(angles.lengthBC * 100000) / 100000}`, +45, -20)
	drawText(`AC = ${Math.round(angles.lengthAC * 100000) / 100000}`, +45, -10)
	// Show angles
	drawText(`α = ${Math.round(angles.alphaDegree * 100) / 100}°`, -15, -30)
	drawText(`β = ${Math.round(angles.betaDegree * 100) / 100}°`, -15, -20)
	drawText(`γ = ${Math.round(angles.gammaDegree * 100) / 100}°`, -15, -10)
}

/** Illustrate how we find the first 0 bar exactly */
function illustrateFirstBarScanArea(ctx: OffscreenCanvasRenderingContext2D, ellipsoid: GridEllipsoid) {

	ctx.fillStyle = 'rgba(255, 0, 242, .7)'
	for (let theta = 0; theta < (10 * Math.PI); theta++) {
		const x = ellipsoid.averageRadius / 2 + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
		const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
		ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
	}
	for (let theta = 0; theta < (10 * Math.PI); theta++) {
		const x = ellipsoid.averageRadius + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
		const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
		ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
	}

	ctx.fillStyle = 'rgba(255, 0, 242, .2)'
	for (let xStart = ellipsoid.averageRadius / 2; xStart < ellipsoid.averageRadius; xStart += 2) {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = xStart + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
			const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
			ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
		}
	}
}