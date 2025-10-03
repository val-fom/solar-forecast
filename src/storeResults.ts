import { randomUUID } from 'crypto'
import config from './config'
import { putItem } from './dynamoClient'
import type { ForecastResult } from './getForecast'
import type { DevicesStatsResult } from './getDevicesStats'

const { FORECAST_TABLE_NAME, DEVICE_STATS_TABLE_NAME } = config

export async function storeForecastResult(
  payload: ForecastResult,
): Promise<void> {
  const timestamp = new Date().toISOString()
  await putItem(FORECAST_TABLE_NAME, {
    id: randomUUID(),
    type: 'forecast',
    timestamp,
    payload,
  })
}

export async function storeDeviceStatsResult(
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
