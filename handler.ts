import { getForecast } from './src/getForecast'
import { sendResult } from './src/sendResult'
import { getDevicesStats } from './src/getDevicesStats'

export async function morning(): Promise<void> {
  try {
    await sendResult('#forecast', await getForecast())
  } catch (error) {
    console.error('Error in morning function:', error)
    await sendResult('#error', error)
  }
}

export async function evening(): Promise<void> {
  try {
    await sendResult('#forecast', await getForecast())
    await sendResult('#mppt_totals', (await getDevicesStats()).totals)
  } catch (error) {
    console.error('Error in evening function:', error)
    await sendResult('#error', error)
  }
}
