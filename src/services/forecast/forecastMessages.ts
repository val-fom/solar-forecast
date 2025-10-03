import type { ForecastResult } from './forecast.types'

export function buildRemainingRequestsMessage(
  forecast: ForecastResult,
): string {
  const remaining = forecast.message.ratelimit.remaining
  return `req/hr left: ${Math.floor(remaining / 3)}`
}
