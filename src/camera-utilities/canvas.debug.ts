import { canvasConfiguration } from './canvas'

// export type DebugCanvas = Pick<HTMLCanvasElement, 'width' | 'height'> & {
// 	getContext(type: '2d', options: any): Omit<
// 		CanvasPathDrawingStyles & CanvasRect & CanvasPath & CanvasDrawPath & CanvasFillStrokeStyles & CanvasImageData
// 	, 'isPointInPath' | 'isPointInStroke' | 'clip' | 'fill' | 'createPattern' | 'createConicGradient' | 'createImageData' | 'getImageData'> | null
// }
export function getDebugCanvasContext(canvas: OffscreenCanvas){
	return canvas.getContext('2d', canvasConfiguration.canvasContextOptions)!
}