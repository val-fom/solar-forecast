import { sendResult } from '../integrations/telegram'
import { getSolarReport, formatSolarReport } from '../services/solar/solarReport'

export async function sendSolarReport(): Promise<void> {
  try {
    const report = await getSolarReport()
    await sendResult(...formatSolarReport(report))
  } catch (error) {
    console.error('Error in sendSolarReport:', error)
    await sendResult('#error', (error as Error).message)
  }
}
