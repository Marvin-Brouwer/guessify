import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './edge-map'
import { DebugCanvas, getDebugCanvasContext } from './canvas.debug'

export function drawEllipsoid<T extends DebugCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined): T {

	const ctx = getDebugCanvasContext(canvas)
	if(canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!ellipsoid) return canvas;

	ctx.lineWidth = 4;
	ctx.fillStyle = 'yellow'
	ctx.strokeStyle = 'yellow'

	// Mark center
	ctx.fillRect(ellipsoid.x - 2, ellipsoid.y - 2, 4, 4)

	// Mark border
	ctx.beginPath();
	ctx.ellipse(
		(ellipsoid.x),
		(ellipsoid.y),
		(ellipsoid.radiusA),
		(ellipsoid.radiusB),
		0, 0, 180
	);
	ctx.stroke();

	return canvas
}