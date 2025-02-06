import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import './camera-viewfinder.debug.pcss'
import { canvas, Canvas, canvasConfiguration } from '../camera-utilities/canvas'
import { PixelGrid } from '../camera-utilities/pixel-grid'
import { EdgeMap, GridEllipsoid } from '../camera-utilities/ellipse-detect'
import { drawEdgeMap } from '../camera-utilities/edge-map.debug'
import { toPixelArray } from '../camera-utilities/pixel-grid.debug'
import { drawEllipsoid } from '../camera-utilities/ellipse-detect.debug'
import * as fflate from 'fflate';

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

const [getViewfinderRectForDownload, setViewfinderRectForDownload] = createSignal<DOMRect>()

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

	const zippables: fflate.AsyncZippable = { }

	const viewfinderRect = getViewfinderRectForDownload()
	const viewFinderData = new Blob([JSON.stringify(viewfinderRect ?? '')], {
		type: 'application/json'
	})
	const viewFinderDataArray = new Uint8Array(await viewFinderData.arrayBuffer());

	zippables[`camera-feed-${date}-viewfinder.json`] = [viewFinderDataArray, { level: 9 }]

	for (const { canvas } of Object.values(debugCanvases())) {
		const canvasBlob = await canvas.convertToBlob({
			type: 'image/png'
		})
		const canvasBlobArray = new Uint8Array(await canvasBlob.arrayBuffer());
		zippables[`camera-feed-${date}-${canvas.id}.png`] = [canvasBlobArray, { level: 0 }]
	}
	for (const [id, { image }] of Object.entries(images())) {
		const tempCanvas = canvas(id, image.width, image.height)
		tempCanvas.putImageData(image)
		const canvasBlob = await tempCanvas.convertToBlob({
			type: 'image/png'
		})
		const canvasBlobArray = new Uint8Array(await canvasBlob.arrayBuffer());
		zippables[`camera-feed-${date}-${id}.png`] = [canvasBlobArray, { level: 0 }]
	}

	const zip = await new Promise<Uint8Array>((res, rej) =>
		fflate.zip(zippables, (err, data) => err ? rej(err) : res(data))
	);
	const link = document.createElement('a');
	link.download = `camera-feed-${date}.zip`
	const fileReader = new FileReader()
	link.href = await new Promise((r) => {
		fileReader.onload = (e) => {
			r(e.target!.result as string)
		}
		fileReader.readAsDataURL(new Blob([zip], {
			type:'application/octet-stream'
		}))
	})
	link.click()
}

const debug = canvasConfiguration.debugEnabled()
	? {
		DebugCanvasDisplay, debugCanvas, DebugGridDisplay, debugImageData,
		debugGridPixels, debugEdgeMap, debugEllipsoid, setViewfinderRectForDownload
	}
	: undefined

export default debug