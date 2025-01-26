

export type ScanResult = [
	'none' | 'square-detected',
	undefined
] | [
	'code-detected',
	number
]
export function scanImage(_scanImageData: ImageData, _canvasContext: CanvasRenderingContext2D): ScanResult {

	return [
		'none',
		undefined
	]
}