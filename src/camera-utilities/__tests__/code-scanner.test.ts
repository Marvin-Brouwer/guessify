/**
 * This test suite helps us with debugging scanned images. \
 * It's mainly to prevent us from having to connect a phone and scan a real code
 * whilst trying to figure out how to make the code work.
 *
 * It's basically one test that runs on a set of exported data using the app in dev-mode.
 */

import { expect, test } from 'vitest'

import { canvasToPixelGrid } from '../pixel-grid'
import { fixTestEnvironment, readImageFile, writeCanvas } from '../../__tests__/test-utils'
import { Canvas } from 'skia-canvas'
import { canvasConfiguration } from '../canvas'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readViewFinder } from '../read-viewfinder'
import { findAngles } from '../angle-scan'
import { drawAngleDetail } from '../angle-scan.debug'
import { redrawCode } from '../code-redraw'
import { findBoundary } from '../boundary-scan'
import { drawBoundaryDetail } from '../boundary-scan.debug'
import { parseCode } from '../code-parser'
import { findEllipsoid } from '../ellipse-detect'
import { drawEllipsoid } from '../ellipse-detect.debug'

fixTestEnvironment()

type TestData = [name: string, timestamp: number, expectedResult: string | undefined, invert: boolean]
const timestamps: TestData[] = [
	// Orientations
	['horizontal', 1738858808669, '05120643716777731637070', false],
	['skewed left', 1738791723715, '06607602231707646147410', false],
	['skewed right', 1738962275690, '06607602231707646147410', false],
	// Real user feedback (not sure if these are correct yet, but they are the same)
	['sample 1', 1740469939024, '03707063000507745547051', false],
	['sample 2', 1740469939012, '03707063000507745547051', false],
]

test.concurrent.for(timestamps)('scan-steps [%s]', async ([_, timestamp, expectedResult, invert]) => {

	// Arrange
	canvasConfiguration.clearBeforeDraw = false
	canvasConfiguration.getCanvasContext = (canvas) => {
		const skiaCanvas = (canvas as unknown as Canvas)
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
	const viewFinderCanvas = await readViewFinder(inputDataRect, inputDataCanvas, invert)
	await writeCanvas(viewFinderCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-1-grayscale-${invert ? 'inverted' : 'regular'}.png`)
	const inputGrid = canvasToPixelGrid(viewFinderCanvas)

	// Add see through original image for debugging help
	canvasConfiguration.getCanvasContext(debugCanvas as unknown as OffscreenCanvas)
		.globalAlpha = .5
	canvasConfiguration.getCanvasContext(debugCanvas as unknown as OffscreenCanvas)
		.drawImage(viewFinderCanvas, 0, 0)
	canvasConfiguration.getCanvasContext(debugCanvas as unknown as OffscreenCanvas)
		.globalAlpha = 1

	const ellipsoid = findEllipsoid(inputGrid)
	drawEllipsoid(debugCanvas as any, ellipsoid)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-2-ellipse.png`)

	const angles = findAngles(ellipsoid, inputGrid)
	drawAngleDetail(debugCanvas as any, ellipsoid, angles)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-3-angles.png`)

	const boundary = findBoundary(angles, ellipsoid, inputGrid)
	drawBoundaryDetail(debugCanvas as any, boundary, ellipsoid, angles)
	await writeCanvas(debugCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-4-bounds.png`)

	const codeCanvas = redrawCode(viewFinderCanvas, ellipsoid, angles, boundary)
	await writeCanvas(codeCanvas, __dirname, `./code-scanner/.output/camera-feed-${timestamp}-5-redraw.png`)

	const code = parseCode(codeCanvas)?.join('')

	// Assert
	expect(code).toBe(expectedResult)
})