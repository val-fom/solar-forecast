import config from '../config'
import { getForecast } from '../services/forecast/forecastService'
import { formatForecastMessage } from '../services/forecast/forecastFormatter'
import { sendResult } from '../integrations/telegram'

const { SOUTH_ONLY } = config
const southOnlyTag = SOUTH_ONLY === 'true' ? '(#south_only)' : null

export async function runMorning(): Promise<void> {
  try {
    const forecast = await getForecast()
    const message = formatForecastMessage(forecast, {
      southOnlyTag,
    })
    await sendResult(message)
  } catch (error) {
    console.error('Error in morning function:', error)
    await sendResult('#error', error)
  }
}
