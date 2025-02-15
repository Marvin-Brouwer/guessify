import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'

/** Draw debug information about the ellipse's positioning */
export function drawEllipsoid<T extends OffscreenCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined) : T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if(canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!ellipsoid) return canvas;

	markExtremities(ctx, ellipsoid)
	drawEllipse(ctx, ellipsoid)

	return canvas
}

/** Draw a clear indication of where we think the ellipse currently is in the viewfinder */
function drawEllipse(ctx: OffscreenCanvasRenderingContext2D, ellipsoid: GridEllipsoid) {

	ctx.fillStyle = 'yellow'
	ctx.strokeStyle = 'yellow'

	// Mark center
	ctx.fillRect(ellipsoid.averageX - 2, ellipsoid.averageY - 2, 4, 4)

	// Draw a stroke around the ellipse
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		ellipsoid.radiusA - 1,
		ellipsoid.radiusB - 1,
		-45, 0, 180
	);
	ctx.stroke()
}

/** Mark a cross along the x and y coordinates which dictate the diameter of the ellipsoid */
function markExtremities(ctx: OffscreenCanvasRenderingContext2D, ellipsoid: GridEllipsoid) {

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
}