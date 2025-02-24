import { GridEllipsoid } from './ellipse-detect'
import { PixelGrid } from './pixel-grid'

export const toRad = (angle: number): number => angle * (Math.PI / 180)
export type AngleDetail = {

	zeroX: number
	zeroY: number

	alphaDegree: number
	betaDegree: 90
	gammaDegree: number

	lengthAB: number,
	lengthBC: number,
	lengthAC: number,

	rotatedUpwards: boolean
}
export function findAngles(ellipsoid: GridEllipsoid | undefined, grid: PixelGrid | undefined): AngleDetail | undefined {
	if (!ellipsoid) return undefined
	if (!grid) return undefined

	// First find the first 0 bar
	let minX = Infinity
	let maxY = 0
	let minY = Infinity

	for (let xStart = ellipsoid.averageRadius / 2; xStart < ellipsoid.averageRadius; xStart += 2) {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {
			const x = xStart + (ellipsoid.averageRadius * Math.cos((theta - (5 * Math.PI)) / 10))
			const y = ellipsoid.averageRadius * Math.sin((theta - (5 * Math.PI)) / 10)
			const absoluteX = Math.round(ellipsoid.averageX + x)
			const absoluteY = Math.round(ellipsoid.averageY + y)
			const pixel = grid.pixel(absoluteX, absoluteY)
			if (pixel.r === 255 && pixel.g === 255) {
				minX = Math.min(minX, pixel.x)
				minY = Math.min(minY, pixel.y)
				maxY = Math.max(maxY, pixel.y + 1)
			}
		}
	}

	const zeroX = minX;
	const zeroY = Math.floor((maxY + minY) / 2)

	const sideAB = zeroX - ellipsoid.averageX
	const sideBC = zeroY - ellipsoid.averageY
	const alphaDegree = Math.tan(sideBC / sideAB)
	const alphaRad = alphaDegree * (Math.PI / 180)
	const betaDegree = 90
	const gammaDegree = (betaDegree - Math.abs(alphaDegree)) * (alphaDegree > 0 ? 1 : -1)

	const lengthAB = zeroX - ellipsoid.averageX
	const lengthBC = Math.abs(zeroY - ellipsoid.averageY)
	// Math.sqrt is supposedly very slow, so we just use the cos of the radial alpha corner
	// const lengthAC = Math.sqrt(Math.pow(lengthAB, 2) + Math.pow(lengthBC, 2))
	const lengthAC = lengthAB / Math.cos(alphaRad)
	const rotatedUpwards = alphaDegree < 0

	return {
		zeroX,
		zeroY,

		alphaDegree,
		betaDegree,
		gammaDegree,

		lengthAB,
		lengthAC,
		lengthBC,

		rotatedUpwards
	}
}