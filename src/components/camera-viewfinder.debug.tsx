import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import './camera-viewfinder.debug.pcss'
import { canvas, Canvas, canvasConfiguration } from '../camera-utilities/canvas'
import { GridPixel, Pixel, PixelGrid } from '../camera-utilities/pixel-grid'
import { edgeScores } from '../camera-utilities/edge-score'
import { edgeDirections, EdgeMap, GridEllipsoid } from '../camera-utilities/edge-mark'


type DebugCanvasProps = {
	canvas: Canvas,
	show: boolean
}
const DebugCanvas: Component<DebugCanvasProps> = ({ canvas, show }) => {

	if (!show) return undefined

	const debugCanvas = Object.assign(document.createElement('canvas'), {
		id: canvas.id,
		width: canvas.width,
		height: canvas.height
	})
	const debugContext = debugCanvas.getContext('2d', {
		willReadFrequently: true,
		alpha: true
	})!

	createEffect(() => {
		const image = canvas.getImageData()
		debugContext.putImageData(image, 0, 0)
	})

	return debugCanvas
}
type DebugImageCanvasProps = {
	id: string
	image: ImageData
	show: boolean
}
const DebugImageCanvas: Component<DebugImageCanvasProps> = ({ id, image, show }) => {

	if (!show) return undefined

	const debugCanvas = Object.assign(document.createElement('canvas'), {
		id,
		width: image.width,
		height: image.height
	})

	const debugContext = debugCanvas.getContext('2d', {
		willReadFrequently: true,
		alpha: true
	})!


	createEffect(() => {
		debugContext.putImageData(image, 0, 0)
	})

	return debugCanvas
}

const [debugCanvases, setDebugCanvases] = createSignal<{ [key: string]: { canvas: Canvas, show: boolean } }>({})
const debugCanvas = (show: boolean, canvas: Canvas) =>
	setDebugCanvases?.(p => ({ ...p, [canvas.id]: { canvas, show } }))

const DebugCanvasDisplay: Component = () => {

	const canvasDisplays = createMemo(() => Object.entries(debugCanvases())
		.map(([_id, { canvas, show }]) => <DebugCanvas canvas={canvas} show={show} />), () => Object.keys(debugCanvases()))

	return <>
		{canvasDisplays()}
	</>
}

const [images, setImages] = createSignal<{ [key: string]: { image: ImageData, show: boolean } }>({})
const debugImageData = (show: boolean, id: string, image: ImageData) =>
	setImages?.(p => ({ ...p, [id]: { image, show } }))
const debugGridPixels = (show: boolean, id: string, grid: PixelGrid, transform?: TransformFunc) =>
	debugImageData(show, id, new ImageData(
		toPixelArray(grid, transform),
		grid.width, grid.height
	))
const debugEdgeMap = (show: boolean, grid: PixelGrid, edges: EdgeMap | undefined) =>
	debugCanvas(show, drawEdgeMap(canvas('edge', grid.width, grid.height), edges))
const debugEllipsoid = (show: boolean, grid: PixelGrid, ellipsoid: GridEllipsoid | undefined) =>
	debugCanvas(show, drawEllipsoid(canvas('ellipsoid', grid.width, grid.height), ellipsoid))

const DebugGridDisplay: Component = () => {

	let touchTimeout: NodeJS.Timeout | undefined
	let touched = false

	const downloadAll = Object.assign(document.createElement('div'), {
		id: 'download-all',
		ondblclick: downloadCanvasData,
		ontouchend: () => {
			if (touched === true) downloadCanvasData()
			clearTimeout(touchTimeout)
			touched = true
			touchTimeout = setTimeout(() => touched = false, 500)
		}
	})

	const canvasDisplays = createMemo(() => Object.entries(images())
		.map(([id, { image, show }]) => <DebugImageCanvas id={id} image={image} show={show} />), () => Object.keys(images()))

	return <>
		{canvasDisplays()}
		{downloadAll}
	</>
}


const downloadCanvasData = async () => {
	const date = Date.now()

	for (const { canvas } of Object.values(debugCanvases())) {
		await canvas.writeOutput?.(date)
	}
	for (const [id, { image }] of Object.entries(images())) {
		const tempCanvas = canvas(id, image.width, image.height)
		tempCanvas.putImageData(image)
		await tempCanvas.writeOutput?.(date)
	}
}

const markLine = ({ edgeScore }: GridPixel): Pixel => {

	if (edgeScore === edgeScores.primaryEdge) return {
		r: 0, g: 128, b: 100, a: 50
	}

	if (edgeScore === edgeScores.secondaryEdge) return {
		r: 128, g: 255, b: 0, a: 50
	}

	if (edgeScore === edgeScores.compoundEdge) return {
		r: 0, g: 255, b: 0, a: 255
	}

	return {
		r: 0, g: 0, b: 0, a: 0
	}
}

type TransformFunc = (pixel: GridPixel) => Pixel
function toPixelArray(grid: PixelGrid, transformFunc: TransformFunc | undefined) {
	const uintPixels = new Uint8ClampedArray(grid.size)
	for (let pixel of grid) {
		if (transformFunc) pixel = { ...pixel, ...transformFunc(pixel) }

		uintPixels[pixel.abs + 0] = pixel.r
		uintPixels[pixel.abs + 1] = pixel.g
		uintPixels[pixel.abs + 2] = pixel.b
		uintPixels[pixel.abs + 3] = pixel.a
	}
	return uintPixels
}

function drawEdgeMap(canvas: Canvas, edges: EdgeMap | undefined) {

	const ctx = canvas.getCanvasContext()
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	if (!edges) return canvas;

	ctx.strokeStyle = 'rgb(0, 128, 0)'
	ctx.lineWidth = 3;

	for (const edge of edges) {

		if (!edge) continue;

		if (edge.edgeDirection === edgeDirections.NS) {

			// Draw horizontal
			ctx.strokeStyle = 'red';
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y)
			ctx.lineTo(edge.x + 2, edge.y)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.EW) {

			// Draw vertical
			ctx.strokeStyle = 'purple';
			ctx.beginPath()
			ctx.moveTo(edge.x, edge.y - 2)
			ctx.lineTo(edge.x, edge.y + 2)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.SE) {

			// Draw SW
			ctx.beginPath()
			ctx.moveTo(edge.x + 2, edge.y - 2)
			ctx.lineTo(edge.x - 2, edge.y + 2)
			ctx.stroke()
			continue
		}

		if (edge.edgeDirection === edgeDirections.SW) {

			// Draw SE
			ctx.beginPath()
			ctx.moveTo(edge.x - 2, edge.y - 2)
			ctx.lineTo(edge.x + 2, edge.y + 2)
			ctx.stroke()
			continue
		}
	}

	return canvas
}
function drawEllipsoid(canvas: Canvas, ellipsoid: GridEllipsoid | undefined) {

	const ctx = canvas.getCanvasContext()
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!ellipsoid) return canvas;

	ctx.lineWidth = 4;
	ctx.fillStyle = 'yellow'
	ctx.strokeStyle = 'yellow'

	// Mark center
	ctx.fillRect(ellipsoid.x - 2, ellipsoid.y - 2, 4, 4)

	// Mark border
	ctx.beginPath();
	ctx.ellipse(
		(ellipsoid.x),
		(ellipsoid.y),
		(ellipsoid.radiusA),
		(ellipsoid.radiusB),
		0, 0, 180
	);
	ctx.stroke();

	return canvas
}
const debug = canvasConfiguration.debugEnabled()
	? {
		DebugCanvasDisplay, debugCanvas, DebugGridDisplay, debugImageData,
		debugGridPixels, markLine, debugEdgeMap, debugEllipsoid
	}
	: undefined

export default debug