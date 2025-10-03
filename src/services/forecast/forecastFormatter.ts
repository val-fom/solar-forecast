import { evening } from './../../../handler'
import config from '../../config'
import type { ForecastResult } from './forecast.types'

function toKiloWattHours(wh: number): string {
  return (wh / 1000).toFixed(1)
}

const { SOUTH_ONLY } = config
const southOnlyTag = SOUTH_ONLY === 'true' ? '(#south_only)' : null

export function formatForecastMessage(
  forecast: ForecastResult,
  time?: 'morning' | 'evening',
): string[] {
  const dayEntries = Object.entries(forecast.result.watt_hours_day).map(
    ([date, value]) => `📅 ${date}: ${toKiloWattHours(value)} kWh`,
  )
  const dayTimeIcon =
    time === 'morning' ? '🌅' : time === 'evening' ? '🏙️' : null

  const remaining = Math.floor(forecast.message.ratelimit.remaining / 3)
  const lines = [
    ...(dayTimeIcon ? [dayTimeIcon] : []),
    `#forecast`,
    dayEntries.join('\n'),
    `🔄 Req/h left: ${remaining}`,
  ]

  if (southOnlyTag) {
    lines.push(southOnlyTag)
  }

  return lines
}
