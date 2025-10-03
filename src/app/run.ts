import { evening } from './../../handler'
import { getForecast } from '../services/forecast/forecastService'
import { getDevicesStats } from '../services/device-stats/deviceStatsService'
import { formatForecastMessage } from '../services/forecast/forecastFormatter'
import { formatDeviceTotalsMessage } from '../services/device-stats/deviceStatsFormatter'
import { sendResult } from '../integrations/telegram'

export async function run(time?: 'morning' | 'evening'): Promise<void> {
  try {
    const forecast = await getForecast()
    const forecastMessage = formatForecastMessage(forecast, time)
    await sendResult(...forecastMessage)

    const deviceStats = await getDevicesStats()
    const totalsMessage = formatDeviceTotalsMessage(deviceStats.totals, time)
    await sendResult(...totalsMessage)
  } catch (error) {
    console.error(`Error in run(${time}) function:`, error)
    await sendResult('#error', error)
  }
}
