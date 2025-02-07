export const canvasConfiguration = {
	canvasContextOptions: {
		willReadFrequently: true,
		desynchronized: true
	} as CanvasRenderingContext2DSettings,

	clearBeforeDraw: true,
	useOptions: true,

	showScaleCanvas: false,
	showGrayscaleImage: false,
	showOrientationLines: import.meta.env.DEV,
	showEllipsoid: true,
	showAngles: true,
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

export const getCanvasContext = <T extends OffscreenCanvas>(canvas: T, alpha = true) =>
	canvasConfiguration.useOptions ? canvas.getContext( '2d', {
		...canvasConfiguration.canvasContextOptions,
		alpha
	})! : canvas.getContext( '2d')!