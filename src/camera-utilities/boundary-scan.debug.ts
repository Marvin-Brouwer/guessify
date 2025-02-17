import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'
import { BoundaryDetail } from './boundary-scan';

export function drawBoundaryDetail<T extends OffscreenCanvas>(canvas: T, boundary: BoundaryDetail | undefined, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)
	if (!ellipsoid) return canvas
	if (!angles) return canvas
	if (!boundary) return canvas

	markLastZeroEstimation(ctx, ellipsoid, angles, boundary)
	markLastZeroSearch(ctx, ellipsoid, boundary)
	markLastZeroLocation(ctx, boundary)
	markCenterSearch(ctx, ellipsoid, angles, boundary)
	markCenterLocation(ctx, boundary)

	// TODO
	// Calculate upper and lower position of the middle 7 bar using pythagoras and the two blue +'s
	// Check if that's accurate, otherwise add another circle scan on both sides

	// TODO
	// Calculate the rectangle using more pythagoras, perhaps in it's own file like 'boundary-calculator'

	return canvas
}

/** Illustrate the point cloud we'll be calculating the last bar position in */
function markCenterSearch(
	ctx: OffscreenCanvasRenderingContext2D,
	ellipsoid: GridEllipsoid,
	angles: AngleDetail,
	boundary: BoundaryDetail
) {
	const centerX = (boundary.zeroLeftX + boundary.zeroRightX) / 2
	const centerY = (boundary.zeroLeftY + boundary.zeroRightY) / 2

	const estimatedTopX = (ellipsoid.averageRadius) * Math.tan((angles.alphaDegree * -1))
	const estimatedTopY = (ellipsoid.averageRadius) * Math.sin(Math.abs(angles.gammaDegree))

	ctx.strokeStyle = 'rgba(255, 0, 217, 0.5)'
	ctx.beginPath()
	ctx.ellipse(
		Math.round(centerX + estimatedTopX) -1, Math.round(centerY + estimatedTopY),
		boundary.widthDifference * 1.2, boundary.widthDifference * 1.4,
		0, 0, 180
	)
	ctx.stroke()
	ctx.beginPath()
	ctx.ellipse(
		Math.round(centerX - estimatedTopX) +1, Math.round(centerY - estimatedTopY),
		boundary.widthDifference * 1.2, boundary.widthDifference * 1.4,
		0, 0, 180
	)
	ctx.stroke()

	for (let xStart = boundary.widthDifference; xStart > 0; xStart --) {
		ctx.fillStyle = `rgba(255, 0, 217, ${.05 * xStart})`
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = ((xStart * 1.2) * Math.cos(theta))
			const y = ((xStart * 1.4) * Math.sin(theta))
			ctx.fillRect(
				centerX + estimatedTopX + x,
				centerY + estimatedTopY + y,
				1, 1
			)
			ctx.fillRect(
				centerX - estimatedTopX + x,
				centerY - estimatedTopY + y,
				1, 1
			)
		}
	}
}

/** Mark the last zero bar position on the canvas */
function markLastZeroLocation(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {
	ctx.fillStyle = 'rgb(0, 225, 255)'
	ctx.fillRect(Math.round(boundary.zeroRightX - 1), Math.round(boundary.zeroRightY), 3, 1)
	ctx.fillRect(Math.round(boundary.zeroRightX), Math.round(boundary.zeroRightY - 2), 1, 5)
}

/** Mark the middle between the two zero bars on the canvas */
function markCenterLocation(
	ctx: OffscreenCanvasRenderingContext2D,
	boundary: BoundaryDetail
) {
	// (purely illustrational)
	ctx.fillStyle = 'rgb(0, 0, 255)'
	const centerX = (boundary.zeroLeftX + boundary.zeroRightX) / 2
	const centerY = (boundary.zeroLeftY + boundary.zeroRightY) / 2
	ctx.fillRect(Math.round(centerX - 1), Math.round(centerY), 3, 1)
	ctx.fillRect(Math.round(centerX), Math.round(centerY - 2), 1, 5)

	ctx.fillStyle = 'rgb(0, 225, 255)'
	ctx.fillRect(Math.round(boundary.sevenTopX ), Math.round(boundary.sevenTopY - 1), 1, 3)
	ctx.fillRect(Math.round(boundary.sevenTopX - 2), Math.round(boundary.sevenTopY ), 5, 1)
	ctx.fillRect(Math.round(boundary.sevenBottomX ), Math.round(boundary.sevenBottomY - 1), 1, 3)
	ctx.fillRect(Math.round(boundary.sevenBottomX - 2), Math.round(boundary.sevenBottomY), 5, 1)
}

/** Illustrate the point cloud we'll be calculating the last bar position in */
function markLastZeroSearch(
	ctx: OffscreenCanvasRenderingContext2D,
	ellipsoid: GridEllipsoid,
	boundary: BoundaryDetail
) {
	ctx.strokeStyle = 'rgba(255, 0, 217, 0.5)'
	ctx.beginPath()
	ctx.ellipse(
		ellipsoid.averageX + boundary.estimatedLastZeroX, ellipsoid.averageY + boundary.estimatedLastZeroY,
		boundary.widthDifference * 1.2, boundary.widthDifference * 2.5,
		0, 0, 180
	)
	ctx.stroke()

	for (let xStart = boundary.widthDifference; xStart > 0; xStart --) {
		ctx.fillStyle = `rgba(255, 0, 217, ${.05 * xStart})`
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = ((xStart * 1.2) * Math.cos(theta))
			const y = ((xStart * 2.5) * Math.sin(theta))
			ctx.fillRect(
				ellipsoid.averageX + boundary.estimatedLastZeroX + x,
				ellipsoid.averageY + boundary.estimatedLastZeroY + y,
				1, 1
			)
		}
	}
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

	// Draw the projection of where the last 0 might be
	ctx.fillStyle = 'rgb(255, 145, 0)'
	ctx.strokeStyle = 'rgba(255, 162, 0, 0.7)'
	ctx.setLineDash([3])
	ctx.lineWidth = 1

	const upperBoundX = (ellipsoid.smallRadius) * Math.sin(angles.alphaDegree)
	const upperBoundY = (ellipsoid.smallRadius) * Math.cos(angles.alphaDegree) * -1
	const lowerBoundX = (ellipsoid.smallRadius) * Math.sin(angles.alphaDegree) * -1
	const lowerBoundY = (ellipsoid.smallRadius) * Math.cos(angles.alphaDegree)

	ctx.fillRect(ellipsoid.averageX + boundary.estimatedLastZeroX - 1, ellipsoid.averageY + boundary.estimatedLastZeroY - 1, 2, 2)
	ctx.fillRect(ellipsoid.averageX + upperBoundX - 1, ellipsoid.averageY + upperBoundY - 1, 2, 2)
	ctx.fillRect(ellipsoid.averageX + lowerBoundX - 1, ellipsoid.averageY + lowerBoundY - 1, 2, 2)

	ctx.beginPath()
	ctx.moveTo(ellipsoid.averageX + boundary.estimatedLastZeroX, ellipsoid.averageY + boundary.estimatedLastZeroY)
	ctx.lineTo(ellipsoid.averageX + upperBoundX, ellipsoid.averageY + upperBoundY)
	ctx.moveTo(ellipsoid.averageX + boundary.estimatedLastZeroX, ellipsoid.averageY + boundary.estimatedLastZeroY)
	ctx.lineTo(ellipsoid.averageX + lowerBoundX, ellipsoid.averageY + lowerBoundY)
	ctx.stroke()
}