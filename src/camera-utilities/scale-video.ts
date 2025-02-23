import { awaitAnimationFrame } from './frame-helper'
import { canvasConfiguration } from './canvas';
import { getBrowserMetadata } from '../helpers/browser-metadata';

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

	// The video feed may decide to rotate the stream
	const trueWidth = getBrowserMetadata().platform.type === 'desktop' ? frameWidth : Math.min(frameHeight, frameWidth)
	const trueHeight = getBrowserMetadata().platform.type === 'desktop' ? frameHeight : Math.max(frameHeight, frameWidth)

	const resizeRatio = Math.max(videoBox.width / trueWidth, videoBox.height / trueHeight)
	const resizedWidth = trueWidth * resizeRatio
	const resizedHeight = trueHeight * resizeRatio
	var offsetX = (videoBox.width - trueWidth * resizeRatio) / 2
	var offsetY = (videoBox.height - trueHeight * resizeRatio) / 2

	return {
		boxWidth: resizedWidth,
		boxHeight: resizedHeight,
		frameWidth: trueWidth, frameHeight: trueHeight,
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
		const scaleCanvas = new OffscreenCanvas(
			boxWidth,
			boxHeight
		)
		canvasConfiguration
			.getCanvasContext(scaleCanvas)
			.drawImage(
				videoElement,
				0, 0,
				frameWidth, frameHeight,
				offsetX, offsetY,
				boxWidth, boxHeight
			)

		return scaleCanvas
	})
}