import config from './config'
import { queryItems } from './dynamoClient'
import { DevicesStatsResult } from './getDevicesStats'

const { DEVICE_STATS_TABLE_NAME } = config

type DeviceStatsRecord = {
  type: 'deviceStats'
  timestamp: string
  payload: DevicesStatsResult
}

async function getLastDeviceStatsForDate(
  date: Date,
): Promise<DevicesStatsResult | null> {
  const { startIso, endIso } = getDayBounds(date)
  const items = await queryItems<DeviceStatsRecord>({
    TableName: DEVICE_STATS_TABLE_NAME,
    KeyConditionExpression:
      '#type = :type AND #timestamp BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#type': 'type',
      '#timestamp': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':type': 'deviceStats',
      ':start': startIso,
      ':end': endIso,
    },
    ScanIndexForward: false,
    Limit: 1,
  })

  return items[0]?.payload ?? null
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
