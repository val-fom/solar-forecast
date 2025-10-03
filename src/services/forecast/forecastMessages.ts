import type { ForecastResult } from './forecast.types'

export function buildRemainingRequestsMessage(
  forecast: ForecastResult,
): string {
  const remaining = forecast.message.ratelimit.remaining
  return `remaining: ${Math.floor(remaining / 3)}`
}
