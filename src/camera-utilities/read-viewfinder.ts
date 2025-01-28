import { canvasConfiguration, getContext, makeCanvas } from './canvas'
import { awaitAnimationFrame } from './frame-helper'

/**
 * Extract the viewfinder pixels from video source.
 */
export function readViewFinder(viewFinderRect: DOMRectReadOnly, videoInput: CanvasImageSource) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = makeCanvas(
			'grayscale', canvasConfiguration.showGrayscaleImage,
			viewFinderRect.width,
			viewFinderRect.height
		)
		const grayscaleContext = getContext(grayScaleCanvas, {
			alpha: false,
			desynchronized: !canvasConfiguration.showGrayscaleImage
		})
		// Fiddle with the image to make black more clear and glare less obvious
		// TODO the top row seems to be for crappy webcams and the bottom one for phone
		// Maybe playing with some of these ranges based on resolution would help
		grayscaleContext.filter = 'brightness(2.5) grayscale() contrast(4)'
		grayscaleContext.filter = 'brightness(1.5) grayscale() contrast(3)'
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
export function blurViewFinder(viewFinderCanvas: HTMLCanvasElement | OffscreenCanvas) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = makeCanvas(
			'blur',
			// "visible" so we can download it when the grayscale is visible
			canvasConfiguration.showGrayscaleImage,
			viewFinderCanvas.width,
			viewFinderCanvas.height
		)
		const grayscaleContext = getContext(grayScaleCanvas, {
			alpha: false,
			// Use the grayscale to synchronize to
			desynchronized: !canvasConfiguration.showGrayscaleImage
		})
		// Blur and up the contrast so we can edge detect later
		grayscaleContext.filter = 'blur(1.5px) contrast(4.5)'
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