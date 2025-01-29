import { Canvas, canvasConfiguration, getContext, makeCanvas } from './canvas'
import { awaitAnimationFrame } from './frame-helper'

/**
 * Extract the viewfinder pixels from video source.
 */
export function readViewFinder(viewFinderRect: DOMRectReadOnly, videoInput: CanvasImageSource, invert: boolean) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = makeCanvas(
			invert ? 'grayscale-inverted' : 'grayscale', !invert && canvasConfiguration.showGrayscaleImage,
			viewFinderRect.width,
			viewFinderRect.height
		)
		const grayscaleContext = getContext(grayScaleCanvas, {
			alpha: false,
			desynchronized: !canvasConfiguration.showGrayscaleImage
		})
		// Fiddle with the image to make black more clear and glare less obvious
		// Todo dynamic lighting?
		grayscaleContext.filter = `brightness(1.4) grayscale() ${invert ? 'invert()' : ''} contrast(4)`
		grayscaleContext.drawImage(
			videoInput,
			viewFinderRect.x, viewFinderRect.y,
			viewFinderRect.width, viewFinderRect.height,
			0, 0,
			grayScaleCanvas.width, grayScaleCanvas.height
		);

		return grayScaleCanvas;
	})
}

/**
 * Blur viewfinder pixels after grayscale has been applied.
 * This is a separate step to get better results
 */
export function blurViewFinder(viewFinderCanvas: Canvas, resolution: number) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = makeCanvas(
			viewFinderCanvas.id.replace('grayscale', 'blur'),
			false,
			viewFinderCanvas.width,
			viewFinderCanvas.height
		)
		const grayscaleContext = getContext(grayScaleCanvas, {
			// Use the grayscale to synchronize to
			desynchronized: !canvasConfiguration.showGrayscaleImage
		})
		// Blur and up the contrast so we can edge detect later
		grayscaleContext.filter = `blur(${canvasConfiguration.blurAmount(resolution)}px) brightness(1.1) contrast(3.5)`
		grayscaleContext.drawImage(
			viewFinderCanvas,
			0, 0,
			viewFinderCanvas.width, viewFinderCanvas.height,
			0, 0,
			grayScaleCanvas.width, grayScaleCanvas.height
		);

		return grayScaleCanvas;
	})
}