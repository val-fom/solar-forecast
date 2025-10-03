import config from './config'

const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = config

export async function sendResult(...texts: any[]): Promise<any> {
  const normalizedText = texts
    .filter(Boolean)
    .map((t) => {
      if (typeof t !== 'string') {
        t = JSON.stringify(t, null, 2)
      }
      return t
    })
    .join('\n')
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(
    normalizedText,
  )}`
  const response = await fetch(url)
  const result = await response.json()
  return result
}
