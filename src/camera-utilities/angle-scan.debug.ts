import { canvasConfiguration } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'

export function drawAngleDetail<T extends OffscreenCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = canvasConfiguration.getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (!ellipsoid) return canvas
	if (angles === undefined) return canvas

	ctx.fillStyle = 'rgba(255, 0, 242, .7)'
	for (let theta = 0; theta < (10 * Math.PI); theta++) {
		const x = ellipsoid.averageRadius / 2 + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
		const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
		ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
	}
	for (let theta = 0; theta < (10 * Math.PI); theta++) {
		const x = ellipsoid.averageRadius + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
		const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
		ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
	}

	ctx.fillStyle = 'rgba(255, 0, 242, .2)'
	for (let xStart = ellipsoid.averageRadius / 2; xStart < ellipsoid.averageRadius; xStart +=2) {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = xStart + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
			const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
			ctx.fillRect(ellipsoid.averageX + x, ellipsoid.averageY + y, 1, 1)
		}
	}

	const lengthAB = Math.round(angles.lengthAB * 100) / 100
	const lengthBC = Math.round(angles.lengthBC * 100) / 100
	const lengthAC = Math.round(angles.lengthAC * 100) / 100

	ctx.font = "10px Arial"
	ctx.fillStyle = 'rgb(0, 95, 0)'
	ctx.strokeStyle = 'white'
	ctx.strokeText('AB = ' + Math.round(lengthAB * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 30)
	ctx.strokeText('BC = ' + Math.round(lengthBC * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 20)
	ctx.strokeText('AC = ' + Math.round(lengthAC * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 10)
	ctx.fillText('AB = ' + Math.round(lengthAB * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 30)
	ctx.fillText('BC = ' + Math.round(lengthBC * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 20)
	ctx.fillText('AC = ' + Math.round(lengthAC * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius - 55, ellipsoid.averageY - ellipsoid.averageRadius - 10)

	ctx.strokeText('α = ' + Math.round(angles.alphaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 30)
	ctx.strokeText('β = ' + Math.round(angles.betaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 20)
	ctx.strokeText('γ = ' + Math.round(angles.gammaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 10)
	ctx.fillText('α = ' + Math.round(angles.alphaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 30)
	ctx.fillText('β = ' + Math.round(angles.betaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 20)
	ctx.fillText('γ = ' + Math.round(angles.gammaDegree * 100) / 100, ellipsoid.averageX - ellipsoid.averageRadius, ellipsoid.averageY - ellipsoid.averageRadius - 10)

	const up = angles.alphaDegree < 0

	// COS(alpha) = AB / AC
	// COS(alpha) = X / averageRadius
	// COS(alpha) * averageRadius = X
	const midPointX = (angles.lengthAC * 6.5) * Math.cos(angles.alphaDegree)
	// SIN(alpha) = BC / AC
	// SIN(alpha) = Y / averageRadius
	// SIN(alpha) * averageRadius = Y
	const midPointY = (angles.lengthAC * 6.5) * Math.sin(angles.alphaDegree)


	const upperBoundX = (ellipsoid.smallRadius) * Math.sin(angles.alphaDegree)
	const upperBoundY = (ellipsoid.smallRadius) * Math.cos(angles.alphaDegree) * -1
	const lowerBoundX = (ellipsoid.smallRadius) * Math.sin(angles.alphaDegree) * -1
	const lowerBoundY = (ellipsoid.smallRadius) * Math.cos(angles.alphaDegree)


	ctx.fillStyle = 'rgb(255, 145, 0)'
	ctx.strokeStyle = 'rgba(255, 162, 0, 0.7)'
	ctx.setLineDash([3])
	ctx.lineWidth = 1;
	// Mark top and bottom
	ctx.fillRect(ellipsoid.averageX + midPointX - 1, ellipsoid.averageY + midPointY - 1, 2, 2)
	ctx.fillRect(ellipsoid.averageX + upperBoundX - 1, ellipsoid.averageY + upperBoundY - 1, 2, 2)
	ctx.fillRect(ellipsoid.averageX + lowerBoundX - 1, ellipsoid.averageY + lowerBoundY - 1, 2, 2)
	ctx.beginPath()
	ctx.moveTo(ellipsoid.averageX + midPointX, ellipsoid.averageY + midPointY)
	ctx.lineTo(ellipsoid.averageX + upperBoundX, ellipsoid.averageY + upperBoundY)
	ctx.moveTo(ellipsoid.averageX + midPointX, ellipsoid.averageY + midPointY)
	ctx.lineTo(ellipsoid.averageX + lowerBoundX, ellipsoid.averageY + lowerBoundY)
	ctx.stroke()
	ctx.setLineDash([1])
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.strokeRect(
		up ? ellipsoid.averageX - angles.lengthBC
			: ellipsoid.averageX,
		ellipsoid.averageY - ellipsoid.bigRadius,
		angles.lengthBC,
		ellipsoid.bigRadius
	)
	ctx.strokeRect(
		up ? ellipsoid.averageX
			: ellipsoid.averageX - angles.lengthBC,
		ellipsoid.averageY,
		angles.lengthBC,
		ellipsoid.bigRadius
	)
	// ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY - ellipsoid.averageRadius)
	// ctx.lineTo(testAX + testAB, testAY + testBC - ellipsoid.averageRadius)
	// ctx.stroke()
	// ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY + ellipsoid.averageRadius)
	// ctx.lineTo(testAX + testAB, testAY + testBC + ellipsoid.averageRadius)
	// ctx.stroke()

	// ctx.beginPath()
	// ctx.setLineDash([3,2])
	// ctx.lineWidth = 2
	// ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 7))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 7))
	// ctx.stroke()
	// ctx.beginPath()
	// ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 6))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 6))
	// ctx.stroke()
	// ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	// ctx.beginPath()
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 5))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 5))
	// ctx.stroke()
	// ctx.beginPath()
	// ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 4))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 4))
	// ctx.stroke()
	// ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	// ctx.beginPath()
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 3))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 3))
	// ctx.stroke()
	// ctx.beginPath()
	// ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 2))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 2))
	// ctx.stroke()
	// ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	// ctx.beginPath()
	// ctx.moveTo((ellipsoid.averageX + ellipsoid.smallRadius), ellipsoid.averageY - ((ellipsoid.smallRadius / 8) * 1))
	// ctx.lineTo(testAX + testAB, testAY + testBC - ((ellipsoid.smallRadius / 8) * 1))
	// ctx.stroke()

	ctx.lineWidth = 1
	if (Math.abs(angles.zeroY - ellipsoid.averageY) > 5) {
		ctx.beginPath()
		ctx.strokeStyle = 'rgb(64, 0, 255)'
		ctx.setLineDash([2, 4])
		ctx.moveTo(Math.round(ellipsoid.averageX + 3), Math.round(ellipsoid.averageY))
		ctx.lineTo(Math.round(angles.zeroX), Math.round(ellipsoid.averageY))
		ctx.lineTo(Math.round(angles.zeroX), Math.round(angles.zeroY))
		ctx.stroke()
	}

	ctx.beginPath()
	ctx.strokeStyle = 'rgb(0, 225, 255)'
	ctx.setLineDash([3])
	ctx.moveTo(ellipsoid.averageX + 3, ellipsoid.averageY)
	ctx.lineTo(Math.round(angles.zeroX), Math.round(angles.zeroY))
	ctx.stroke()
	ctx.fillStyle = 'rgb(0, 225, 255)'
	ctx.fillRect(Math.round(angles.zeroX - 1), Math.round(angles.zeroY), 3, 1)
	ctx.fillRect(Math.round(angles.zeroX), Math.round(angles.zeroY - 2), 1, 5)

	return canvas
}