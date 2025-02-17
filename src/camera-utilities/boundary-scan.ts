import { AngleDetail } from './angle-scan'
import { GridEllipsoid } from './ellipse-detect'
import { PixelGrid } from './pixel-grid'

export type BoundaryDetail = {

	zeroLeftX: number
	zeroLeftY: number

	zeroRightX: number
	zeroRightY: number

	sevenTopX: number
	sevenTopY: number
	sevenBottomX: number
	sevenBottomY: number

	// leftTopX: number
	// leftTopY: number
	// leftBottomX: number
	// leftBottomY: number
	// rightTopX: number
	// rightTopY: number
	// rightBottomX: number
	// rightBottomY: number

	/** This is the difference between the circle diameter and the length of the distance to the first 0 */
	widthDifference:number,
	/** This is an estimated distance to where the last 0 might be */
	estimatedWidth:number,
	estimatedLastZeroX: number,
	estimatedLastZeroY: number
}

export function findBoundary(angles: AngleDetail | undefined, ellipsoid: GridEllipsoid | undefined, grid: PixelGrid | undefined): BoundaryDetail | undefined {
	if (!angles) return undefined
	if (!ellipsoid) return undefined
	if (!grid) return undefined

	// This is a product of trial and error
	const widthDifference = ellipsoid.averageRadius <= angles.lengthAB
		? Math.abs(angles.lengthAB - (ellipsoid.averageRadius * 2))
		: Math.abs((ellipsoid.averageRadius * 2) - angles.lengthAB)
	const estimatedWidth = (widthDifference * 53) - (angles.lengthBC * Math.abs(angles.alphaDegree) * 31) +
		(angles.rotatedUpwards ? +(widthDifference * 2) : -(widthDifference * 2))

	// COS(alpha) = AB / AC
	// COS(alpha) = X / averageRadius
	// COS(alpha) * averageRadius = X
	const estimatedLastZeroX = (estimatedWidth) * Math.cos(angles.alphaDegree)
	// SIN(alpha) = BC / AC
	// SIN(alpha) = Y / averageRadius
	// SIN(alpha) * averageRadius = Y
	const estimatedLastZeroY = (estimatedWidth) * Math.sin(angles.alphaDegree)

	// First find the last 0 bar
	let maxX = 0
	let maxY = 0
	let minY = Infinity

	for (let xStart = widthDifference; xStart > 0; xStart --) {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = ((xStart * 1.2) * Math.cos(theta))
			const y = ((xStart * 2.5) * Math.sin(theta))
			const absoluteX = Math.round(ellipsoid.averageX + estimatedLastZeroX + x)
			const absoluteY = Math.round(ellipsoid.averageY + estimatedLastZeroY + y)

			const pixel = grid.pixel(absoluteX, absoluteY)
			if (pixel.r === 255 && pixel.g === 255) {
				maxX = Math.max(maxX, pixel.x)
				minY = Math.min(minY, pixel.y)
				maxY = Math.max(maxY, pixel.y + 1)
			}
		}
	}
	const zeroRightX = maxX;
	const zeroRightY = Math.floor((maxY + minY) / 2)

	let sevenTopMaxX = 0
	let sevenTopMinY = Infinity
	let sevenTopMinX = Infinity

	let sevenBottomMaxX = 0
	let sevenBottomMinX = Infinity
	let sevenBottomMaxY = 0


	const centerX = (angles.zeroX + zeroRightX) / 2
	const centerY = (angles.zeroY + zeroRightY) / 2
	const estimatedTopX = (ellipsoid.averageRadius) * Math.tan((angles.alphaDegree * -1))
	const estimatedTopY = (ellipsoid.averageRadius) * Math.sin(Math.abs(angles.gammaDegree))

	for (let xStart = widthDifference; xStart > 0; xStart --) {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = ((xStart * 1.2) * Math.cos(theta))
			const y = ((xStart * 1.4) * Math.sin(theta))

			const absoluteTopX = Math.round(centerX + estimatedTopX + x)
			const absoluteTopY = Math.round(centerY - estimatedTopY + y)

			let pixel = grid.pixel(absoluteTopX, absoluteTopY)
			if (pixel.r === 255 && pixel.g === 255) {
				sevenTopMinX = Math.min(sevenTopMinX, pixel.x)
				sevenTopMaxX = Math.max(sevenTopMaxX, pixel.x)
				sevenTopMinY = Math.min(sevenTopMinY, pixel.y - 1)
			}

			const absoluteBottomX = Math.round(centerX + estimatedTopX + x)
			const absoluteBottomY = Math.round(centerY + estimatedTopY + y)

			pixel = grid.pixel(absoluteBottomX, absoluteBottomY)
			if (pixel.r === 255 && pixel.g === 255) {
				sevenBottomMinX = Math.min(sevenBottomMinX, pixel.x)
				sevenBottomMaxX = Math.max(sevenBottomMaxX, pixel.x)
				sevenBottomMaxY = Math.max(sevenBottomMaxY, pixel.y + 1)
			}
		}
	}

	// TODO, it's probably better to calculate the difference from the center using these coordinates
	// and then using pythagoras
	const sevenTopX = Math.floor((sevenTopMaxX + sevenBottomMinX + centerX - estimatedTopX) / 3);
	const sevenTopY = sevenTopMinY
	const sevenBottomX = Math.floor((sevenBottomMaxX + sevenBottomMinX + centerX - estimatedTopX) / 3)
	const sevenBottomY = sevenBottomMaxY

	return {
		zeroLeftX: angles.zeroX,
		zeroLeftY: angles.zeroY,
		zeroRightX,
		zeroRightY,

		widthDifference,
		estimatedWidth,
		estimatedLastZeroX,
		estimatedLastZeroY,

		sevenTopX,
		sevenTopY,
		sevenBottomX,
		sevenBottomY
	}
}