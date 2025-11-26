import { getForecast } from '../services/forecast/forecastService'
import { getDevicesStats } from '../services/device-stats/deviceStatsService'
import { formatForecastMessage } from '../services/forecast/forecastFormatter'
import { formatDeviceTotalsMessage } from '../services/device-stats/deviceStatsFormatter'
import { sendResult } from '../integrations/telegram'

export async function run(time?: 'morning' | 'evening'): Promise<void> {
  try {
    // Fetch and send forecast
    const forecast = await getForecast()
    const forecastMessage = formatForecastMessage(forecast, time)
    await sendResult(...forecastMessage)
  } catch (error) {
    console.error(`Error in run(${time}) function [forecast]:`, error)
    await sendResult('#error', (error as Error).message)
  }

  try {
    // Fetch and send device stats
    const deviceStats = await getDevicesStats()
    const totalsMessage = formatDeviceTotalsMessage({
      totals: deviceStats.totals,
      devices: deviceStats.devicesStats,
      time,
    })
    await sendResult(...totalsMessage)
  } catch (error) {
    console.error(`Error in run(${time}) function [deviceStats]:`, error)
    await sendResult('#error', (error as Error).message)
  }
}

export async function sendDeviceStats(): Promise<void> {
  try {
    const deviceStats = await getDevicesStats()
    const totalsMessage = formatDeviceTotalsMessage({
      totals: deviceStats.totals,
      devices: deviceStats.devicesStats,
    })
    await sendResult(...totalsMessage)
  } catch (error) {
    console.error(`Error in sendDeviceStats function:`, error)
    await sendResult('#error', error)
  }
}
