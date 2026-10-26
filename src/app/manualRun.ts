import config from '../config'
import { sendDeviceStats, run } from './run'
import { sendSolarReport } from './solarReport'
import { uptimeStats } from './uptimeStats'

const { TELEGRAM_CHAT_ID } = config

export const manualRun = async (event: any) => {
  const body = JSON.parse(event.body)
  const { chat, text } =
    body.message || body.edited_message || body.my_chat_member || {}

  if (!chat || chat.id != TELEGRAM_CHAT_ID) {
    console.log('Unknown Telegram chat')
    return { statusCode: 200 }
  }

  if (text === '/manual_run') await run()
  if (text === '/mppt_totals') await sendDeviceStats()
  if (text === '/solar') await sendSolarReport()
  if (text === '/uptime') await uptimeStats()

  return { statusCode: 200 }
}
