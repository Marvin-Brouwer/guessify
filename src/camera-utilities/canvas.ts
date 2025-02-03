
export const canvasConfiguration = {
	canvasContextOptions: {
		willReadFrequently: true,
		desynchronized: true
	} as CanvasRenderingContext2DSettings,

	showScaleCanvas: false,
	showGrayscaleImage: true, // import.meta.env.DEV,
	showOrientationLines: true,
	sampleRate: import.meta.env.PROD ? 200 : 1000,

	blurAmount: 3,
	debugEnabled() {
		return this.showScaleCanvas
			|| this.showGrayscaleImage
			|| this.showOrientationLines
	}
}

export type Canvas = OffscreenCanvas & {
	id: string,
	writeOutput?: (date: number) => Promise<void>
	getImageData: () => ImageData
	putImageData: (image: ImageData) => void
	getCanvasContext: () => CanvasContext
}

const writeOutput = !canvasConfiguration.debugEnabled() ? undefined : async (canvas: Canvas, date: number) => {

	const link = document.createElement('a')
	link.download = `camera-feed-${date}-${canvas.id}.png`
	if (canvas instanceof HTMLCanvasElement) {
		link.href = canvas.toDataURL()
	} else {
		const canvasBlob = await canvas.convertToBlob({
			type: 'image/png'
		})
		var fileReader = new FileReader()
		link.href = await new Promise((r) => {
			fileReader.onload = (e) => {
				r(e.target!.result as string)
			}
			fileReader.readAsDataURL(canvasBlob)
		})
	}
	link.click()
}

export const canvas = (id: string, width: number, height: number, alpha: boolean = true): Canvas => {

	const canvas = new OffscreenCanvas(width, height)

	const getCanvasContext = () => canvas.getContext( '2d', {
		...canvasConfiguration.canvasContextOptions,
		alpha
	}) as CanvasContext
	const getImageData = () => getCanvasContext().getImageData(0, 0, width, height)
	const putImageData = (image: ImageData) => getCanvasContext().putImageData(image, 0, 0)

	return Object.assign(canvas, {
		id,
		writeOutput: writeOutput && ((date: number) => writeOutput(canvas as Canvas, date)),
		getCanvasContext,
		getImageData,
		putImageData
	}) as Canvas
}

export type CanvasContext = OffscreenCanvasRenderingContext2D
