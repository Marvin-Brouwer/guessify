import { canvasConfiguration } from './canvas'
import { PixelGrid } from './pixel-grid'

export type GridEllipsoid = {

	checkX: number,
	checkY: number,
	checkRadiusInner: number,
	checkRadiusOuter: number,

	radiusA: number,
	radiusB: number,
	bigRadius: number,
	smallRadius: number,
	averageRadius: number,

	averageX: number,
	averageY: number,
}

export const findEllipsoid = (grid: PixelGrid | undefined): GridEllipsoid | undefined => {

	if (!grid) return undefined

	const edgeOffset = canvasConfiguration.blurAmount * 10
	const rightOffset = Math.ceil(grid.width / 9)

	const testCircle = (x: number, y: number, radius: number) => {
		for (let theta = 0; theta < (10 * Math.PI); theta++) {

			const xInner = x + (radius * Math.cos(theta))
			const yInner = y + (radius * Math.sin(theta))
			const pixelInner = grid.pixel(xInner, yInner)

			const xOuter = x + ((radius + 9) * Math.cos(theta))
			const yOuter = y + ((radius + 9) * Math.sin(theta))
			const pixelOuter = grid.pixel(xOuter, yOuter)

			if (pixelInner.r <= 220) return false
			if (pixelOuter.r >= 20) return false
		}

		return true
	}
	for (let radius = (grid.height / 2) - (edgeOffset * 2); radius > edgeOffset * 2; radius -= 3) {
		for (let checkX = radius; checkX < (grid.width / 2) - rightOffset - radius; checkX += 3) {
			for (let checkY = edgeOffset + radius; checkY < (grid.height - edgeOffset - radius); checkY += 2) {
				if (testCircle(checkX, checkY, radius)) {

					// Now we know the rough area, fan out and find out
					let minX = Infinity;
					let maxX = 0
					let minY = Infinity;
					let maxY = 0

					for(let testRadius = radius; testRadius < (radius * 1.3); testRadius ++) {
						const pixelAMin = grid.pixel(checkX - testRadius, checkY);
						const pixelAMax = grid.pixel(checkX + testRadius, checkY);
						const pixelBMin = grid.pixel(checkX, checkY - testRadius);
						const pixelBMax = grid.pixel(checkX, checkY + testRadius);

						if (pixelAMin.r >= 220)
							minX = Math.min(pixelAMin.x, minX)
						if (pixelAMax.r >= 220)
							maxX = Math.max(pixelAMax.x, maxX)
						if (pixelBMin.r >= 220)
							minY = Math.min(pixelBMin.y, minY)
						if (pixelBMax.r >= 220)
							maxY = Math.max(pixelBMax.y, maxY)
					}

					if (minX === Infinity) minX = checkX - radius
					if (maxX === 0) maxX = checkX + radius
					if (minY === Infinity) minX = checkX - radius
					if (maxY === 0) maxY = checkX + radius

					const radiusA = (maxX - minX) / 2;
					const radiusB = (maxY - minY) / 2;
					const averageX = (minX + maxX) / 2
					const averageY = (minY + maxY) / 2

					const bigRadius = Math.max(radiusA, radiusB)
					const smallRadius = Math.min(radiusA, radiusB)
					const averageRadius = (bigRadius + smallRadius) / 2

					return {
						checkRadiusInner: radius,
						checkRadiusOuter: radius * 1.3,
						checkX,
						checkY,
						radiusA,
						radiusB,
						averageX,
						averageY,
						bigRadius,
						smallRadius,
						averageRadius
					}
				}
			}
		}
	}
}