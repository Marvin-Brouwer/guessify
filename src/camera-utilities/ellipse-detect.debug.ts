import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'

/** Draw debug information about the ellipse's positioning */
export function drawEllipsoid<T extends OffscreenCanvas>(canvas: T, circleMatch: GridEllipsoid | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.lineWidth = 1
	const edgeOffset = canvasConfiguration.blurAmount * 10
	const rightOffset = Math.ceil(canvas.width / 9)

	ctx.setLineDash([0])
	ctx.lineWidth = 1
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
	ctx.strokeRect(edgeOffset, edgeOffset, (canvas.width / 2) - (edgeOffset) - rightOffset, canvas.height - (edgeOffset * 2))
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
	ctx.strokeRect(edgeOffset -1, edgeOffset -1, 2 + (canvas.width / 2) - (edgeOffset) - rightOffset, 2 + canvas.height - (edgeOffset * 2))

	const radius = circleMatch?.checkRadiusInner ?? edgeOffset * 2
	for (let x = edgeOffset + radius; x < (canvas.width / 2) - rightOffset - radius; x += 3) {
		for (let y = edgeOffset + radius; y < (canvas.height - edgeOffset - radius); y += 2) {
			ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'
			ctx.fillRect(x, y, 1, 1)
		}
	}

	if (circleMatch === undefined) return canvas

	ctx.strokeStyle = 'rgb(255, 255, 0)'
	ctx.lineWidth = 3;
	ctx.beginPath()
	ctx.ellipse(
		circleMatch.averageX, circleMatch.averageY,
		circleMatch.radiusA, circleMatch.radiusB,
		0, 0, 180
	)
	ctx.stroke()

	ctx.fillStyle = 'rgb(255, 255, 0)'
	ctx.fillRect(circleMatch.averageX - 2, circleMatch.averageY - 2, 4, 4)

	ctx.lineWidth = 1
	ctx.setLineDash([3]);
	ctx.strokeStyle = 'rgb(0, 13, 255)'
	ctx.beginPath()
	ctx.ellipse(
		circleMatch.checkX, circleMatch.checkY,
		circleMatch.checkRadiusInner, circleMatch.checkRadiusInner,
		0, 0, 180
	)
	ctx.stroke()

	ctx.strokeStyle = 'rgb(0, 6, 124)'
	ctx.beginPath()
	ctx.ellipse(
		circleMatch.checkX, circleMatch.checkY,
		circleMatch.checkRadiusOuter, circleMatch.checkRadiusOuter,
		0, 0, 180
	)
	ctx.stroke()
	ctx.setLineDash([0]);

	return canvas
}