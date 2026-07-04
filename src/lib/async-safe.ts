export class AsyncTimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "AsyncTimeoutError";
  }
}

export const ASYNC_TIMEOUT = {
  auth: 10_000,
  garden3d: 20_000,
  oauth: 12_000,
} as const;

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  message?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new AsyncTimeoutError(message ?? `Timed out after ${Math.round(ms / 1000)}s`)),
      ms,
    );
    Promise.resolve(promise)
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  return error instanceof Error ? error.message : fallback;
}
