/**
 * To make sure we're actually able to decode spotify codes, we have a test suite testing real values.
 */

import { test, expect } from 'vitest'
import { decodeMediaRef } from '../decode-media-ref'

const codes: [code: string, expectedMediaRef: number][] = [
	['05741466024734675560500', 57639171874],
	['06607602231707646147410', 26560102031],
	['05120643716777731637070', 75845227563],
]

test.for(codes)(`code '%s' -> media-ref:%s`, ([codeString, expectedMediaRef]) => {

	// Arrange
	const code = codeString.split('').map(Number)

	// Act
	const mediaRef = decodeMediaRef(code)

	// Assert
	expect(mediaRef)
		.toStrictEqual(expectedMediaRef)
})
