
export const canvasConfiguration = {
	canvasContextOptions: {
		willReadFrequently: true
	} as CanvasRenderingContext2DSettings,

	showScaleCanvas: false,
	showGrayscaleImage: true, // import.meta.env.DEV,
	showOrientationLines: true,
	sampleRate: import.meta.env.PROD ? 200 : 1000,

	debugEnabled() {
		return this.showScaleCanvas
			|| this.showGrayscaleImage
			|| this.showOrientationLines
	}
}

export const makeCanvas = (id: string, visible: boolean, width: number, height: number) => visible
	? Object.assign(document.createElement('canvas'), {
			width, height, id
	}) as HTMLCanvasElement
	: new OffscreenCanvas(width, height)

export type CanvasContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
export const getContext = (canvas: OffscreenCanvas | HTMLCanvasElement, options: CanvasRenderingContext2DSettings = {}) => canvas.getContext('2d', {
	...canvasConfiguration.canvasContextOptions,
	...options
})! as CanvasContext
