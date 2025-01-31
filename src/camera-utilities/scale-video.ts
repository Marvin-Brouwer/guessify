import { canvasConfiguration, getContext, makeCanvas } from './canvas'
import { awaitAnimationFrame } from './frame-helper'

type ScaledVideoFrame = {
	boxWidth: number,
	boxHeight: number,
	frameWidth: number,
	frameHeight: number,
	offsetX: number,
	offsetY: number
}

function calculateVideoScale(videoElement: HTMLVideoElement, videoFrame: MediaStreamTrack): ScaledVideoFrame {

	const videoBox = videoElement.getBoundingClientRect()

	const frameSettings = videoFrame.getSettings()
	// Calculate the videoFrame offset to the videoBox
	let { width: frameWidth, height: frameHeight, aspectRatio } = frameSettings

	if (!frameWidth) frameWidth = frameHeight! * aspectRatio!
	if (!frameHeight) frameHeight = frameWidth! * aspectRatio!

	const resizeRatio = Math.max(videoBox.width / frameWidth, videoBox.height / frameHeight)
	const resizedWidth = frameWidth * resizeRatio
	const resizedHeight = frameHeight * resizeRatio
	var offsetX = (videoBox.width - frameWidth * resizeRatio) / 2
	var offsetY = (videoBox.height - frameHeight * resizeRatio) / 2

	return {
		boxWidth: resizedWidth,
		boxHeight: resizedHeight,
		frameWidth, frameHeight,
		offsetX, offsetY
	}
}

/**
 * It turned out quite hard to calculate where the viewfinder would be in relative space.
 * So, we just calculate the ratio and draw on a canvas, now we can use absolute space!
 * @param videoElement The video element which renders the frame larger because of object-fit: contain
 * @param videoFrame The actual video frame
 * @returns A canvas with a redrawn picture.
 */
export function scaleupVideo(videoElement: HTMLVideoElement, videoFrame: MediaStreamTrack) {

	const videoScale = calculateVideoScale(videoElement, videoFrame)
	const { boxWidth, boxHeight, frameWidth, frameHeight, offsetX, offsetY } = videoScale
	if (boxWidth === 0 || Number.isNaN(boxWidth)) return undefined

	return awaitAnimationFrame(() => {
		const scaleCanvas = makeCanvas(
			'scale', canvasConfiguration.showScaleCanvas,
			boxWidth,
			boxHeight
		)
		const scaleContext = getContext(scaleCanvas, {
			alpha: false,
			desynchronized: !canvasConfiguration.showScaleCanvas
		})
		scaleContext.drawImage(
			videoElement,
			0, 0,
			frameWidth, frameHeight,
			offsetX, offsetY,
			boxWidth, boxHeight
		)

		return scaleCanvas
	})
}