import { expect, test } from 'vitest'

import { imageDataToPixelGrid } from '../pixel-grid'
import { readImageFile, writeCanvas } from '../../__tests__/test-utils'
import { findEllipsoid, markEdges } from '../ellipse-detect'
import { createCanvas, createImageData } from 'canvas'
import { drawEdgeMap } from '../edge-map.debug'
import { toPixelArray } from '../pixel-grid.debug'
import { drawEllipsoid } from '../ellipse-detect.debug'
import { canvasConfiguration } from '../canvas'

test('edge-detect', async () => {

	// Arrange
	const inputData = await readImageFile(__dirname, './edge-detect/camera-feed-1738612798790-blur.png')
	const inputDataInverted = await readImageFile(__dirname, './edge-detect/camera-feed-1738612798790-blur-inverted.png')
	const debugCanvas = createCanvas(inputData.width, inputData.height);
	canvasConfiguration.clearBeforeDraw = false;

	// Act
	const inputGrid = imageDataToPixelGrid(inputData, inputDataInverted)!
	debugCanvas.getContext('2d').putImageData(createImageData(toPixelArray(inputGrid), inputGrid.width, inputGrid.height),0,0)
	await writeCanvas(debugCanvas, __dirname, './edge-detect/.output/camera-feed-01-lines.png')

	const edgeMap = markEdges(inputGrid)
	drawEdgeMap(debugCanvas, edgeMap)
	await writeCanvas(debugCanvas, __dirname, './edge-detect/.output/camera-feed-02-edge.png')

	const ellipsoid = findEllipsoid(edgeMap, inputGrid.height);
	drawEllipsoid(debugCanvas, ellipsoid)
	await writeCanvas(debugCanvas, __dirname, './edge-detect/.output/camera-feed-03-ellipse.png')

	// Assert

	expect(true).toBe(true)
})


// // Sobol convolution kernels
// const sobel = {
// 	x: [
// 		[-1, +0, +1],
// 		[-2, +0, +2],
// 		[-1, +0, +1]
// 	],
// 	y: [
// 		[+1, +2, +1],
// 		[+0, +0, +0],
// 		[-1, -2, -1]
// 	]
// }



// /** @pure */
// const isEdge = (pixel: GridPixel, grid: PixelGrid) =>
// 	pixel.y <= canvasConfiguration.blurAmount
// 	|| pixel.y >= grid.height - canvasConfiguration.blurAmount
// 	|| pixel.x <= canvasConfiguration.blurAmount
// 	|| pixel.x >= grid.width - canvasConfiguration.blurAmount
// function detectEdges2(grid: PixelGrid) {

// 	// initial threshold to binarize image and edges
// 	let threshold = 121
// 	// create 2D array for sobel convolution output
// 	let edges: Array<Array<number>> = []
// 	let grads: Array<Array<number>> = [] // for sobel gradient directions

// 	for (const row of grid.rows()) {


// 		// create new row in output 2D array
// 		edges[row.y] = []
// 		grads[row.y] = []

// 		for (const pixel of row) {

// 			if (isEdge(pixel, grid)) {

// 				edges[pixel.y][pixel.x] = 255
// 				grads[pixel.y][pixel.x] = 255
// 				continue
// 			}

// 			// result of vertical sobol convolution
// 			var pixel_x = 0
// 			var pixel_y = 0
// 			//
// 			for (var i = 0; i < 3; i++) {
// 				for (var j = 0; j < 3; j++) {
// 					// x and y coordinates of pixel given convolution cell
// 					var p_x = pixel.y + i - 1
// 					var p_y = pixel.x + j - 1
// 					// add convolution cell contributions
// 					pixel_x += grid.column(p_x).pixel(p_y).r * sobel.x[i][j]
// 					pixel_y += grid.column(p_x).pixel(p_y).r * sobel.y[i][j]
// 				}
// 			}

// 			// compute sobel magnitude (sobel_pixel)
// 			var sobel_pixel = Math.ceil(Math.sqrt((pixel_x * pixel_x) + (pixel_y * pixel_y)))
// 			// threshold sobel-pixel and store as edge
// 			if (sobel_pixel > threshold) {
// 				edges[pixel.y][pixel.x] = 0
// 			} else {
// 				edges[pixel.y][pixel.x] = 255
// 			}

// 			// compute sobel gradient - didn't end up using but would be required to finish canny edge detection
// 			// and can actually use grads as 'edges' to speed up calc - ended up using edges since fast enough and true to the hough transform
// 			var sobel_grad = 0
// 			if (pixel_x != 0 && pixel_y != 0) sobel_grad = Math.atan(pixel_y / pixel_x)
// 			grads[pixel.y][pixel.x] = (sobel_grad * 255)

// 		}
// 	}

// 	// Create sparse list of edge pixels
// 	// MUCH faster since need to draw circle around each pixel for multiple radii
// 	// and since most pixels are not edges, saves having to iterate through entire
// 	// edge image for each radii
// 	const edge_pixels = []
// 	const border = canvasConfiguration.blurAmount
// 	// Avoids having to pass through whole edge image on each radius pass
// 	for (var r = 0; r < grid.height + (2 * border); r++) {
// 		for (var c = 0; c < grid.width + (2 * border); c++) {
// 			// only need to fill accumulator based on edge points (excl borders but remember border offset on canvas)
// 			if (r > border && r < (grid.height + border) && c > border && c < (grid.width + border)) {
// 				// is an edge
// 				if (edges[r - border][c - border] == 0) {
// 					// store (x,y) coordinates of edge pixel in edge_pixels array
// 					edge_pixels.push({ xx: r, yy: c })
// 				}
// 			}
// 		}
// 	}

// 	// // convert 2d matrix back to imageData object  to then write to canvas
// 	// // first flatten 2d matrix
// 	// var matflat = toFlatArr(edges);
// 	// // now replace image data object with image matrix values
// 	// var c = 0;
// 	// for (var i = 0; i < data.length; i += 4) {
// 	//     data[i] = matflat[c];
// 	//     data[i + 1] = matflat[c];
// 	//     data[i + 2] = matflat[c];
// 	//     data[i + 3] = 255; //alpha always 255
// 	//     c++;
// 	// }

// 	console.log(edges
// 		.flatMap(a => a)
// 		.filter(a => a !== 255)
// 		.filter(a => a !== 0)
// 	)
// 	return edges
// }