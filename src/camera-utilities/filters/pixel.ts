export type Pixel = [
	r: number,
	g: number,
	b: number,
	a: number
]

export function getSinglePixel(pixels: Uint8ClampedArray<ArrayBufferLike>, i :number): Pixel {
	return [
		pixels[i],
		pixels[i + 1],
		pixels[i + 2],
		pixels[i + 3]
	]
}
export function updateSinglePixel(pixels: Uint8ClampedArray<ArrayBufferLike>, i :number, [r,g,b,a]: Pixel) {
		pixels[i] = r
		pixels[i + 1] = g
		pixels[i + 2] = b
		pixels[i + 3] = a
}