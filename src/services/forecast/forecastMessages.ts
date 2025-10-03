import type { ForecastResult } from './forecast.types'

export function buildRemainingRequestsMessage(
  forecast: ForecastResult,
): string {
  const remaining = forecast.message.ratelimit.remaining
  return `req/hr left: ${Math.floor(remaining / 3)}`
}

export function toKW(data: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      Math.round((value / 1000) * 10) / 10,
    ]),
  )
}
