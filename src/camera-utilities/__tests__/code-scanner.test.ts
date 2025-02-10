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

fixTestEnvironment()

const timestamps = [
	// Horizontal
	[1738858808669, '05120643716777731637070'],
	// // Skewed left
	[1738791723715, '06607602231707646146410'],
	// TODO figure out rotation glitch
	// [1738791723715, '06607602231707646147410'],
	// Skewed right
	[1738962275690, '06607602231707646147410'],

	// [1738791708507, { }],
	// [1738791708511, { }],
	// [1738791723711, { }],
	// [1738791743953, { }],
	// [1738791743958, { }]
]

test.concurrent.for(timestamps)('scan-steps', async ([timestamp, expectedResult]) => {

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

	const codeCanvas = redrawCode(viewFinderCanvasses[0], inputGrid, ellipsoid, angles)
	await writeCanvas(codeCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-09-redraw.png`)

	const codeImage = canvasConfiguration
		.getCanvasContext(codeCanvas!)
		.getImageData(0, 0, codeCanvas!.width, codeCanvas!.height)

	let code = ''
	code += testRowValue(codeImage, 0).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 2).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 4).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 6).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 8).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 10).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 12).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 14).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 16).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 18).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 20).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 22).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 24).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 26).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 28).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 30).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 32).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 34).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 36).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 38).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 40).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 42).toString().padEnd(3)
	code += '|'
	code += testRowValue(codeImage, 44).toString().padEnd(3)

	console.log(timestamp, '[' + expectedResult.toString().split('').map((_, i) => i + 1).map(x => x.toString().padStart(3)).join('|') + ']')
	console.log(timestamp, '[' + expectedResult.toString().split('').map(x => (+x)).map(x => x.toString().padEnd(3)).join('|') + ']')
	console.log()
	console.log(timestamp, '[' + code + ']')
	console.log(timestamp, '[' + expectedResult.toString().split('').map((_, i) => i + 1).map(x => x.toString().padStart(3)).join('|') + ']')

	const realCode = code.split('|').map(x => x.trim()).join('');
	console.log(timestamp, expectedResult)
	console.log(timestamp, realCode)

	// Assert
	expect(realCode).toBe(expectedResult)
})

function testRowValue(image: globalThis.ImageData, x: number) {
	return (
		testRow(image, x)
	)
}

function testRow(image: globalThis.ImageData, x: number) {

	let whitePixels = 0

	const threshold = 200

	for(let y = 0; y < image.height; y++){
		const pixel = pixelDataFromOffset(image, x, y)
		if (pixel.r >= threshold) {
			whitePixels ++
		}
	}

	// return Math.round((whitePixels / (8)) * 10) / 10
	return Math.round(whitePixels / 8) -1
}