import { GridEllipsoid } from './ellipse-detect'
import { PixelGrid } from './pixel-grid'

export type AngleDetail = {

	zeroX: number
	zeroY: number
	alphaDegree: number
	betaDegree: 90
	gammaDegree: number
}
export function findAngles(ellipse: GridEllipsoid | undefined, grid: PixelGrid | undefined): AngleDetail | undefined {
	if (!ellipse) return undefined
	if (!grid) return undefined

	const bigRadius = Math.max(ellipse.radiusA, ellipse.radiusB)

	// First find the first 0 bar

	let zeroX = 0
	let zeroY = 0

	for (let y = ellipse.averageY - (bigRadius * 1.5); y < ellipse.averageY + (bigRadius * 1.5); y++) {
		for (let x = ellipse.averageX + (bigRadius * 1.5); x < ellipse.averageX + (bigRadius * 2); x++) {
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
	// for (let y = ellipse.averageY - (bigRadius * 1.5); y < ellipse.averageY + (bigRadius * 1.5); y++) {
	// 	for (let x = ellipse.averageX + (bigRadius * 1.5); x < ellipse.averageX + (bigRadius * 2); x++) {
	// 		const pixel = grid.pixel(x, y)
	// 		if (pixel.r === 255 && pixel.g === 255) {
	// 			if (grid.pixel(x - 1, y -3).r !== 0) continue
	// 			if (grid.pixel(x - 1, y +6).r !== 0) continue
	// 			if (grid.pixel(x +6, y -3).r !== 0) continue
	// 			if (grid.pixel(x +6, y +6).r !== 0) continue
	// 			zeroX = x
	// 			zeroY = y
	// 			break
	// 		}
	// 	}
	// }

	const sideAB = Math.round((zeroX - ellipse.averageX) * 100) / 100
	const sideBC = Math.round((zeroY - ellipse.averageY) * 100) / 100
	const alphaDegree = Math.round(Math.tan(sideBC / sideAB) * 100) / 100
	const betaDegree = 90
	const gammaDegree = (betaDegree - Math.abs(alphaDegree)) * (alphaDegree > 0 ? 1 : -1)

	return {
		zeroX,
		zeroY,
		alphaDegree,
		betaDegree,
		gammaDegree
	}
}