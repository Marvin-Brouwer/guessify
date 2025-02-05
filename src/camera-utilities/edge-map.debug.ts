import { canvasConfiguration } from './canvas'
import { edgeDirections, EdgeMap } from './ellipse-detect'
import { DebugCanvas, getDebugCanvasContext } from './canvas.debug'

export function drawEdgeMap<T extends DebugCanvas>(canvas: T, edges: EdgeMap | undefined): T {

	const ctx = getDebugCanvasContext(canvas);
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

		if (edge.edgeDirection === edgeDirections.SE) {

			// Draw SW
			ctx.beginPath()
			ctx.moveTo(edge.x + 2, edge.y - 2)
			ctx.lineTo(edge.x - 2, edge.y + 2)
			ctx.stroke()
			// Draw exclusion zones
			ctx.lineWidth = .5;
			ctx.strokeStyle = 'rgba(30, 0, 255, 0.8)';
			ctx.beginPath()
			ctx.moveTo(edge.x -3, edge.y - 6)
			ctx.lineTo(edge.x +3, edge.y - 6)
			ctx.stroke()
			ctx.strokeStyle = 'rgba(0, 255, 247, 0.8)';
			ctx.beginPath()
			ctx.moveTo(edge.x -3, edge.y - 8)
			ctx.lineTo(edge.x +3, edge.y - 8)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.SW) {

			// Draw SE
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y - 2)
			ctx.lineTo(edge.x + 2, edge.y + 2)
			ctx.stroke()
			// Draw exclusion zones
			ctx.lineWidth = .5;
			ctx.strokeStyle = 'rgba(30, 0, 255, 0.8)';
			ctx.beginPath()
			ctx.moveTo(edge.x -3, edge.y + 6)
			ctx.lineTo(edge.x +3, edge.y + 6)
			ctx.stroke()
			ctx.strokeStyle = 'rgba(0, 255, 247, 0.8)';
			ctx.beginPath()
			ctx.moveTo(edge.x -3, edge.y + 8)
			ctx.lineTo(edge.x +3, edge.y + 8)
			ctx.stroke()
			continue
		}
	}

	return canvas
}