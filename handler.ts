import { run } from './src/app/run'
import config from './src/config'

const { TELEGRAM_CHAT_ID } = config

export const morning = () => run('morning')
export const evening = () => run('evening')

export const manualRun = async (event: any) => {
  const body = JSON.parse(event.body)
  const { chat, text } = body.message || body.edited_message

  if (chat.id != TELEGRAM_CHAT_ID) {
    console.log(`User @${chat.username} tried to chat with me`)
    return { statusCode: 200 }
  }

  if (text === '/manual_run') {
    await run()
  }

  return { statusCode: 200 }
}
