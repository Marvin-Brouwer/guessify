import { AngleDetail } from './angle-scan'
import { GridEllipsoid } from './ellipse-detect'
import { PixelGrid } from './pixel-grid'

export type BoundaryDetail = {

	zeroLeftX: number
	zeroLeftY: number

	zeroRightX: number
	zeroRightY: number

	hills: [x: number, y: number][]
	valleys: [x: number, y: number][]

	recalculatedAlphaDegree: number
}

type Groove = {
	onBar: boolean,
	hills: [x: number, y: number][]
	valleys: [x: number, y: number][]
}
type Grooves = {
	primary: Groove,
	secondary: Groove
}

const hillThreshold = 220
const valleyThreshold = 30

export function findBoundary(angles: AngleDetail | undefined, ellipsoid: GridEllipsoid | undefined, grid: PixelGrid | undefined): BoundaryDetail | undefined {
	if (!angles) return undefined
	if (!ellipsoid) return undefined
	if (!grid) return undefined

	const secondaryOffsetAmount = Math.abs(angles.alphaDegree) < .1 ? 2 : 3
	const secondaryOffset = angles.rotatedUpwards ? secondaryOffsetAmount : -1 * secondaryOffsetAmount
	const grooves: Grooves = {
		primary: {
			onBar: false,
			hills: [[angles.zeroMinX, angles.zeroAverageY]], valleys: [[angles.zeroMaxX, angles.zeroAverageY]]
		},
		secondary: {
			onBar: false,
			hills: [[angles.zeroMinX, angles.zeroAverageY + secondaryOffset]], valleys: [[angles.zeroMaxX, angles.zeroAverageY + secondaryOffset]]
		}
	}

	for (let xStart = 4; xStart <= grid.width - angles.zeroMinX; xStart++) {

		if (grooves.primary.valleys.length === 23) break
		if (grooves.secondary.valleys.length === 23) break

		const absoluteX = angles.zeroMaxX + (xStart * Math.cos(angles.alphaDegree))
		const absoluteY = angles.zeroAverageY + (xStart * Math.sin(angles.alphaDegree))

		if (grooves.primary.onBar) {
			const pixel = grid.pixel(absoluteX, absoluteY)
			if (pixel.r <= valleyThreshold && pixel.g <= valleyThreshold) {
				grooves.primary.onBar = false
				grooves.primary.valleys.push([pixel.x, pixel.y])
			}
		}
		else {
			const pixel = grid.pixel(absoluteX, absoluteY)
			if (pixel.r >= hillThreshold && pixel.g >= hillThreshold) {
				grooves.primary.onBar = true
				grooves.primary.hills.push([pixel.x, pixel.y])
			}
		}

		if (grooves.secondary.onBar) {
			const pixel = grid.pixel(absoluteX, absoluteY + secondaryOffset)
			if (pixel.r <= valleyThreshold && pixel.g <= valleyThreshold) {
				grooves.secondary.onBar = false
				grooves.secondary.valleys.push([pixel.x, pixel.y])
				continue
			}
		}
		else {
			const pixel = grid.pixel(absoluteX, absoluteY + secondaryOffset)
			if (pixel.r >= hillThreshold && pixel.g >= hillThreshold) {
				grooves.secondary.onBar = true
				grooves.secondary.hills.push([pixel.x, pixel.y])
				continue
			}
		}
	}

	if (grooves.primary.hills.length !== 23 && grooves.secondary.hills.length !== 23) return undefined

	const hills = grooves.primary.hills.length === 23
		? grooves.primary.hills
		: grooves.secondary.hills
	const valleys = grooves.primary.valleys.length === 23
		? grooves.primary.valleys
		: grooves.secondary.valleys

	const zeroRightX = valleys.at(22)?.[0]!
	const zeroRightMinX = hills.at(22)?.[0]!
	const zeroMiddleX = (zeroRightX + zeroRightMinX) / 2
	const zeroEstimatedY = hills.at(22)?.[1]!

	let zeroRightMinY = Infinity
	let zeroRightMaxY = 0

	for (let y = 0; y <= zeroRightX - zeroRightMinX; y++) {
		const pixelMin = grid.pixel(zeroMiddleX, zeroEstimatedY - y)
		const pixelMax = grid.pixel(zeroMiddleX, zeroEstimatedY + y)

		if (pixelMin.r >= hillThreshold)
			zeroRightMinY = Math.min(zeroRightMinY, pixelMin.y)
		if (pixelMax.r >= hillThreshold)
			zeroRightMaxY = Math.max(zeroRightMaxY, pixelMax.y)
	}

	const zeroRightY = Math.round((zeroRightMinY + zeroRightMaxY) / 2)

	const middleIndex = 11
	let minMiddleX = hills.at(middleIndex)?.[0]!
	let maxMiddleX = valleys.at(middleIndex)?.[0]!
	let minMiddleY = hills.at(middleIndex)?.[1]!
	let maxMiddleY = valleys.at(middleIndex)?.[1]!

	const middleY = Math.round((maxMiddleY + minMiddleY) / 2)
	const middleX = Math.round((maxMiddleX + minMiddleX) / 2)

	const sideAB = zeroRightX - angles.zeroMinX
	const sideBC = zeroRightY - angles.zeroAverageY
	const recalculatedRotationAlphaDegree = Math.tan(sideBC / sideAB)

	const sevenTopX = middleX - (ellipsoid.averageRadius * Math.tan((recalculatedRotationAlphaDegree * -1)))
	const sevenBottomX = middleX + (ellipsoid.averageRadius * Math.tan((recalculatedRotationAlphaDegree * -1)))
	let sevenTopY = Infinity
	let sevenBottomY = 0

	const maxCheck = ellipsoid.bigRadius + 2
	for (let offset = -1 * maxCheck; offset <= maxCheck; offset++) {
		const checkDistance = offset

		const estimatedTopY = middleY - (checkDistance * Math.cos(Math.abs(recalculatedRotationAlphaDegree)))
		let pixel = grid.pixel(sevenTopX, estimatedTopY)
		if (pixel.r === 255 && pixel.g === 255) {
			sevenTopY = Math.min(sevenTopY, pixel.y)
		}

		const estimatedBottomY = middleY + (checkDistance * Math.cos(Math.abs(recalculatedRotationAlphaDegree)))
		pixel = grid.pixel(sevenBottomX, estimatedBottomY)
		if (pixel.r === 255 && pixel.g === 255) {
			sevenBottomY = Math.max(sevenBottomY, pixel.y)
		}
	}

	return {
		hills, valleys,
		zeroLeftX: angles.zeroMinX,
		zeroLeftY: angles.zeroAverageY,
		zeroRightX,
		zeroRightY,

		// sevenTopX,
		// sevenTopY,
		// sevenBottomX,
		// sevenBottomY,
		recalculatedAlphaDegree: recalculatedRotationAlphaDegree
	}
}