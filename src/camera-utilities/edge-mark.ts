import { canvasConfiguration } from './canvas'
import { edgeScores } from './edge-score';
import { PixelGrid } from './pixel-grid'

export const edgeDirections = {
	NS: 1,
	EW: 2,
	SE: 3,
	SW: 4
} as const

export type EdgeDirection =
	| typeof edgeDirections['NS']
	| typeof edgeDirections['EW']
	| typeof edgeDirections['SE']
	| typeof edgeDirections['SW']

type EdgeRecord = { x: number, y: number, edgeDirection: EdgeDirection }
export type EdgeMap = Array<EdgeRecord>

export function markEdges(grid: PixelGrid): EdgeMap | undefined {

	const stepSize = 3
	const edgeOffset = canvasConfiguration.blurAmount * 4
	const leftOffset = Math.ceil(grid.width / 9)

	const edges = new Array()
	let swCount = 0;
	let seCount = 0

	for (let x = leftOffset + edgeOffset; x < (grid.width / 2); x += stepSize) {
		for (let y = edgeOffset; y < (grid.height - edgeOffset); y += stepSize) {
			const pixel = grid.pixel(x, y)

			if (pixel.edgeScore !== edgeScores.compoundEdge) continue

			// const relative = (dx: number, dy: number) => grid.pixel(x + dx, y + dy)
			// const left = (number: number) => grid.pixel(x - number, y)
			const right = (number: number) => grid.pixel(x + number, y)
			const up = (number: number) => grid.pixel(x, y - number)
			const down = (number: number) => grid.pixel(x, y + number)

			const leftUp = (number: number) => grid.pixel(x - number, y - number)
			const rightUp = (number: number) => grid.pixel(x + number, y - number)
			const leftDown = (number: number) => grid.pixel(x - number, y + number)
			const rightDown = (number: number) => grid.pixel(x + number, y + number)

			// Filter out straight lines
			// if (
			// 	right(1).edgeScore === edgeScores.compoundEdge &&
			// 	right(2).edgeScore === edgeScores.compoundEdge &&
			// 	right(3).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3, - 1).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3, + 1).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3, - 2).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3, + 2).edgeScore !== edgeScores.notEdge &&
			// 	(right(4).edgeScore !== edgeScores.notEdge || left(4).edgeScore !== edgeScores.notEdge)
			// ) {
			// 	continue
			// }
			// if (
			// 	down(1).edgeScore === edgeScores.compoundEdge &&
			// 	down(2).edgeScore === edgeScores.compoundEdge &&
			// 	down(3).edgeScore !== edgeScores.notEdge &&
			// 	relative(- 1,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 1,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	relative(- 2,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 2,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	(down(4).edgeScore !== edgeScores.notEdge || up(4).edgeScore !== edgeScores.notEdge)
			// ) {
			// 	continue
			// }
			// if (
			// 	rightDown(1).edgeScore === edgeScores.compoundEdge &&
			// 	rightDown(2).edgeScore === edgeScores.compoundEdge &&
			// 	rightDown(3).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3,+ 4).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 3,+ 4).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 4,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	relative(+ 4,+ 3).edgeScore !== edgeScores.notEdge &&
			// 	(rightDown(4).edgeScore !== edgeScores.notEdge || leftUp(4).edgeScore !== edgeScores.notEdge)
			// ) {
			// 	continue
			// }

			// Diagonal SE
			if (
				rightDown(1).edgeScore === edgeScores.compoundEdge &&
				rightDown(2).edgeScore === edgeScores.compoundEdge &&
				rightDown(5).edgeScore !== edgeScores.notEdge &&
				leftDown(2).edgeScore !== edgeScores.compoundEdge &&
				rightUp(2).edgeScore !== edgeScores.compoundEdge &&
				leftDown(3).edgeScore === edgeScores.notEdge &&
				rightUp(3).edgeScore === edgeScores.notEdge &&
				leftDown(4).edgeScore === edgeScores.notEdge &&
				rightUp(4).edgeScore === edgeScores.notEdge
			) {
				if (right(7).edgeScore !== edgeScores.notEdge) continue;
				if (down(7).edgeScore !== edgeScores.notEdge) continue;

				seCount ++;
				edges.push({
					x, y, edgeDirection: edgeDirections.SE
				})
				continue
			}

			// Diagonal SW
			if (
				leftDown(1).edgeScore === edgeScores.compoundEdge &&
				leftDown(2).edgeScore === edgeScores.compoundEdge &&
				leftDown(5).edgeScore !== edgeScores.notEdge &&
				rightDown(2).edgeScore !== edgeScores.compoundEdge &&
				leftUp(2).edgeScore !== edgeScores.compoundEdge &&
				rightDown(3).edgeScore === edgeScores.notEdge &&
				leftUp(3).edgeScore === edgeScores.notEdge &&
				rightDown(4).edgeScore === edgeScores.notEdge &&
				leftUp(4).edgeScore === edgeScores.notEdge
			) {
				// Erase left corners of black square
				if (right(7).edgeScore !== edgeScores.notEdge) continue;
				if (up(7).edgeScore !== edgeScores.notEdge) continue;

				swCount ++;
				edges.push({
					x, y, edgeDirection: edgeDirections.SW
				})
				continue
			}

			// TODO maybe include NS and EW for accuracy
		}
	}

	/// todo tweak
	if(seCount < 5) return undefined;
	if(swCount < 5) return undefined;
	if(edges.length >= 80) return undefined;

	return edges
}

export type GridEllipsoid = {
	x: number,
	y: number,
	radiusA: number,
	radiusB: number
}
export function findEllipsoid(edges: EdgeMap | undefined): GridEllipsoid | undefined {

	if (!edges) return undefined

	// https://forum.processing.org/one/topic/ellipse-detection-out-of-set-of-points#25080000002353087.html:~:text=Simple%2C%20approximate%20solution%3A

	let sum_xi = 0
	let sum_yi = 0

	let distanceA = 0
	let distanceB = 0

	for (let i = 0; i < edges.length; i++) {
		const edge = edges[i]
		if (!edge) continue

		sum_xi += edge.x
		sum_yi += edge.y
	}

	const ellipsoidX = 1 / edges.length * sum_xi
	const ellipsoidY = 1 / edges.length * sum_yi

	if (Number.isNaN(ellipsoidX) || Number.isNaN(ellipsoidY)) return undefined
	if (ellipsoidX === Infinity || ellipsoidY === Infinity) return undefined
	if (ellipsoidX === 0 || ellipsoidY === 0) return undefined

	for (let i = 0; i < edges.length; i++) {
		const edge = edges[i]
		if (!edge) continue

		distanceA = Math.max(distanceA, Math.abs(edge.x - ellipsoidX))
		distanceB = Math.max(distanceB, Math.abs(edge.y - ellipsoidY))
	}

	if (Number.isNaN(distanceA) || Number.isNaN(distanceB)) return undefined
	if (distanceA === Infinity || distanceB === Infinity) return undefined
	if (distanceA === 0 || distanceB === 0) return undefined

	// exit if it's too flat
	if (Math.abs(distanceA - distanceB) > 3) return undefined;

	// TODO see if we can determine rotation somehow?
	return {
		x: ellipsoidX,
		y: ellipsoidY,
		radiusA: distanceA,
		radiusB: distanceB
	}
}