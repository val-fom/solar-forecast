import { randomUUID } from 'crypto'
import config from '../../config'
import { putItem, queryItems } from './dynamoClient'
import type { DevicesStatsResult } from '../../services/device-stats/deviceStats.types'

const { DEVICE_STATS_TABLE_NAME } = config

export async function saveDeviceStatsResult(
  payload: DevicesStatsResult,
): Promise<void> {
  const timestamp = new Date().toISOString()
  await putItem(DEVICE_STATS_TABLE_NAME, {
    id: randomUUID(),
    type: 'deviceStats',
    timestamp,
    payload,
  })
}

type DeviceStatsRecord = {
  type: 'deviceStats'
  timestamp: string
  payload: DevicesStatsResult
}

type DeviceStatsQueryInput = {
  startIso: string
  endIso: string
}

export async function fetchLatestDeviceStatsForWindow(
  { startIso, endIso }: DeviceStatsQueryInput,
): Promise<DevicesStatsResult | null> {
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
