import { CanvasContext } from './canvas'

export type ScanResult = [
	'none' | 'square-detected',
	undefined
] | [
	'code-detected',
	number
]

export function scanImage(_imageData: ImageData, _canvasContext: CanvasContext): ScanResult {

	return [
		'none',
		undefined
	]
}