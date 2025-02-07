import { canvasConfiguration, getCanvasContext } from './canvas'
import { GridEllipsoid } from './ellipse-detect'
import { AngleDetail } from './angle-scan'

export function drawAngleDetail<T extends OffscreenCanvas>(canvas: T, ellipsoid: GridEllipsoid | undefined, angles: AngleDetail | undefined): T {

	const ctx = getCanvasContext(canvas)
	if (canvasConfiguration.clearBeforeDraw) ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (!ellipsoid) return canvas
	if (angles === undefined) return canvas

	ctx.lineWidth = 1
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	const averageRadius = Math.floor((ellipsoid.radiusA + ellipsoid.radiusB) / 2)
	const smallRadius = Math.min(ellipsoid.radiusA, ellipsoid.radiusB)
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart,
	// 	checkStart,
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 2),
	// 	checkStart + (lineWidth * 2),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 4),
	// 	checkStart + (lineWidth * 4),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 6),
	// 	checkStart + (lineWidth * 6),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 8),
	// 	checkStart + (lineWidth * 8),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 10),
	// 	checkStart + (lineWidth * 10),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 12),
	// 	checkStart + (lineWidth * 12),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.strokeStyle = 'rgba(255, 0, 242, .5)'
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 38),
	// 	checkStart + (lineWidth * 38),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 40),
	// 	checkStart + (lineWidth * 40),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 74),
	// 	checkStart + (lineWidth * 74),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()
	// ctx.beginPath();
	// ctx.ellipse(
	// 	ellipsoid.averageX,
	// 	ellipsoid.averageY,
	// 	checkStart + (lineWidth * 80),
	// 	checkStart + (lineWidth * 80),
	// 	5.2, 0, 2
	// );
	// ctx.stroke()

	// // Mark top
	// ctx.beginPath()
	// ctx.lineWidth = 1;
	// ctx.setLineDash([10])
	// ctx.strokeStyle = 'rgba(255, 0, 242, .7)'
	// ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY - ellipsoid.radiusA)
	// ctx.lineTo((ellipsoid.radiusB * 18), ellipsoid.averageY - ellipsoid.radiusA)
	// ctx.stroke()
	// ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY + ellipsoid.radiusA)
	// ctx.lineTo((ellipsoid.radiusB * 18), ellipsoid.averageY + ellipsoid.radiusA)
	// ctx.stroke()


	ctx.strokeStyle = 'rgba(255, 0, 242,.3)'
	ctx.setLineDash([0])
	ctx.strokeRect(
		ellipsoid.averageX + (averageRadius * 1.5),
		ellipsoid.averageY - (averageRadius * 1.5),
		averageRadius * .5,
		averageRadius * 3
	)

	const lengthAB = angles.zeroX - ellipsoid.averageX
	const lengthBC = Math.abs(angles.zeroY - ellipsoid.averageY)
	const lengthAC = Math.sqrt(Math.pow(lengthAB, 2) + Math.pow(lengthBC, 2))
	ctx.font = "10px Arial"
	ctx.fillStyle = 'rgb(0, 95, 0)'
	ctx.strokeStyle = 'white'
	ctx.strokeText('AB = ' + Math.round(lengthAB * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 30)
	ctx.strokeText('BC = ' + Math.round(lengthBC * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 20)
	ctx.strokeText('AC = ' + Math.round(lengthAC * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 10)
	ctx.fillText('AB = ' + Math.round(lengthAB * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 30)
	ctx.fillText('BC = ' + Math.round(lengthBC * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 20)
	ctx.fillText('AC = ' + Math.round(lengthAC * 100) / 100, ellipsoid.averageX - averageRadius - 55, ellipsoid.averageY - averageRadius - 10)

	ctx.strokeText('α = ' + Math.round(angles.alphaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 30)
	ctx.strokeText('β = ' + Math.round(angles.betaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 20)
	ctx.strokeText('γ = ' + Math.round(angles.gammaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 10)
	ctx.fillText('α = ' + Math.round(angles.alphaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 30)
	ctx.fillText('β = ' + Math.round(angles.betaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 20)
	ctx.fillText('γ = ' + Math.round(angles.gammaDegree * 100) / 100, ellipsoid.averageX - averageRadius, ellipsoid.averageY - averageRadius - 10)

	const lineWidth = lengthAC / 8
	const checkStart = angles.zeroX

	const testLength = checkStart + ((40) * lineWidth)
	const testAB = testLength * Math.cos(angles.alphaDegree)
	const testBC = testLength * Math.sin(angles.alphaDegree)
	const testAX = ellipsoid.averageX
	const testAY = ellipsoid.averageY



	// Illustrate midpoint
	ctx.beginPath()
	ctx.strokeStyle = 'rgba(255, 0, 242, .7)'
	ctx.lineWidth = 1;
	ctx.setLineDash([10])
	ctx.beginPath()
	ctx.moveTo(testAX, testAY)
	ctx.lineTo(testAX + testAB, testAY + testBC)
	ctx.stroke()
	// Mark top and bottom
	ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY - averageRadius)
	ctx.lineTo(testAX + testAB, testAY + testBC - averageRadius)
	ctx.stroke()
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.moveTo((ellipsoid.averageX), ellipsoid.averageY + averageRadius)
	ctx.lineTo(testAX + testAB, testAY + testBC + averageRadius)
	ctx.stroke()
	ctx.beginPath()
	ctx.setLineDash([3,2])
	ctx.lineWidth = 2
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 7))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 7))
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 6))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 6))
	ctx.stroke()
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.beginPath()
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 5))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 5))
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 4))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 4))
	ctx.stroke()
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.beginPath()
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 3))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 3))
	ctx.stroke()
	ctx.beginPath()
	ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 2))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 2))
	ctx.stroke()
	ctx.strokeStyle = 'rgba(255, 0, 242, .3)'
	ctx.beginPath()
	ctx.moveTo((ellipsoid.averageX + smallRadius), ellipsoid.averageY - ((smallRadius / 8) * 1))
	ctx.lineTo(testAX + testAB, testAY + testBC - ((smallRadius / 8) * 1))
	ctx.stroke()

	ctx.lineWidth = 1;
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

	// const rotateCanvas = new OffscreenCanvas(canvas.width, canvas.height)
	// const rotateContext = getCanvasContext(rotateCanvas)
	// rotateContext.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0 ,0)
	// ctx.clearRect(0,0,canvas.width, canvas.height)
	// ctx.translate(ellipsoid.averageX, ellipsoid.averageY);
	// ctx.rotate(- alpha.alphaDegree)
	// ctx.drawImage(rotateCanvas, - ellipsoid.averageX, - ellipsoid.averageY);

	return canvas
}
function Degree2Rad(degree: number){
  return degree*Math.PI/180
}