import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { getDebugCanvasContext } from './canvas.debug'

export function drawEllipsoid<T extends OffscreenCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined) : T {

	const ctx = getDebugCanvasContext(canvas)
	if(canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!ellipsoid) return canvas;


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

	// Mark center
	ctx.fillStyle = 'yellow'
	ctx.fillRect(ellipsoid.averageX - 2, ellipsoid.averageY - 2, 4, 4)

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
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	const bigRadius = Math.floor((ellipsoid.radiusA +  ellipsoid.radiusB) / 2);
	const lineWidth = bigRadius / 8
	const checkStart = lineWidth * 14
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart,
		checkStart,
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 2),
		checkStart + (lineWidth * 2),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 4),
		checkStart + (lineWidth * 4),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 6),
		checkStart + (lineWidth * 6),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 8),
		checkStart + (lineWidth * 8),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 10),
		checkStart + (lineWidth * 10),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 12),
		checkStart + (lineWidth * 12),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.strokeStyle = 'rgba(255, 0, 242, .5)'
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 38),
		checkStart + (lineWidth * 38),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 40),
		checkStart + (lineWidth * 40),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 76),
		checkStart + (lineWidth * 76),
		5.2, 0, 2
	);
	ctx.stroke()
	ctx.beginPath();
	ctx.ellipse(
		ellipsoid.averageX,
		ellipsoid.averageY,
		checkStart + (lineWidth * 78),
		checkStart + (lineWidth * 78),
		5.2, 0, 2
	);
	ctx.stroke()

	// Mark top
	ctx.beginPath()
	ctx.lineWidth = 1;
	ctx.setLineDash([10])
	ctx.strokeStyle = 'rgba(255, 0, 242, .7)'
	ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY - ellipsoid.radiusA)
	ctx.lineTo((ellipsoid.radiusB * 18), ellipsoid.averageY - ellipsoid.radiusA)
	ctx.stroke()
	ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY + ellipsoid.radiusA)
	ctx.lineTo((ellipsoid.radiusB * 18), ellipsoid.averageY + ellipsoid.radiusA)
	ctx.stroke()

	return canvas

	// return canvas;

	// const strokeWidth = (ellipsoid.radiusB * .2)

	// // Mark possible first 0
	// ctx.beginPath()
	// ctx.lineWidth = 1;
	// ctx.strokeStyle = 'rgb(0, 255, 251)'
	// ctx.moveTo(ellipsoid.averageX + ellipsoid.radiusB + (strokeWidth * 2), ellipsoid.averageY - (ellipsoid.radiusA * .5))
	// ctx.lineTo(ellipsoid.averageX + ellipsoid.radiusB + (strokeWidth * 2), ellipsoid.averageY + (ellipsoid.radiusA * .5))
	// ctx.stroke()
	// ctx.moveTo(ellipsoid.averageX + ellipsoid.radiusB + (strokeWidth * 5), ellipsoid.averageY - (ellipsoid.radiusA * .5))
	// ctx.lineTo(ellipsoid.averageX + ellipsoid.radiusB + (strokeWidth * 5), ellipsoid.averageY + (ellipsoid.radiusA * .5))
	// ctx.stroke()

	// // Mark possible middle 7
	// ctx.beginPath()
	// ctx.lineWidth = 1;
	// ctx.strokeStyle = 'rgb(0, 255, 251)'
	// ctx.moveTo(ellipsoid.averageX + (ellipsoid.radiusB * 6.8), ellipsoid.averageY - (ellipsoid.radiusA * 1.2 ))
	// ctx.lineTo(ellipsoid.averageX + (ellipsoid.radiusB * 6.8), ellipsoid.averageY + (ellipsoid.radiusA * 1.2 ))
	// ctx.moveTo(ellipsoid.averageX + (ellipsoid.radiusB * 7), ellipsoid.averageY - (ellipsoid.radiusA * 1.2 ))
	// ctx.lineTo(ellipsoid.averageX + (ellipsoid.radiusB * 7), ellipsoid.averageY + (ellipsoid.radiusA * 1.2 ))
	// ctx.stroke()

	// return canvas
}