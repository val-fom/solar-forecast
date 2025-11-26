const DEFAULT_TIMEOUT_MS = 3_000

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (options.signal) {
    const externalSignal = options.signal
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      })
    }
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request to ${url} aborted after ${timeoutMs}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
