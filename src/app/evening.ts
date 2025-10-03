import config from '../config'
import { getForecast } from '../services/forecast/forecastService'
import { sendResult } from '../integrations/telegram'
import { getDevicesStats } from '../services/device-stats/deviceStatsService'
import { buildRemainingRequestsMessage } from '../services/forecast/forecastMessages'

const { SOUTH_ONLY } = config
const southOnlyTag = SOUTH_ONLY === 'true' ? '(south only)' : null

export async function runEvening(): Promise<void> {
  try {
    const forecast = await getForecast()
    await sendResult(
      '#forecast',
      forecast.result.watt_hours_day,
      buildRemainingRequestsMessage(forecast),
      southOnlyTag,
    )

    const deviceStats = await getDevicesStats()
    await sendResult('#mppt_totals', deviceStats.totals)
  } catch (error) {
    console.error('Error in evening function:', error)
    await sendResult('#error', error)
  }
}
