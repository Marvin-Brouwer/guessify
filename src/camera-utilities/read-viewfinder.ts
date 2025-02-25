import { awaitAnimationFrame } from './frame-helper'
import { canvasConfiguration } from './canvas';

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
		canvasConfiguration
			.getCanvasContext(grayScaleCanvas)
			.filter = `grayscale(100%) brightness(1.2) contrast(4.5) ${invert ? 'invert(100%)' : ''}`
		canvasConfiguration
			.getCanvasContext(grayScaleCanvas)
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