import { Component, Accessor, createEffect, JSXElement, Setter } from 'solid-js';

export type VideoPlayerProps = {
	stream: Accessor<MediaStream | undefined>,
	ref?: Setter<HTMLVideoElement | undefined>
}
export const VideoPlayer: Component<VideoPlayerProps> = ({ stream, ref }) => {

	const videoDom = <video loop />;
	const videoPlayerElement = videoDom as HTMLVideoElement

	ref?.(videoPlayerElement)

	createEffect(() => {
		videoPlayerElement.srcObject = stream() ?? null;
		if (videoPlayerElement.srcObject) {
			videoPlayerElement.removeAttribute('src');
			videoPlayerElement.onloadedmetadata = () => {
				videoPlayerElement.play();
			};
		}
		else {
			videoPlayerElement.pause();
		}
	}, stream)

	return videoPlayerElement as JSXElement;
}