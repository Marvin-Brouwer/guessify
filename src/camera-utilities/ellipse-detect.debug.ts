import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { getDebugCanvasContext } from './canvas.debug'

export function drawEllipsoid(canvas: OffscreenCanvas, ellipsoid: GridEllipsoid | undefined) {

	const ctx = getDebugCanvasContext(canvas)
	if(canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!ellipsoid) return canvas;


	// Mark center
	ctx.fillStyle = 'yellow'
	ctx.fillRect(ellipsoid.ellipsoidX - 2, ellipsoid.ellipsoidY - 2, 4, 4)
	ctx.fillStyle = 'rgb(255, 149, 0)'
	ctx.fillRect(ellipsoid.averageX - 2, ellipsoid.averageY - 2, 4, 4)

	// Mark extremities
	ctx.fillStyle = 'rgb(255, 149, 0)'
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(255, 149, 0, 0.8)'

	ctx.fillRect(ellipsoid.xNorthEast, ellipsoid.yNorthEast, 2, 2)
	ctx.fillRect(ellipsoid.xSouthWest -2, ellipsoid.ySouthWest -2, 2, 2)
	ctx.beginPath();
	ctx.moveTo(ellipsoid.xNorthEast, ellipsoid.yNorthEast)
	ctx.lineTo(ellipsoid.xSouthWest, ellipsoid.ySouthWest)
	ctx.stroke();
	ctx.fillRect(ellipsoid.xNorthWest, ellipsoid.yNorthWest, 2, 2)
	ctx.fillRect(ellipsoid.xSouthEast -2, ellipsoid.ySouthEast -2, 2, 2)
	ctx.beginPath();
	ctx.moveTo(ellipsoid.xNorthWest, ellipsoid.yNorthWest)
	ctx.lineTo(ellipsoid.xSouthEast, ellipsoid.ySouthEast)
	ctx.stroke();

	// Mark the ellipse
	ctx.lineWidth = 3;
	ctx.strokeStyle = 'yellow'
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		ellipsoid.radiusA - 1,
		ellipsoid.radiusB - 1,
		-45, 0, 180
	);
	ctx.stroke()

	// Mark possible first 0
	ctx.beginPath()
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(0, 13, 255)'
	ctx.moveTo(ellipsoid.averageX + (ellipsoid.radiusB * 2), ellipsoid.averageY - (ellipsoid.radiusA * .5))
	ctx.lineTo(ellipsoid.averageX + (ellipsoid.radiusB * 2), ellipsoid.averageY + (ellipsoid.radiusA * .5))
	ctx.stroke()
	ctx.moveTo(ellipsoid.averageX + (ellipsoid.radiusB * 1.8), ellipsoid.averageY - (ellipsoid.radiusA * .5))
	ctx.lineTo(ellipsoid.averageX + (ellipsoid.radiusB * 1.8), ellipsoid.averageY + (ellipsoid.radiusA * .5))
	ctx.stroke()

	return canvas
}