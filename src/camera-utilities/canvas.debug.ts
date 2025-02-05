import { canvasConfiguration } from './canvas'

export type DebugCanvas = Pick<HTMLCanvasElement, 'width' | 'height'> & {
	getContext(type: '2d', options: any): Omit<
		CanvasPathDrawingStyles & CanvasRect & CanvasPath & CanvasDrawPath & CanvasFillStrokeStyles
	, 'isPointInPath' | 'isPointInStroke' | 'clip' | 'fill' | 'createPattern' | 'createConicGradient'> | null
}
export function getDebugCanvasContext(canvas: DebugCanvas){
	return canvas.getContext('2d', canvasConfiguration.canvasContextOptions)!
}