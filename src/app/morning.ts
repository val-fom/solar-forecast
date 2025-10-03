import config from '../config'
import { getForecast } from '../services/forecast/forecastService'
import { formatForecastMessage } from '../services/forecast/forecastFormatter'
import { sendResult } from '../integrations/telegram'

export async function runMorning(): Promise<void> {
  try {
    const forecast = await getForecast()
    const message = formatForecastMessage(forecast)
    await sendResult(...message)
  } catch (error) {
    console.error('Error in morning function:', error)
    await sendResult('#error', error)
  }
}
