import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'
import { BoundaryDetail } from './boundary-scan'

export function drawBoundaryDetail<T extends OffscreenCanvas>(canvas: T, boundary: BoundaryDetail | undefined, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (ellipsoid === undefined) return canvas
	if (angles === undefined) return canvas
	if (boundary === undefined) return canvas

	markLastZeroEstimation(ctx, ellipsoid, angles, boundary)
	markLastZeroSearch(ctx, angles, boundary)
	markOuterZeroLocation(ctx, boundary)
	markCenterLocation(ctx, boundary)

	return canvas
}

/** Mark the last zero bar position on the canvas */
function markOuterZeroLocation(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {
	ctx.strokeStyle = 'yellow'
	ctx.lineWidth = 2
	ctx.setLineDash([0])
	const lastX1 = boundary.zeroRightX + 2 - (10 * Math.sin(boundary.recalculatedAlphaDegree))
	const lastX2 = boundary.zeroRightX + 2 + (10 * Math.sin(boundary.recalculatedAlphaDegree))
	const lastY1 = boundary.zeroRightY + (10 * Math.cos(boundary.recalculatedAlphaDegree))
	const lastY2 = boundary.zeroRightY - (10 * Math.cos(boundary.recalculatedAlphaDegree))
	const firstX1 = boundary.zeroLeftX - 2 - (10 * Math.sin(boundary.recalculatedAlphaDegree))
	const firstX2 = boundary.zeroLeftX - 2 + (10 * Math.sin(boundary.recalculatedAlphaDegree))
	const firstY1 = boundary.zeroLeftY + (10 * Math.cos(boundary.recalculatedAlphaDegree))
	const firstY2 = boundary.zeroLeftY - (10 * Math.cos(boundary.recalculatedAlphaDegree))
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

/** Mark the middle between the two zero bars on the canvas */
function markCenterLocation(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {
	// (purely illustrational)
	ctx.fillStyle = 'rgb(0, 0, 255)'
	const middleIndex = 11;
	let minMiddleX = boundary.hills.at(middleIndex)?.[0]!;
	let maxMiddleX = boundary.valleys.at(middleIndex)?.[0]!;
	let minMiddleY = boundary.hills.at(middleIndex)?.[1]!;
	let maxMiddleY = boundary.valleys.at(middleIndex)?.[1]!;
	const centerX = (minMiddleX + maxMiddleX) / 2
	const centerY = (minMiddleY + maxMiddleY) / 2
	ctx.fillRect(Math.round(centerX - 1), Math.round(centerY), 3, 1)
	ctx.fillRect(Math.round(centerX), Math.round(centerY - 2), 1, 5)

	ctx.strokeStyle = 'yellow'
	ctx.lineWidth = 2
	ctx.setLineDash([0])
	const topX1 = boundary.sevenTopX - (5 * Math.cos(boundary.recalculatedAlphaDegree))
	const topX2 = boundary.sevenTopX + (5 * Math.cos(boundary.recalculatedAlphaDegree))
	const topY1 = boundary.sevenTopY - 2 - (5 * Math.sin(boundary.recalculatedAlphaDegree))
	const topY2 = boundary.sevenTopY - 2 + (5 * Math.sin(boundary.recalculatedAlphaDegree))
	const bottomX1 = boundary.sevenBottomX - (5 * Math.cos(boundary.recalculatedAlphaDegree))
	const bottomX2 = boundary.sevenBottomX + (5 * Math.cos(boundary.recalculatedAlphaDegree))
	const bottomY1 = boundary.sevenBottomY + 2 - (5 * Math.sin(boundary.recalculatedAlphaDegree))
	const bottomY2 = boundary.sevenBottomY + 2 + (5 * Math.sin(boundary.recalculatedAlphaDegree))
	ctx.beginPath()
	ctx.moveTo(topX1, topY1)
	ctx.lineTo(topX2, topY2)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(bottomX1, bottomY1)
	ctx.lineTo(bottomX2, bottomY2)
	ctx.stroke()
	ctx.lineWidth = 1
}

/** Illustrate the point cloud we'll be calculating the last bar position in */
function markLastZeroSearch(
	ctx: OffscreenCanvasRenderingContext2D,
	angles: AngleDetail,
	boundary: BoundaryDetail
) {

	for (let xStart = 0; xStart <= ctx.canvas.width - angles.zeroX; xStart++) {

		const x = angles.zeroX + (xStart * Math.cos(angles.alphaDegree))
		const y = angles.zeroY + (xStart * Math.sin(angles.alphaDegree))

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
			y - 2,
			1, 1
		)
		ctx.fillRect(
			x,
			y + 2,
			1, 1
		)
	}
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

	// ctx.strokeStyle = 'rgba(255, 0, 217, 0.5)'
	// ctx.beginPath()
	// ctx.ellipse(
	// 	ellipsoid.averageX + boundary.estimatedLastZeroX, ellipsoid.averageY + boundary.estimatedLastZeroY,
	// 	boundary.widthDifference * 1.2, boundary.widthDifference * 2.5,
	// 	0, 0, 180
	// )
	// ctx.stroke()
	// for (let xStart = boundary.widthDifference; xStart > 0; xStart--) {
	// 	ctx.fillStyle = `rgba(255, 0, 217, ${.05 * xStart})`
	// 	for (let theta = 0; theta < (10 * Math.PI); theta++) {
	// 		const x = ((xStart * 1.2) * Math.cos(theta))
	// 		const y = ((xStart * 2.5) * Math.sin(theta))
	// 		ctx.fillRect(
	// 			ellipsoid.averageX + boundary.estimatedLastZeroX + x,
	// 			ellipsoid.averageY + boundary.estimatedLastZeroY + y,
	// 			1, 1
	// 		)
	// 	}
	// }
}

/** Illustrate where we think the last zero bar might be and how we got there */
function markLastZeroEstimation(
	ctx: OffscreenCanvasRenderingContext2D,
	ellipsoid: GridEllipsoid,
	angles: AngleDetail,
	boundary: BoundaryDetail
) {
	// Mark bounds of where the top and bottom of the triangle should end up
	ctx.setLineDash([1])
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.strokeRect(
		angles.rotatedUpwards
			? ellipsoid.averageX - angles.lengthBC
			: ellipsoid.averageX,
		ellipsoid.averageY - ellipsoid.bigRadius,
		angles.lengthBC,
		ellipsoid.bigRadius
	)
	ctx.strokeRect(
		angles.rotatedUpwards
			? ellipsoid.averageX
			: ellipsoid.averageX - angles.lengthBC,
		ellipsoid.averageY,
		angles.lengthBC,
		ellipsoid.bigRadius
	)

	ctx.strokeStyle = 'rgba(255, 162, 0, 0.5)'
	ctx.setLineDash([3])
	ctx.lineWidth = 1

	ctx.beginPath()
	ctx.moveTo(boundary.zeroRightX, boundary.zeroRightY)
	ctx.lineTo(boundary.sevenTopX, boundary.sevenTopY)
	ctx.lineTo(boundary.zeroLeftX, boundary.zeroLeftY)
	ctx.lineTo(boundary.sevenBottomX, boundary.sevenBottomY)
	ctx.lineTo(boundary.zeroRightX, boundary.zeroRightY)
	ctx.stroke()
}