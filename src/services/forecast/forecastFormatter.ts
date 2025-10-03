import config from '../../config'
import type { ForecastResult } from './forecast.types'

function toKiloWattHours(wh: number): string {
  return (wh / 1000).toFixed(1)
}

const { SOUTH_ONLY } = config
const southOnlyTag = SOUTH_ONLY === 'true' ? '(#south_only)' : null

export function formatForecastMessage(forecast: ForecastResult): string[] {
  const dayEntries = Object.entries(forecast.result.watt_hours_day).map(
    ([date, value]) => `📅 ${date}: ${toKiloWattHours(value)} kWh`,
  )

  const remaining = Math.floor(forecast.message.ratelimit.remaining / 3)
  const lines = [
    '#forecast',
    dayEntries.join('\n'),
    `🔄 Req/h left: ${remaining}`,
  ]

  if (southOnlyTag) {
    lines.push(southOnlyTag)
  }

  return lines
}
