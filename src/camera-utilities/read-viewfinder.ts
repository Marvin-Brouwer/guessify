import { Canvas, canvasConfiguration, canvas } from './canvas'
import { awaitAnimationFrame } from './frame-helper'

/**
 * Extract the viewfinder pixels from video source.
 */
export function readViewFinder(viewFinderRect: DOMRectReadOnly, videoInput: CanvasImageSource, invert: boolean) {

	return awaitAnimationFrame(() => {

		const grayScaleCanvas = canvas(
			invert ? 'grayscale-inverted' : 'grayscale',
			viewFinderRect.width * 2,
			viewFinderRect.height * 2
		)
		// Fiddle with the image to make black more clear and glare less obvious
		// Todo dynamic lighting?
		grayScaleCanvas
			.getCanvasContext().filter = `grayscale() ${invert ? 'invert()' : ''} contrast(4.5)`
		grayScaleCanvas
			.getCanvasContext()
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
export function blurViewFinder(viewFinderCanvas: Canvas) {

	return awaitAnimationFrame(() => {

		const blurredCanvas = canvas(
			viewFinderCanvas.id.replace('grayscale', 'blur'),
			viewFinderCanvas.width,
			viewFinderCanvas.height
		)
		// Blur and up the contrast so we can edge detect later
		blurredCanvas
			.getCanvasContext().filter = `blur(${canvasConfiguration.blurAmount}px)`
		blurredCanvas
			.getCanvasContext()
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