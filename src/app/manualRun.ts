import config from '../config'
import { sendDeviceStats, run } from './run'

const { TELEGRAM_CHAT_ID } = config

export const manualRun = async (event: any) => {
  const body = JSON.parse(event.body)
  const { chat, text } =
    body.message || body.edited_message || body.my_chat_member || {}

  if (chat.id != TELEGRAM_CHAT_ID) {
    console.log(`User @${chat.username} tried to chat with me`)
    return { statusCode: 200 }
  }

  if (text === '/manual_run') {
    await run()
  }

  if (text === '/mppt_totals') {
    await sendDeviceStats()
  }

  return { statusCode: 200 }
}
