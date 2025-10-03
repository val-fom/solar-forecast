import { getForecast } from './src/getForecast'
import { sendResult } from './src/sendResult'
import { getDevicesStats } from './src/getDevicesStats'
import config from './src/config'

const { SOUTH_ONLY } = config
const southOnly = SOUTH_ONLY === 'true'

export async function morning(): Promise<void> {
  try {
    const forecast = await getForecast()
    await sendResult(
      '#forecast',
      forecast.result.watt_hours_day,
      remainingRequestsLimitMessage(forecast),
      southOnly ? '(#south_only)' : null,
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
      southOnly ? '(south only)' : null,
    )
    await sendResult('#mppt_totals', (await getDevicesStats()).totals)
  } catch (error) {
    console.error('Error in evening function:', error)
    await sendResult('#error', error)
  }
}

function remainingRequestsLimitMessage(forecast: any): string {
  return `remaining: ${Math.floor(forecast.message.ratelimit.remaining / 3)}` // doing 3 requests one call
}
