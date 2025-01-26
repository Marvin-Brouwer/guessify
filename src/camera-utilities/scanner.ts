

export type ScanResult = [
	'none' | 'square-detected',
	undefined
] | [
	'code-detected',
	number
]
export function scanImage(scanImageData: ImageData, canvasContext: CanvasRenderingContext2D): ScanResult {

	return [
		'none',
		undefined
	]
}