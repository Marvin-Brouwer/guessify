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

	hills: [x: number, y: number][]
	valleys: [x: number, y: number][]

	recalculatedAlphaDegree: number
}

export function findBoundary(angles: AngleDetail | undefined, ellipsoid: GridEllipsoid | undefined, grid: PixelGrid | undefined): BoundaryDetail | undefined {
	if (!angles) return undefined
	if (!ellipsoid) return undefined
	if (!grid) return undefined

	let onBar = false;
	const hills: [x1: number, y1: number][] = []
	const valleys: [x1: number, y1: number][] = []

	for (let xStart = 0; xStart <= grid.width - angles.zeroX; xStart++) {

		if (valleys.length === 23) break;

		const absoluteX = angles.zeroX - 10 + (xStart * Math.cos(angles.alphaDegree))
		const absoluteY = angles.zeroY + (xStart * Math.sin(angles.alphaDegree))

		if (onBar) {
			let pixel = grid.pixel(absoluteX, absoluteY)
			if (pixel.r === 0 && pixel.g === 0) {
				onBar = false;
				valleys.push([pixel.x, pixel.y])
				continue;
			}
			pixel = grid.pixel(absoluteX, absoluteY -1)
			if (pixel.r === 0 && pixel.g === 0) {
				onBar = false;
				valleys.push([pixel.x, pixel.y])
				continue;
			}
			pixel = grid.pixel(absoluteX, absoluteY +1)
			if (pixel.r === 0 && pixel.g === 0) {
				onBar = false;
				valleys.push([pixel.x, pixel.y])
				continue;
			}
			continue;
		}
		let pixel = grid.pixel(absoluteX, absoluteY)
		if (pixel.r === 255 && pixel.g === 255) {
			onBar = true;
			hills.push([pixel.x, pixel.y])
			continue;
		}
		pixel = grid.pixel(absoluteX, absoluteY -1)
		if (pixel.r === 255 && pixel.g === 255) {
			onBar = true;
			hills.push([pixel.x, pixel.y])
			continue;
		}
		pixel = grid.pixel(absoluteX, absoluteY +1)
		if (pixel.r === 255 && pixel.g === 255) {
			onBar = true;
			hills.push([pixel.x, pixel.y])
			continue;
		}
	}

	if (hills.length !== 23) return undefined

	// TODO perhaps improve midpoint here
	const zeroRightX = valleys.at(22)?.[0]!;
	const zeroRightY = valleys.at(22)?.[1]!


	const middleIndex = 11;
	let minMiddleX = hills.at(middleIndex)?.[0]!;
	let maxMiddleX = valleys.at(middleIndex)?.[0]!;
	let minMiddleY = hills.at(middleIndex)?.[1]!;
	let maxMiddleY = valleys.at(middleIndex)?.[1]!;

	const middleY = Math.round((maxMiddleY + minMiddleY) / 2)
	const middleX = Math.round((maxMiddleX + minMiddleX) / 2)

	const sideAB = zeroRightX - angles.zeroX
	const sideBC = zeroRightY - angles.zeroY
	const recalculatedRotationAlphaDegree = Math.tan(sideBC / sideAB)

	const sevenTopX = middleX - (ellipsoid.averageRadius * Math.tan((recalculatedRotationAlphaDegree * -1)))
	const sevenBottomX = middleX + (ellipsoid.averageRadius * Math.tan((recalculatedRotationAlphaDegree * -1)))
	let sevenTopY = Infinity;
	let sevenBottomY = 0;

	const maxCheck = ellipsoid.bigRadius + 2;
	for (let offset = -1 * maxCheck; offset <= maxCheck; offset ++){
		const checkDistance = offset;

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
		zeroLeftX: angles.zeroX,
		zeroLeftY: angles.zeroY,
		zeroRightX,
		zeroRightY,

		sevenTopX,
		sevenTopY,
		sevenBottomX,
		sevenBottomY,
		recalculatedAlphaDegree: recalculatedRotationAlphaDegree
	}
}