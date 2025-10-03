import { randomUUID } from 'crypto'
import config from '../../config'
import { putItem } from './dynamoClient'
import type { ForecastResult } from '../../services/forecast/forecast.types'

const { FORECAST_TABLE_NAME } = config

export async function saveForecastResult(payload: ForecastResult): Promise<void> {
  const timestamp = new Date().toISOString()
  await putItem(FORECAST_TABLE_NAME, {
    id: randomUUID(),
    type: 'forecast',
    timestamp,
    payload,
  })
}
