import { expect, test } from 'vitest'

import { canvasToPixelGrid, pixelDataFromOffset } from '../pixel-grid'
import { fixTestEnvironment, readImageFile, writeCanvas } from '../../__tests__/test-utils'
import { findEllipsoid, markEdges } from '../ellipse-detect'
import { Canvas, ImageData, Canvas as SkiaCanvas } from 'skia-canvas'
import { drawEdgeMap } from '../edge-map.debug'
import { toPixelArray } from '../pixel-grid.debug'
import { drawEllipsoid } from '../ellipse-detect.debug'
import { canvasConfiguration } from '../canvas'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { blurViewFinder, readViewFinder } from '../read-viewfinder'
import { findAngles } from '../angle-scan'
import { drawAngleDetail } from '../angle-scan.debug'
import { redrawCode } from '../code-redraw'
import { findBoundary } from '../boundary-scan'
import { drawBoundaryDetail } from '../boundary-scan.debug'

fixTestEnvironment()

type TestData = [name: string, timestamp: number, expectedResult: string]
const timestamps: TestData[] = [
	['horizontal', 1738858808669, '05120643716777731637070'],
	['skewed left', 1738791723715, '06607602231707646147410'],
	['skewed right', 1738962275690, '06607602231707646147410'],
]

test.concurrent.for(timestamps)('scan-steps [%s]', async ([_, timestamp, expectedResult]) => {

	// Arrange
	canvasConfiguration.clearBeforeDraw = false
	canvasConfiguration.getCanvasContext = (canvas) => {
		const skiaCanvas = (canvas as unknown as SkiaCanvas)
		if (skiaCanvas.getContext('2d') == null) {
			skiaCanvas
				.newPage(canvas.width, canvas.height)
				.save()
		}
		return skiaCanvas.getContext('2d') as any
	}

	const inputData = await readImageFile(__dirname, `./code-scanner/photo-reference/camera-feed-${timestamp}-scale.png`)
	const inputDataRect: DOMRect = JSON.parse((await readFile(join(__dirname, `./code-scanner/photo-reference/camera-feed-${timestamp}-viewfinder.json`))).toString())
	const inputDataCanvas = new Canvas(inputData.width, inputData.height) as unknown as OffscreenCanvas
	inputDataCanvas.getContext('2d')?.putImageData(inputData, 0, 0)
	// readViewFinder takes twice the size
	// TODO maybe remove
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

	const inputGrid = canvasToPixelGrid(
		viewFinderCanvasses[0],
		blurryViewFinderCanvasses[0],
		blurryViewFinderCanvasses[1]
	)

	if (inputGrid)
		debugCanvas.getContext('2d')!.putImageData(new ImageData(toPixelArray(inputGrid), inputGrid.width, inputGrid.height), 0, 0)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-05-lines.png`)

	const edgeMap = inputGrid ? markEdges(inputGrid) : undefined
	drawEdgeMap(debugCanvas as any, edgeMap)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-06-edge.png`)

	const ellipsoid = findEllipsoid(edgeMap, inputGrid?.height ?? 0)
	drawEllipsoid(debugCanvas as any, ellipsoid)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-07-ellipse.png`)

	const angles = findAngles(ellipsoid, inputGrid)
	drawAngleDetail(debugCanvas as any, ellipsoid, angles)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-08-angles.png`)

	const boundary = findBoundary(angles, ellipsoid, inputGrid)
	drawBoundaryDetail(debugCanvas as any, boundary, ellipsoid, angles)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-09-bounds.png`)

	const codeCanvas = redrawCode(viewFinderCanvasses[0], ellipsoid, angles, boundary)
	await writeCanvas(codeCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-99-redraw.png`)

	const code = parseCode(codeCanvas)

	// Assert
	expect(code).toBe(expectedResult)
})


const barThreshold = 130

function countColumnHeight(image: globalThis.ImageData, x: number) {

	let whitePixelCount = 0
	for (let y = 0; y < image.height; y++) {
		const pixel = pixelDataFromOffset(image, x, y)
		if (pixel.r >= barThreshold) {
			whitePixelCount++
		}
	}

	return whitePixelCount
}

function countColumn(image: globalThis.ImageData, x: number, midHeight: number) {


	const barHeight = countColumnHeight(image, x)

	const roundResult = Math.round((barHeight / midHeight) * 8) - 1
	// Make sure negatives never happen
	return roundResult > 0 ? roundResult : 0
}

function parseCode(codeCanvas: OffscreenCanvas | undefined) {
	if (codeCanvas === undefined) return undefined

	const codeImage = canvasConfiguration
		.getCanvasContext(codeCanvas!)
		.getImageData(0, 0, codeCanvas!.width, codeCanvas!.height)

	const midHeight = countColumnHeight(codeImage, 22)

	let code = ''
	for (let x = 0; x <= 44; x += 2) {
		const columnHeight = countColumn(codeImage, x, midHeight)
		if (x === 0 && columnHeight != 0) return undefined;
		if (x === 22 && columnHeight != 7) return undefined;
		if (x === 44 && columnHeight != 0) return undefined;
		code += columnHeight.toString()
	}

	return code;
}