import { expect, test } from 'vitest'

import { canvasToPixelGrid } from '../pixel-grid'
import { fixTestEnvironment, readImageFile, writeCanvas } from '../../__tests__/test-utils'
import { findEllipsoid, markEdges } from '../ellipse-detect'
import { Canvas, ImageData } from 'skia-canvas'
import { drawEdgeMap } from '../edge-map.debug'
import { toPixelArray } from '../pixel-grid.debug'
import { drawEllipsoid } from '../ellipse-detect.debug'
import { canvasConfiguration } from '../canvas'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { blurViewFinder, readViewFinder } from '../read-viewfinder'
import { getDebugCanvasContext } from '../canvas.debug'

fixTestEnvironment()

const timestamps = [
	[1738858808669, {}],
	[1738791708507, {}],
	// [1738791708511, { }],
	// [1738791723711, { }],
	[1738791723715, { }],
	// [1738791743953, { }],
	// [1738791743958, { }]
]

test.concurrent.for(timestamps)('scan-steps', async ([timestamp, expectedResult]) => {

	// Arrange
	canvasConfiguration.clearBeforeDraw = false
	// Not sure why skia-canvas needs this to be 1.5 the size
	canvasConfiguration.blurAmount = 1.5;

	const inputData = await readImageFile(__dirname, `./code-scanner/photo-reference/camera-feed-${timestamp}-scale.png`)
	const inputDataRect: DOMRect = JSON.parse((await readFile(join(__dirname, `./code-scanner/photo-reference/camera-feed-${timestamp}-viewfinder.json`))).toString())
	const inputDataCanvas = new Canvas(inputData.width, inputData.height) as unknown as globalThis.OffscreenCanvas
	getDebugCanvasContext(inputDataCanvas).putImageData(inputData, 0, 0)
	// Not sure why skia-canvas needs this to be twice the size
	const debugCanvas = new Canvas(inputDataRect.width * 2, inputDataRect.height * 2)

	// Act
	const viewFinderCanvasses = await Promise.all([
		readViewFinder(inputDataRect, inputDataCanvas, false),
		readViewFinder(inputDataRect, inputDataCanvas, true)
	])
	await writeCanvas(viewFinderCanvasses[0], __dirname, `./code-scanner/.output/camera-feed-${timestamp}-01-grayscale.png`)
	await writeCanvas(viewFinderCanvasses[1], __dirname, `./code-scanner/.output/camera-feed-${timestamp}-02-grayscale-inverted.png`)

	const blurryViewFinderCanvasses = await Promise.all([
		blurViewFinder(viewFinderCanvasses[0]),
		blurViewFinder(viewFinderCanvasses[1]),
	])
	await writeCanvas(blurryViewFinderCanvasses[0], __dirname, `./code-scanner/.output/camera-feed-${timestamp}-03-blur.png`)
	await writeCanvas(blurryViewFinderCanvasses[1], __dirname, `./code-scanner/.output/camera-feed-${timestamp}-04-blur-inverted.png`)

	const inputGrid = canvasToPixelGrid(blurryViewFinderCanvasses[0], blurryViewFinderCanvasses[1])

	if (inputGrid)
		debugCanvas.getContext('2d')!.putImageData(new ImageData(toPixelArray(inputGrid), inputGrid.width, inputGrid.height), 0, 0)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-05-lines.png`)

	const edgeMap = inputGrid ? markEdges(inputGrid) : undefined
	drawEdgeMap(debugCanvas as any, edgeMap)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-06-edge.png`)

	const ellipsoid = findEllipsoid(edgeMap, inputGrid?.height ?? 0)
	drawEllipsoid(debugCanvas as any, ellipsoid)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-07-ellipse.png`)

	// Assert
	// TODO write assertions
	expect(ellipsoid).not.toBe(expectedResult)
})