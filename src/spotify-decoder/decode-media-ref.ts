import { spotifyBarDecode } from './spotify-decoder'

export function decodeMediaRef(code: number[]) {

	// Remove first, last and middle bar
	const trimmedCode = [...code.slice(1, 11), ...code.slice(12, 22)]
	return spotifyBarDecode(trimmedCode)
}