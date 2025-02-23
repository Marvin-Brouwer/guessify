/**
 * This code is converted from: https://github.com/boonepeter/boonepeter.github.io-code/blob/main/spotify-codes-part-2/src/encode_decode.py.
 *
 * There's an associated blog post explaining how it works. \
 * {@link https://boonepeter.github.io/posts/2020-11-10-spotify-codes/ part1}
 * {@link https://boonepeter.github.io/posts/spotify-codes-part-2/ part2}
 */

import { createModel } from 'js-crc'

/** Binary number representation */
type Bit = 0 | 1

/**
 * Converts a binary array to an integer. (little endian)
 *
 * @param bin - The binary array.
 * @param length - The number of bits to consider.
 * @returns The integer representation of the binary array.
 */
export function binToInt(bin: Bit[], length: number): number {
    return parseInt(bin.slice(0, length).reverse().join(""), 2);
}

/**
 * Converts a binary array to bytes.
 *
 * @param bin - The binary array.
 * @param length - The number of bits to convert.
 * @returns An array of bytes.
 */
export function binToBytes(bin: Bit[], length: number): Bit[] {
	let b = bin.slice(0, length).concat(new Array((8 - (length % 8)) % 8).fill(0))
	return Array.from({ length: b.length / 8 }, (_, i) => {
		return b[i * 8] << 7 | b[i * 8 + 1] << 6 | b[i * 8 + 2] << 5 |
			b[i * 8 + 3] << 4 | b[i * 8 + 4] << 3 | b[i * 8 + 5] << 2 |
			b[i * 8 + 6] << 1 | b[i * 8 + 7]
	}) as Bit[]
}

/**
 * CRC model for validating Spotify barcode data,
 * using Rocksoft model:
 * [!NOTE]\
 * this is not quite any of their predefined CRC's
 */
const spotifyCrc = createModel({
	width: 8, // Number of check bits (degree of poly)
	poly: 0x7,// Representation of poly without high term (x^8+x^2+x+1)
	init: 0x0, // Initial fill of register
	refin: true, // Enable byte reverse data
	refout: true, // Enable byte reverse check
	xorout: 0xff // Mask check (i.e. invert)
})

/**
 * Checks if the given binary array has a valid Spotify CRC.
 *
 * @param bin45 - A 45-bit binary array containing data and CRC.
 * @returns `true` if the CRC is valid, otherwise `false`.
 */
export function checkSpotifyCRC(bin45: Bit[]): boolean {
	const data = binToBytes(bin45, 37)
	const crcValue = binToBytes(bin45.slice(37), 8)[0]
	// `spotifyCrc` returns a hexadecimal number
	const hexaDecimal = 16
	return parseInt(spotifyCrc(data), hexaDecimal) === crcValue
}

/**
 * Performs a circular right shift on a binary array.
 *
 * @param arr - The binary array.
 * @param shift - The number of positions to shift.
 * @returns The shifted binary array.
 */
export function shiftRight(arr: Bit[], shift: number): Bit[] {
	if (!arr || arr.length === 0) return []
	shift = shift % arr.length
	return arr.slice(-shift).concat(arr.slice(0, -shift))
}

/**
 * Convolutional generator matrix used in encoding.
 */
export const convGen: Bit[][] = [
	[0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, ...Array(31).fill(0)],
	[1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, ...Array(32).fill(0)],
	[0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, ...Array(32).fill(0)]
]

/**
 * Inverse convolutional generator matrix.
 */
export const convGeneratorInv: Bit[][] = Array.from({ length: 45 }, (_, s) => {
	const index = s % 3
	return shiftRight(convGen.at(index) ?? [], s + 27)
})

/**
 * Gray code inverse mapping used for decoding.
 */
const grayCodeInv: Bit[][] = [
	[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0],
	[1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]
]

/**
 * Decodes a Spotify barcode from a sequence of 20 levels.
 *
 * @param levels - An array of 20 integer levels (each between 0-7).
 * @returns The decoded integer value, or `undefined` if CRC validation fails.
 */
export function spotifyBarDecode(levels: number[]): number | undefined {
	if (levels.length !== 20) {
		console.error("Invalid levels length; expected 20.")
		return undefined
	}

	// Convert levels to binary representation
	const levelBits = levels.flatMap(level => grayCodeInv[level] ?? [])

	// Apply convolutional encoding
	const convBits = levelBits.map((_, i) => levelBits[(43 * i) % 60])

	// Select relevant columns
	const cols = Array.from({ length: 60 }, (_, i) => i).filter(i => i % 4 !== 2)
	const convBits45 = cols.map(c => convBits[c])

	// Compute the final bin45 using matrix multiplication in GF(2)
	const bin45 = Array.from({ length: 45 }, (_, i) =>
		convBits45.reduce((acc, bit, j) => (acc ^ (bit & convGeneratorInv[j][i])) as Bit, 0) as Bit
	)

	// Validate CRC and return the decoded integer
	if (checkSpotifyCRC(bin45)) {
		return binToInt(bin45, 37)
	} else {
		return undefined
	}
}

// export function spotifyBarDecode_Test(levels: number[]) {

// 	const levelBits = levels.flatMap(level => grayCodeInv[level] ?? [])
// 	const convBits = levelBits.map((_, i) => levelBits[(43 * i) % 60])
// 	const cols = Array.from({ length: 60 }, (_, i) => i).filter(i => i % 4 !== 2)
// 	const convBits45 = cols.map(c => convBits[c])

// 	const bin45 = Array.from({ length: 45 }, (_, i) =>
// 		convBits45.reduce((acc, bit, j) => (acc ^ (bit & convGeneratorInv[j][i])) as Bit, 0) as Bit
// 	)


// 	return {
// 		levelBits,
// 		convBits,
// 		cols,
// 		convBits45,
// 		bin45
// 	}
// }
