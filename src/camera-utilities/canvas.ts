
export const canvasConfiguration = {
	canvasContextOptions: {
		willReadFrequently: true
	} as CanvasRenderingContext2DSettings,

	showScaleCanvas: false,
	showGrayscaleImage: true, // import.meta.env.DEV,
	showOrientationLines: true,
	sampleRate: import.meta.env.PROD ? 200 : 1000,

	blurAmount: 1,
	debugEnabled() {
		return this.showScaleCanvas
			|| this.showGrayscaleImage
			|| this.showOrientationLines
	}
}

export type Canvas = (HTMLCanvasElement | OffscreenCanvas) & {
	id: string,
	writeOutput?: (date: number) => Promise<void>
}

const writeOutput = !canvasConfiguration.debugEnabled() ? undefined : async (canvas: Canvas, date: number) => {

	const link = document.createElement('a')
	link.download = `camera-feed-${date}-${canvas.id}.png`
	if (canvas instanceof HTMLCanvasElement) {
		link.href = canvas.toDataURL()
	} else{
		const canvasBlob = await canvas.convertToBlob({
			type: 'image/png'
		});
		var fileReader = new FileReader();
		link.href = await new Promise((r) => {
			fileReader.onload = (e) => {
				r(e.target!.result as string)
			}
			fileReader.readAsDataURL(canvasBlob);
		})
	}
	link.click()
}

export const makeCanvas = (id: string, visible: boolean, width: number, height: number): Canvas => {
	if (visible) {
		const canvas = document.createElement('canvas');
		return Object.assign(canvas, {
			width, height, id, writeOutput: writeOutput && ((date: number) => writeOutput(canvas, date))
		}) as Canvas
	}

	const canvas = new OffscreenCanvas(width, height);
	return Object.assign(canvas, {
		id, writeOutput: writeOutput && ((date: number) => writeOutput(canvas as Canvas, date))
	}) as Canvas
}

export type CanvasContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
export const getContext = (canvas: OffscreenCanvas | HTMLCanvasElement, options: CanvasRenderingContext2DSettings = {}) => canvas.getContext('2d', {
	...canvasConfiguration.canvasContextOptions,
	...options
})! as CanvasContext
