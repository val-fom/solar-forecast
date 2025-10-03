import type { DevicesStatsResult } from './deviceStats.types'
import { fetchLatestDeviceStatsForWindow } from '../../persistence/dynamo/deviceStatsRepository'

async function getLastDeviceStatsForDate(
  date: Date,
): Promise<DevicesStatsResult | null> {
  const { startIso, endIso } = getDayBounds(date)
  return fetchLatestDeviceStatsForWindow({ startIso, endIso })
}

export async function getYesterdaysLastDeviceStats(): Promise<DevicesStatsResult | null> {
  const yesterday = new Date()
  yesterday.setUTCHours(0, 0, 0, 0)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  return getLastDeviceStatsForDate(yesterday)
}

function getDayBounds(date: Date) {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCHours(23, 59, 59, 999)

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}
