import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'
import { BoundaryDetail } from './boundary-scan'

export function drawBoundaryDetail<T extends OffscreenCanvas>(canvas: T, boundary: BoundaryDetail | undefined, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (ellipsoid === undefined) return canvas
	if (angles === undefined) return canvas

	markBarSearch(ctx, angles)

	if (boundary === undefined) return canvas

	markBars(ctx, boundary)
	markOuterZeroLocation(ctx, ellipsoid, boundary)
	markCenterLine(ctx, boundary)

	return canvas
}

/** Mark the last zero bar position on the canvas */
function markOuterZeroLocation(
	ctx: OffscreenCanvasRenderingContext2D,
	ellipsoid: GridEllipsoid,
	boundary: BoundaryDetail
) {
	ctx.strokeStyle = 'yellow'
	ctx.lineWidth = 2
	ctx.setLineDash([0])
	const lastX1 = boundary.zeroRightX + 1 - (ellipsoid.averageRadius * Math.sin(boundary.recalculatedAlphaDegree))
	const lastX2 = boundary.zeroRightX + 1 + (ellipsoid.averageRadius * Math.sin(boundary.recalculatedAlphaDegree))
	const lastY1 = boundary.zeroRightY + (ellipsoid.averageRadius * Math.cos(boundary.recalculatedAlphaDegree))
	const lastY2 = boundary.zeroRightY - (ellipsoid.averageRadius * Math.cos(boundary.recalculatedAlphaDegree))
	const firstX1 = boundary.zeroLeftX - 1 - (ellipsoid.averageRadius * Math.sin(boundary.recalculatedAlphaDegree))
	const firstX2 = boundary.zeroLeftX - 1 + (ellipsoid.averageRadius * Math.sin(boundary.recalculatedAlphaDegree))
	const firstY1 = boundary.zeroLeftY + (ellipsoid.averageRadius * Math.cos(boundary.recalculatedAlphaDegree))
	const firstY2 = boundary.zeroLeftY - (ellipsoid.averageRadius * Math.cos(boundary.recalculatedAlphaDegree))
	ctx.beginPath()
	ctx.moveTo(lastX1, lastY1)
	ctx.lineTo(lastX2, lastY2)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(firstX1, firstY1)
	ctx.lineTo(firstX2, firstY2)
	ctx.stroke()
	ctx.lineWidth = 1
}

/** Illustrate line along which we search for bars */
function markBarSearch(
	ctx: OffscreenCanvasRenderingContext2D,
	angles: AngleDetail
) {

	const secondaryOffsetAmount = Math.abs(angles.alphaDegree) < .1 ? 2 : 3
	const secondaryOffset = angles.rotatedUpwards ? secondaryOffsetAmount : -1 * secondaryOffsetAmount

	for (let xStart = 0; xStart <= ctx.canvas.width - angles.zeroMinX; xStart++) {

		const x = angles.zeroMinX + (xStart * Math.cos(angles.alphaDegree))
		const y = angles.zeroAverageY + (xStart * Math.sin(angles.alphaDegree))

		if (xStart % 2 !== 0) continue

		ctx.fillStyle = 'rgba(255, 0, 217, 0.5)'
		ctx.fillRect(
			x,
			y,
			1, 1
		)
		ctx.fillStyle = 'rgba(255, 0, 217, 0.3)'
		ctx.fillRect(
			x,
			y + secondaryOffset,
			1, 1
		)
	}
}

/** Illustrate the point cloud of hills and valleys */
function markBars(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {

	ctx.fillStyle = 'red'

	for (const [x, y] of boundary.hills) {
		ctx.fillRect(
			x,
			y,
			1, 1
		)
	}
	ctx.fillStyle = 'darkRed'
	for (const [x, y] of boundary.valleys) {
		ctx.fillRect(
			x,
			y,
			1, 1
		)
	}
}

/** Illustrate the real center line */
function markCenterLine(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {
	ctx.setLineDash([0])
	ctx.strokeStyle = 'rgba(0, 255, 34, .7)'
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(boundary.zeroLeftX, boundary.zeroLeftY)
	ctx.lineTo(boundary.zeroRightX, boundary.zeroRightY)
	ctx.stroke()
}