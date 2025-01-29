
export type ErrorWithRestore<T extends Error = Error> = T & { restore?: () => void }
export const ensureStack = (error: Error) => {
	error.stack ??= new Error().stack;
	return error;
}

export const ensureRejectionStack = async <T>(promise: () => PromiseLike<T>): Promise<T> => {

	try {
		return await promise();
	} catch (err) {
		throw ensureStack(err instanceof Error ? err : new Error(err?.toString()))
	}
}