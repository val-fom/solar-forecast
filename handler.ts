import { getForecast } from './src/getForecast'
import { sendResult } from './src/sendResult'
import { getDevicesStats } from './src/getDevicesStats'

export async function morning(): Promise<void> {
  try {
    const forecast = await getForecast()
    await sendResult(
      '#forecast',
      forecast.result.watt_hours_day,
      remainingRequestsLimitMessage(forecast),
    )
  } catch (error) {
    console.error('Error in morning function:', error)
    await sendResult('#error', error)
  }
}

export async function evening(): Promise<void> {
  try {
    const forecast = await getForecast()
    await sendResult(
      '#forecast',
      forecast.result.watt_hours_day,
      remainingRequestsLimitMessage(forecast),
    )
    await sendResult('#mppt_totals', (await getDevicesStats()).totals)
  } catch (error) {
    console.error('Error in evening function:', error)
    await sendResult('#error', error)
  }
}

function remainingRequestsLimitMessage(forecast: any): string {
  return `remaining: ${Math.floor(forecast.message.ratelimit.remaining / 3)}`
}
