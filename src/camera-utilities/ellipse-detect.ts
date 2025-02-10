import { canvasConfiguration } from './canvas'
import { edgeScores } from './edge-map'
import { PixelGrid } from './pixel-grid'

export const edgeDirections = {
	NS: 1,
	EW: 2,
	NE: 3,
	SE: 4,
	NW: 5,
	SW: 6
} as const

export type EdgeDirection =
	| typeof edgeDirections['NS']
	| typeof edgeDirections['EW']
	| typeof edgeDirections['NE']
	| typeof edgeDirections['SE']
	| typeof edgeDirections['NW']
	| typeof edgeDirections['SW']

type EdgeRecord = { x: number, y: number, edgeDirection: EdgeDirection }
export type EdgeMap = Array<EdgeRecord>

export function markEdges(grid: PixelGrid): EdgeMap | undefined {

	const edgeOffset = canvasConfiguration.blurAmount * 4
	const leftOffset = Math.ceil(grid.width / 9)

	const edges = new Array()
	let nwCount = 0
	let swCount = 0
	let neCount = 0
	let seCount = 0

	for (let x = leftOffset + edgeOffset; x < (grid.width / 2); x ++) {
		for (let y = edgeOffset; y < (grid.height - edgeOffset); y ++) {
			const pixel = grid.pixel(x, y)

			if (pixel.edgeScore !== edgeScores.compoundEdge) continue

			// const relative = (dx: number, dy: number) => grid.pixel(x + dx, y + dy)
			const left = (number: number) => grid.pixel(x - number, y)
			const right = (number: number) => grid.pixel(x + number, y)
			// const up = (number: number) => grid.pixel(x, y - number)
			// const down = (number: number) => grid.pixel(x, y + number)

			const leftUp = (number: number) => grid.pixel(x - number, y - number)
			const rightUp = (number: number) => grid.pixel(x + number, y - number)
			const leftDown = (number: number) => grid.pixel(x - number, y + number)
			const rightDown = (number: number) => grid.pixel(x + number, y + number)

			// NorthEast
			if (
				rightDown(3).edgeScore !== edgeScores.notEdge &&
				rightDown(6).edgeScore !== edgeScores.notEdge &&
				leftDown(3).edgeScore === edgeScores.notEdge &&
				leftDown(3).r === 255 &&
				rightUp(3).edgeScore === edgeScores.notEdge &&
				rightUp(3).r === 0 &&
				rightUp(6).r === 0 &&
				right(6).edgeScore === edgeScores.notEdge &&
				right(6).r === 0 &&
				true
			) {
				neCount++
				edges.push({
					x, y, edgeDirection: edgeDirections.NE
				})
				continue
			}
			// SouthWest
			if (
				leftUp(3).edgeScore !== edgeScores.notEdge &&
				leftUp(6).edgeScore !== edgeScores.notEdge &&
				rightUp(3).r === 255 &&
				rightUp(3).edgeScore === edgeScores.notEdge &&
				leftDown(3).edgeScore === edgeScores.notEdge &&
				leftDown(3).r === 0 &&
				leftDown(6).r === 0 &&
				left(6).edgeScore === edgeScores.notEdge &&
				left(6).r === 0 &&
				true
			) {
				swCount++
				edges.push({
					x, y, edgeDirection: edgeDirections.SW
				})
				continue
			}
			// SouthEast
			if (
				leftDown(3).edgeScore !== edgeScores.notEdge &&
				leftDown(6).edgeScore !== edgeScores.notEdge &&
				leftUp(3).r === 255 &&
				leftUp(3).edgeScore === edgeScores.notEdge &&
				rightDown(3).edgeScore === edgeScores.notEdge &&
				rightDown(3).r === 0 &&
				right(6).edgeScore === edgeScores.notEdge &&
				right(6).r === 0 &&
				true
			) {
				seCount++
				edges.push({
					x, y, edgeDirection: edgeDirections.SE
				})
				continue
			}
			// NorthWest
			if (
				rightUp(3).edgeScore !== edgeScores.notEdge &&
				rightUp(6).edgeScore !== edgeScores.notEdge &&
				rightDown(3).r === 255 &&
				rightDown(3).edgeScore === edgeScores.notEdge &&
				leftUp(3).edgeScore === edgeScores.notEdge &&
				leftUp(3).r === 0 &&
				leftUp(6).r === 0 &&
				left(6).edgeScore === edgeScores.notEdge &&
				left(6).r === 0 &&
				true
			) {
				nwCount++
				edges.push({
					x, y, edgeDirection: edgeDirections.NW
				})
				continue
			}
		}
	}

	// todo tweak
	if (seCount < 1) return undefined
	if (swCount < 1) return undefined
	if (neCount < 1) return undefined
	if (nwCount < 1) return undefined
	if (edges.length >= grid.width / 2) return undefined

	return edges
}

export type GridEllipsoid = {

	ellipsoidX: number,
	ellipsoidY: number,
	radiusA: number,
	radiusB: number,
	bigRadius: number,
	smallRadius: number,
	averageRadius: number,

	averageX: number,
	averageY: number,

	xSouthEast: number,
	xSouthWest: number,
	xNorthWest: number,
	xNorthEast: number,
	ySouthEast: number,
	ySouthWest: number,
	yNorthWest: number,
	yNorthEast: number,
}

/**
 * Finds an ellipsoid on the {@link EdgeMap}, using the diagonal edges only.
 * Returns undefined if not exactly one circle is found.
 * The circle is an approximation since we don't need to be absolutely accurate.
 * We mostly care about the center and an approximation of the width.
 */
export function findEllipsoid(edges: EdgeMap | undefined, maxHeight: number): GridEllipsoid | undefined {

	if (!edges) return undefined

	// https://forum.processing.org/one/topic/ellipse-detection-out-of-set-of-points#25080000002353087.html:~:text=Simple%2C%20approximate%20solution%3A

	let sum_xi = 0
	let sum_yi = 0
	let sum_xi_sw = 0
	let sum_yi_sw = 0
	let edges_sw = 0;
	let sum_xi_nw = 0
	let sum_yi_nw = 0
	let edges_nw = 0;
	let sum_xi_se = 0
	let sum_yi_se = 0
	let edges_se = 0;
	let sum_xi_ne = 0
	let sum_yi_ne = 0
	let edges_ne = 0;

	let xMinSE = 0
	let xMaxSE = Infinity
	let yMinSE = Infinity
	let yMaxSE = 0

	let xMinNE = 0
	let xMaxNE = Infinity
	let yMinNE = Infinity
	let yMaxNE = 0

	let xMinSW = Infinity
	let xMaxSW = 0
	let yMinSW = Infinity
	let yMaxSW = 0

	let xMinNW = Infinity
	let xMaxNW = 0
	let yMinNW = Infinity
	let yMaxNW = 0

	let distanceA = 0
	let distanceB = 0

	for (let i = 0; i < edges.length; i++) {
		const edge = edges[i]
		if (!edge) continue

		if (edge.edgeDirection === edgeDirections.SE) {
			xMinSE = Math.max(xMinSE, edge.x)
			xMaxSE = Math.min(xMaxSE, edge.x)
			yMinSE = Math.min(yMinSE, edge.y)
			yMaxSE = Math.max(yMaxSE, edge.y)

			sum_xi_se += edge.x
			sum_yi_se += edge.y
			edges_se ++;
		}
		if (edge.edgeDirection === edgeDirections.SW) {
			xMinSW = Math.max(xMinSW, edge.x)
			xMaxSW = Math.min(xMaxSW, edge.x)
			yMinSW = Math.min(yMinSW, edge.y)
			yMaxSW = Math.max(yMaxSW, edge.y)

			sum_xi_sw += edge.x
			sum_yi_sw += edge.y
			edges_sw ++;
		}
		if (edge.edgeDirection === edgeDirections.NW) {
			xMinNW = Math.min(xMinNW, edge.x)
			xMaxNW = Math.max(xMaxNW, edge.x)
			yMinNW = Math.min(yMinNW, edge.y)
			yMaxNW = Math.max(yMaxNW, edge.y)

			sum_xi_nw += edge.x
			sum_yi_nw += edge.y
			edges_nw ++;
		}
		if (edge.edgeDirection === edgeDirections.NE) {
			xMinNE = Math.min(xMinNE, edge.x)
			xMaxNE = Math.max(xMaxNE, edge.x)
			yMinNE = Math.min(yMinNE, edge.y)
			yMaxNE = Math.max(yMaxNE, edge.y)

			sum_xi_ne += edge.x
			sum_yi_ne += edge.y
			edges_ne ++;
		}

		sum_xi += edge.x
		sum_yi += edge.y
	}

	const ellipsoidX = 1 / edges.length * sum_xi
	const ellipsoidY = 1 / edges.length * sum_yi

	const xSouthEast = 1 / edges_se * sum_xi_se
	const xSouthWest = 1 / edges_sw * sum_xi_sw
	const xNorthWest = 1 / edges_nw * sum_xi_nw
	const xNorthEast = 1 / edges_ne * sum_xi_ne
	const ySouthEast = 1 / edges_se * sum_yi_se
	const ySouthWest = 1 / edges_sw * sum_yi_sw
	const yNorthWest = 1 / edges_nw * sum_yi_nw
	const yNorthEast = 1 / edges_ne * sum_yi_ne

	// Average the extremities to get an accurate center
	const averageX = (xSouthEast + xSouthWest + xNorthEast + xNorthWest) / 4
	const averageY = (ySouthEast + ySouthWest + yNorthEast + yNorthWest) / 4

	if (Number.isNaN(ellipsoidX) || Number.isNaN(ellipsoidY)) return undefined
	if (ellipsoidX === Infinity || ellipsoidY === Infinity) return undefined
	if (ellipsoidX === 0 || ellipsoidY === 0) return undefined

	for (let i = 0; i < edges.length; i++) {
		const edge = edges[i]
		if (!edge) continue

		distanceA = Math.max(distanceA, Math.abs(edge.x - averageX))
		distanceB = Math.max(distanceB, Math.abs(edge.y - averageY))
	}

	// https://stackoverflow.com/a/6716520
	distanceB = Math.max(xNorthEast - xNorthWest, xSouthEast - xSouthWest) / Math.SQRT2
	distanceA = Math.max(ySouthEast - yNorthEast, ySouthWest - yNorthWest) / Math.SQRT2

	if (Number.isNaN(distanceA) || Number.isNaN(distanceB)) return undefined
	if (distanceA === Infinity || distanceB === Infinity) return undefined
	if (distanceA <= 1 || distanceB <= 1) return undefined

	// // exit if it's too flat
	// if (Math.abs(distanceA - distanceB) > (maxHeight / 10)) return undefined
	// This would mean you're too close
	if (distanceB > (maxHeight / 4)) return undefined
	// Ellipse may not exit the screen at the bottom
	if (ellipsoidY + distanceB > maxHeight - 3) return undefined
	// Ellipse may not exit the screen at the top
	if (ellipsoidY - distanceB < 3) return undefined
	// Ellipse may not exit the screen on the left
	if (ellipsoidX - distanceA < 3) return undefined

	const bigRadius = Math.max(distanceA, distanceB)
	const smallRadius = Math.min(distanceA, distanceB)
	const averageRadius = (bigRadius + smallRadius) / 2

	// TODO see if we can determine rotation somehow?
	return {
		ellipsoidX,
		ellipsoidY,
		radiusA: distanceA,
		radiusB: distanceB,

		bigRadius,
		smallRadius,
		averageRadius,

		averageX,
		averageY,
		xSouthEast,
		xSouthWest,
		xNorthWest,
		xNorthEast,
		ySouthEast,
		ySouthWest,
		yNorthWest,
		yNorthEast,
	}
}