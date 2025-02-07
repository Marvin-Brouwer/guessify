
export type ScanResult = [
	'none' | 'square-detected',
	undefined
] | [
	'code-detected',
	number
]

export function scanImage(_imageData: ImageData, _canvasContext: object): ScanResult {

	return [
		'none',
		undefined
	]
}