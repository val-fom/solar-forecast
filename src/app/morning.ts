import config from '../config'
import { getForecast } from '../services/forecast/forecastService'
import { sendResult } from '../integrations/telegram'
import { buildRemainingRequestsMessage } from '../services/forecast/forecastMessages'

const { SOUTH_ONLY } = config
const southOnlyTag = SOUTH_ONLY === 'true' ? '(#south_only)' : null

export async function runMorning(): Promise<void> {
  try {
    const forecast = await getForecast()
    await sendResult(
      '#forecast',
      forecast.result.watt_hours_day,
      buildRemainingRequestsMessage(forecast),
      southOnlyTag,
    )
  } catch (error) {
    console.error('Error in morning function:', error)
    await sendResult('#error', error)
  }
}
