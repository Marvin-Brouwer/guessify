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
		grayscaleContext.filter = 'grayscale() brightness(2) contrast(3) blur(1px)'
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