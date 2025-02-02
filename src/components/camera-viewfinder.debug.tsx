import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import './camera-viewfinder.debug.pcss'
import { canvas, Canvas, canvasConfiguration } from '../camera-utilities/canvas'


type DebugCanvasProps = {
	canvas: Canvas
}
const DebugCanvas: Component<DebugCanvasProps> = ({ canvas }) => {

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
}
const DebugImageCanvas: Component<DebugImageCanvasProps> = ({ id, image }) => {

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

const [debugCanvases, setDebugCanvases] = createSignal<{ [key: string]: Canvas }>({})
const debugCanvas = (show: boolean, canvas: Canvas) =>
	show && setDebugCanvases?.(p => ({ ...p, [canvas.id]: canvas }))

const DebugCanvasDisplay: Component = () => {

	const canvasDisplays = createMemo(() => Object.entries(debugCanvases())
		.map(([_id, canvas]) => <DebugCanvas canvas={canvas} />), () => Object.keys(debugCanvases()))

	return <>
		{canvasDisplays()}
	</>
}

const [images, setImages] = createSignal<{ [key: string]: ImageData }>({})
const debugImageData = (show: boolean, id: string, grid: ImageData) =>
	show && setImages?.(p => ({ ...p, [id]: grid }))


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
		.map(([id, image]) => <DebugImageCanvas id={id} image={image} />), () => Object.keys(images()))

	return <>
		{canvasDisplays()}
		{downloadAll}
	</>
}


const downloadCanvasData = async () => {
	const date = Date.now()

	for (const canvas of Object.values(debugCanvases())) {
		await canvas.writeOutput?.(date)
	}
	for (const [id, image] of Object.entries(images())) {
		const tempCanvas = canvas(id, image.width, image.height)
		tempCanvas.putImageData(image)
		await tempCanvas.writeOutput?.(date)
	}
}


const debug = canvasConfiguration.debugEnabled()
	? { DebugCanvasDisplay, debugCanvas, DebugGridDisplay, debugImageData }
	: undefined

export default debug