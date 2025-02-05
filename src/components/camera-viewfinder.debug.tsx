import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import './camera-viewfinder.debug.pcss'
import { canvas, Canvas, canvasConfiguration } from '../camera-utilities/canvas'
import { PixelGrid } from '../camera-utilities/pixel-grid'
import { EdgeMap, GridEllipsoid } from '../camera-utilities/edge-map'
import { drawEdgeMap } from '../camera-utilities/edge-map.debug'
import { toPixelArray } from '../camera-utilities/pixel-grid.debug'
import { drawEllipsoid } from '../camera-utilities/edge-score.debug'


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
const debugGridPixels = (show: boolean, id: string, grid: PixelGrid) =>
	debugImageData(show, id, new ImageData(
		toPixelArray(grid),
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

const debug = canvasConfiguration.debugEnabled()
	? {
		DebugCanvasDisplay, debugCanvas, DebugGridDisplay, debugImageData,
		debugGridPixels, debugEdgeMap, debugEllipsoid
	}
	: undefined

export default debug