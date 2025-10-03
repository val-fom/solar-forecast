import type { ForecastResult } from './forecast.types'

function toKiloWattHours(wh: number): string {
  return (wh / 1000).toFixed(1)
}

export function formatForecastMessage(
  forecast: ForecastResult,
  options?: { southOnlyTag?: string | null; days?: number },
): string {
  const { southOnlyTag, days = 3 } = options ?? {}

  const dayEntries = Object.entries(forecast.result.watt_hours_day)
    .sort(([a], [b]) => new Date(a).valueOf() - new Date(b).valueOf())
    .slice(0, days)
    .map(([date, value]) => `📅 ${date}: ${toKiloWattHours(value)} kWh`)

  const remaining = Math.floor(forecast.message.ratelimit.remaining / 3)
  const lines = [
    '#forecast',
    ...dayEntries,
    `🔄 Remaining: ${remaining}`,
  ]

  if (southOnlyTag) {
    lines.push(southOnlyTag)
  }

  return lines.join('\n')
}
