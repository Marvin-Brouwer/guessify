import { awaitAnimationFrame } from './frame-helper'
import { canvasConfiguration, getCanvasContext } from './canvas';

/**
 * Extract the viewfinder pixels from video source.
 */
export function readViewFinder(viewFinderRect: DOMRectReadOnly, videoInput: CanvasImageSource, invert: boolean) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = new OffscreenCanvas(
			viewFinderRect.width * 2,
			viewFinderRect.height * 2
		)
		// Fiddle with the image to make black more clear and glare less obvious
		// Todo dynamic lighting?
		getCanvasContext(grayScaleCanvas).filter = `grayscale() ${invert ? 'invert(100%)' : ''} contrast(4.5)`
		getCanvasContext(grayScaleCanvas)
			.drawImage(
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
export function blurViewFinder(viewFinderCanvas: OffscreenCanvas) {

	return awaitAnimationFrame(() => {

		const blurredCanvas = new OffscreenCanvas(
			viewFinderCanvas.width,
			viewFinderCanvas.height
		)
		// Blur and up the contrast so we can edge detect later
		getCanvasContext(blurredCanvas).filter = `blur(${canvasConfiguration.blurAmount}px)`
		getCanvasContext(blurredCanvas)
			.drawImage(
				viewFinderCanvas,
				0, 0,
				viewFinderCanvas.width, viewFinderCanvas.height,
				0, 0,
				blurredCanvas.width, blurredCanvas.height
			);

		return blurredCanvas;
	})
}