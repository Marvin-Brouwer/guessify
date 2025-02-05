import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { DebugCanvas, getDebugCanvasContext } from './canvas.debug'

export function drawEllipsoid<T extends DebugCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined): T {

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
	ctx.fillRect(ellipsoid.xMinSE, ellipsoid.yMinSE, 2, 2)
	ctx.fillRect(ellipsoid.xMaxSE -2, ellipsoid.yMaxSE -2, 2, 2)
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgba(255, 149, 0, 0.8)'
	ctx.beginPath();
	ctx.moveTo(ellipsoid.xMinSE, ellipsoid.yMinSE)
	ctx.lineTo(ellipsoid.xMaxSE, ellipsoid.yMaxSE)
	ctx.stroke();
	ctx.fillRect(ellipsoid.xMinSW, ellipsoid.yMinSW, 2, 2)
	ctx.fillRect(ellipsoid.xMaxSW -2, ellipsoid.yMaxSW -2, 2, 2)
	ctx.beginPath();
	ctx.moveTo(ellipsoid.xMinSW, ellipsoid.yMinSW)
	ctx.lineTo(ellipsoid.xMaxSW, ellipsoid.yMaxSW)
	ctx.stroke();

	// Mark border
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'yellow'
	ctx.beginPath();
	ctx.ellipse(
		(ellipsoid.averageX),
		(ellipsoid.averageY),
		(ellipsoid.radiusA),
		(ellipsoid.radiusB),
		0, 0, 180
	);
	ctx.stroke();
	ctx.fillStyle = 'red'
	ctx.fillRect(ellipsoid.ellipsoidXse - 2, ellipsoid.ellipsoidYse - 2, 4, 4)
	ctx.fillStyle = 'purple'
	ctx.fillRect(ellipsoid.ellipsoidXsw - 2, ellipsoid.ellipsoidYsw - 2, 4, 4)

	return canvas
}