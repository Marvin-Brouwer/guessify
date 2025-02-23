/**
 * We had some difficulty getting the converted typescript code to work.
 * So, we've written some tests to check all steps.
 * This test suite validates all the python functions step-by-step to make sure everything works as intended.
 *
 * If you need some more practical debug logging on a failing test, replace:
 * ```ts
 *		expect(typeScriptResult)
 *			.toBe(originalResult)
 * ```
 * with
 * ```ts
 *		expect(JSON.stringify(typeScriptResult))
 *			.toBe(JSON.stringify(originalResult))
 *```
 */

import { describe, expect } from 'vitest'
import { pipInstall, py } from './portable-python'

import {
	binToBytes, binToInt, checkSpotifyCRC, convGen, convGeneratorInv, shiftRight, spotifyBarDecode
} from '../spotify-decoder'

describe('python parity', async (test) => {

	await pipInstall('numpy')
	await pipInstall('crccheck')

	test('bin_to_int', async () => {

		// Arrange
		const bits: (0 | 1)[] = [
			0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1,
			0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
			0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1,
			0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0
		]
		const originalResult = await py`
			from encode_decode import bin_to_int;
			print(bin_to_int(${bits}, 37));
		`

		// Act
		const typeScriptResult = binToInt(bits, 37)

		// Assert
		expect(typeScriptResult)
			.toMatchObject(originalResult)
	})

	test('bin_to_bytes', async () => {

		// Arrange
		const originalResult = await py`
			from encode_decode import bin_to_bytes;
			print(bin_to_bytes([1,0,1], 3));
		`

		// Act
		const typeScriptResult = binToBytes([1, 0, 1], 3)

		// Assert
		expect(typeScriptResult)
			.toMatchObject(originalResult)
	})

	test('check_spotify_crc', async () => {

		// Arrange
		const bits: (0 | 1)[] = [
			0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1,
			0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
			0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1,
			0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0
		]
		const originalResult = await py`
			from encode_decode import check_spotify_crc;
			print(check_spotify_crc(${bits}));
		`

		// Act
		const typeScriptResult = checkSpotifyCRC(bits)

		// Assert
		expect(typeScriptResult)
			.toMatchObject(originalResult)
	})

	test('shift_right', async () => {

		// Arrange
		const bits: (0 | 1)[] = [
			1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1,
			1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0,
			0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0,
			1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,
			1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0
		]
		const originalResult = await py`
			from encode_decode import shift_right;
			print(shift_right(${bits}, 5));
		`

		// Act
		const typeScriptResult = shiftRight(bits, 5)

		// Assert
		expect(typeScriptResult)
			.toMatchObject(originalResult)
	})

	test('conv_gen', async () => {

		// Arrange
		const originalResult = await py`
			import numpy;
			from json import dumps;
			from encode_decode import conv_gen;
			numpy.set_printoptions(threshold=numpy.inf);
			print(dumps(conv_gen));
		`
		// Act
		const typeScriptResult = convGen

		// Assert
		expect(typeScriptResult)
			.toStrictEqual(originalResult)
	})

	test('conv_generator_inv', async () => {

		// Arrange
		const originalResult = await py`
			import numpy;
			from json import dumps;
			from encode_decode import conv_generator_inv;
			numpy.set_printoptions(threshold=numpy.inf);
			print(dumps(conv_generator_inv.tolist()));
		`
		// Act
		const typeScriptResult = convGeneratorInv

		// Assert
		expect(typeScriptResult)
			.toStrictEqual(originalResult)
	})

	test('spotify_bar_decode', async () => {

		// Arrange
		const levels = [5, 7, 4, 1, 4, 6, 6, 0, 2, 4, 3, 4, 6, 7, 5, 5, 6, 0, 5, 0]
		const originalResult = await py`
			from encode_decode import spotify_bar_decode;
			print(spotify_bar_decode(${levels}));
		`
		// Act
		const typeScriptResult = spotifyBarDecode(levels)

		// Assert
		expect(typeScriptResult)
			.toStrictEqual(originalResult)
	})
})