import { GridEllipsoid } from './ellipse-detect'
import { PixelGrid } from './pixel-grid'

const betaRad = (90 * (180 / Math.PI));
export type AngleDetail = {

	zeroX: number
	zeroY: number

	alphaDegree: number
	betaDegree: 90
	gammaDegree: number

	alphaRad: number
	betaRad: typeof betaRad
	gammaRad: number

	lengthAB: number,
	lengthBC: number,
	lengthAC: number,
}
export function findAngles(ellipsoid: GridEllipsoid | undefined, grid: PixelGrid | undefined): AngleDetail | undefined {
	if (!ellipsoid) return undefined
	if (!grid) return undefined

	const bigRadius = Math.max(ellipsoid.radiusA, ellipsoid.radiusB)

	// First find the first 0 bar

	let zeroX = 0
	let zeroY = 0

	for (let y = ellipsoid.averageY - (bigRadius * 1.5); y < ellipsoid.averageY + (bigRadius * 1.5); y++) {
		for (let x = ellipsoid.averageX + (bigRadius * 1.5); x < ellipsoid.averageX + (bigRadius * 2); x++) {
			const pixel = grid.pixel(x, y)
			if (pixel.r === 255 && pixel.g === 255) {
				if (grid.pixel(x - 1, y -4).r !== 0) continue
				if (grid.pixel(x - 1, y +6).r !== 0) continue
				if (grid.pixel(x +6, y -3).r !== 0) continue
				if (grid.pixel(x +6, y +6).r !== 0) continue
				zeroX = x
				zeroY = y
				break
			}
		}
	}

	const sideAB = zeroX - ellipsoid.averageX
	const sideBC = zeroY - ellipsoid.averageY
	const alphaRad = Math.tan(sideBC / sideAB)
	const alphaDegree = alphaRad * (180 / Math.PI)
	const betaDegree = 90
	const gammaDegree = (betaDegree - Math.abs(alphaDegree)) * (alphaDegree > 0 ? 1 : -1)
	const gammaRad = gammaDegree * (180 / Math.PI)

	const lengthAB = zeroX - ellipsoid.averageX
	const lengthBC = Math.abs(zeroY - ellipsoid.averageY)
	// Math.sqrt is supposedly very slow, so we just use the cos of the radial alpha corner
	// const lengthAC = Math.sqrt(Math.pow(lengthAB, 2) + Math.pow(lengthBC, 2))
	const lengthAC = lengthAB / Math.cos(alphaRad)

	return {
		zeroX,
		zeroY,

		alphaRad,
		alphaDegree,

		betaRad,
		betaDegree,

		gammaDegree,
		gammaRad,

		lengthAB,
		lengthAC,
		lengthBC
	}
}