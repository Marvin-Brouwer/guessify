import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'
import { BoundaryDetail } from './boundary-scan';

export function drawBoundaryDetail<T extends OffscreenCanvas>(canvas: T, boundary: BoundaryDetail | undefined, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (!ellipsoid) return canvas
	if (angles === undefined) return canvas
	if (boundary === undefined) return canvas

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

	// Mark an area of where we'll be searching for the last 0 bar
	ctx.strokeStyle = 'rgba(25, 0, 255, 0.5)'
	ctx.beginPath()
	ctx.ellipse(
		ellipsoid.averageX + boundary.estimatedLastZeroX, ellipsoid.averageY + boundary.estimatedLastZeroY,
		boundary.widthDifference * 1.2, boundary.widthDifference * 2.5,
		0, 0, 180
	)
	ctx.stroke()

	for (let xStart = boundary.widthDifference; xStart > 0; xStart --) {
		ctx.fillStyle = `rgba(25, 0, 255, ${.05 * xStart})`
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

	ctx.fillStyle = 'rgb(0, 225, 255)'
	ctx.fillRect(Math.round(boundary.zeroRightX - 1), Math.round(boundary.zeroRightY), 3, 1)
	ctx.fillRect(Math.round(boundary.zeroRightX), Math.round(boundary.zeroRightY - 2), 1, 5)

	return canvas
}