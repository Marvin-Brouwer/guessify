import { expect, test } from 'vitest'

import { imageDataToPixelGrid } from '../pixel-grid'
import { readImageFile, writeCanvas } from '../../__tests__/test-utils'
import { findEllipsoid, markEdges } from '../ellipse-detect'
import { createCanvas, createImageData } from 'canvas'
import { drawEdgeMap } from '../edge-map.debug'
import { toPixelArray } from '../pixel-grid.debug'
import { drawEllipsoid } from '../ellipse-detect.debug'
import { canvasConfiguration } from '../canvas'

const timestamps = [
	[1738612798790, { }],
	[1738612806350, { }],
	[1738612818579, { }],
	[1738612828671, { }],
	[1738612828674, { }],
]

test.concurrent.for(timestamps)('scan-steps', async ([timestamp, expectedResult]) => {

	// Arrange
	const inputData = await readImageFile(__dirname, `./edge-detect/.input/camera-feed-${timestamp}-blur.png`)
	const inputDataInverted = await readImageFile(__dirname, `./edge-detect/.input/camera-feed-${timestamp}-blur-inverted.png`)
	const debugCanvas = createCanvas(inputData.width, inputData.height);
	canvasConfiguration.clearBeforeDraw = false;

	// Act
	// TODO add steps before this, we need the pixel data.
	const inputGrid = imageDataToPixelGrid(inputData, inputDataInverted)!
	debugCanvas.getContext('2d').putImageData(createImageData(toPixelArray(inputGrid), inputGrid.width, inputGrid.height),0,0)
	await writeCanvas(debugCanvas, __dirname, `./edge-detect/.output/camera-feed-${timestamp}-01-lines.png`)

	const edgeMap = markEdges(inputGrid)
	drawEdgeMap(debugCanvas, edgeMap)
	await writeCanvas(debugCanvas, __dirname, `./edge-detect/.output/camera-feed-${timestamp}-02-edge.png`)

	const ellipsoid = findEllipsoid(edgeMap, inputGrid.height);
	drawEllipsoid(debugCanvas, ellipsoid)
	await writeCanvas(debugCanvas, __dirname, `./edge-detect/.output/camera-feed-${timestamp}-03-ellipse.png`)

	// Assert
	// TODO write assertions
	expect(ellipsoid).not.toBe(expectedResult)
})