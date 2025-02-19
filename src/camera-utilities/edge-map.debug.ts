import { canvasConfiguration } from './canvas'
import { edgeDirections, EdgeMap } from './ellipse-detect'

/** Draw a representation of where we think the diagonal edges of the elliptical logo hang out */
export function drawEdgeMap<T extends OffscreenCanvas>(canvas: T, edges: EdgeMap | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas);
	if(canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)
	if (!edges) return canvas;

	for (const edge of edges) {

		if (!edge) continue;

		ctx.strokeStyle = 'rgb(30, 0, 255)'
		ctx.lineWidth = 3;

		if (edge.edgeDirection === edgeDirections.NS) {

			// Draw horizontal
			ctx.strokeStyle = 'red';
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y)
			ctx.lineTo(edge.x + 2, edge.y)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.EW) {

			// Draw vertical
			ctx.strokeStyle = 'purple';
			ctx.beginPath()
			ctx.moveTo(edge.x, edge.y - 2)
			ctx.lineTo(edge.x, edge.y + 2)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.NE) {

			ctx.lineWidth = 1;
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y + 2)
			ctx.lineTo(edge.x + 2, edge.y - 2)
			ctx.stroke()
			ctx.lineWidth = 2;
			ctx.beginPath()
			ctx.moveTo(edge.x - 1, edge.y - 3)
			ctx.lineTo(edge.x + 3, edge.y + 1)
			ctx.stroke()

			continue
		}

		if (edge.edgeDirection === edgeDirections.SW) {

			ctx.lineWidth = 1;
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y + 2)
			ctx.lineTo(edge.x + 2, edge.y - 2)
			ctx.stroke()
			ctx.lineWidth = 2;
			ctx.beginPath()
			ctx.moveTo(edge.x + 1, edge.y + 3)
			ctx.lineTo(edge.x - 3, edge.y - 1)
			ctx.stroke()
			continue
		}
		if (edge.edgeDirection === edgeDirections.SE) {

			ctx.lineWidth = 1;
			ctx.beginPath()
			ctx.moveTo(edge.x + 2, edge.y + 2)
			ctx.lineTo(edge.x - 2, edge.y - 2)
			ctx.stroke()
			ctx.lineWidth = 2;
			ctx.beginPath()
			ctx.moveTo(edge.x - 1, edge.y + 3)
			ctx.lineTo(edge.x + 3, edge.y - 1)
			ctx.stroke()
			continue
		}
		if (edge.edgeDirection === edgeDirections.NW) {

			ctx.lineWidth = 1;
			ctx.beginPath()
			ctx.moveTo(edge.x + 2, edge.y + 2)
			ctx.lineTo(edge.x - 2, edge.y - 2)
			ctx.stroke()
			ctx.lineWidth = 2;
			ctx.beginPath()
			ctx.moveTo(edge.x + 1, edge.y - 3)
			ctx.lineTo(edge.x - 3, edge.y + 1)
			ctx.stroke()
			continue
		}
	}

	return canvas
}