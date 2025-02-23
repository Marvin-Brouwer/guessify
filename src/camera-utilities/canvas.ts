export const canvasConfiguration = {
	canvasContextOptions: {
		willReadFrequently: true,
		desynchronized: true
	} as CanvasRenderingContext2DSettings,

	clearBeforeDraw: true,

	getCanvasContext<T extends OffscreenCanvas>(canvas: T, alpha = true){
		return canvas.getContext( '2d', {
			...this.canvasContextOptions,
			alpha
		})!
	},

	showScaleCanvas: false,
	showGrayscaleImage: false,
	showOrientationLines: import.meta.env.DEV,
	showEllipsoid: true,
	showAngles: false,
	showBoundary: true,
	sampleRate: import.meta.env.PROD ? 200 : 1000,

	blurAmount: 1,
	debugEnabled() {
		return this.showScaleCanvas
			|| this.showGrayscaleImage
			|| this.showOrientationLines
			|| this.showEllipsoid
	}
}

export const writeOutput = !canvasConfiguration.debugEnabled() ? undefined : async (id: 'string', canvas: OffscreenCanvas, date: number) => {

	const link = document.createElement('a')
	link.download = `camera-feed-${date}-${id}.png`
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