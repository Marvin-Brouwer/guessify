
/** Use animation frames as a promise to hopefully reduce lag */
export const awaitAnimationFrame = <T>(func: () => T | PromiseLike<T>) => new Promise<T>((resolve) => {
	requestAnimationFrame(() => {
		resolve(func())
	})
})