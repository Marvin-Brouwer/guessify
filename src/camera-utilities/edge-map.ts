export const edgeScores = {
	notEdge: 0,
	primaryEdge: 1,
	secondaryEdge: 2,
	compoundEdge: 3
} as const

export type EdgeScore =
	| typeof edgeScores['notEdge']
	| typeof edgeScores['primaryEdge']
	| typeof edgeScores['secondaryEdge']
	| typeof edgeScores['compoundEdge']

export function checkEdgeScore(
	red: number, green: number, blue: number,
	redInverted: number, greenInverted: number, blueInverted: number
): EdgeScore {

	const edgePixelSource = checkEdgeThreshold(red, green, blue) ? 1 : 0
	const edgePixelInverted = checkEdgeThreshold(redInverted, greenInverted, blueInverted) ? 2 : 0
	const edgeScore: EdgeScore = edgePixelSource + edgePixelInverted as 0 | 1 | 2 | 3

	return edgeScore
}

/**
 * Mark pixels as edgePixel when between a certain values.
 * Technically we can do with just the red, but just for completion's sake we'll do all until we have enough tests
 * @todo Convert to just pixel value
 */
export function checkEdgeThreshold(red: number, green: number, blue: number) {

	// TODO: These should be constants
	const whiteThreshold = 180
	const blackThreshold = 20

	if (red > whiteThreshold || red < blackThreshold) return false
	if (green > whiteThreshold || green < blackThreshold) return false
	if (blue > whiteThreshold || blue < blackThreshold) return false

	return true
}