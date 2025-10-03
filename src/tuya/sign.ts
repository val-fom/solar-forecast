import crypto from 'crypto'
import config from '../config'

const { TUYA_ACCESS_ID, TUYA_ACCESS_SECRET } = config

export function sign({
  t,
  stringToSign,
  accessToken = '',
}: {
  t: string
  stringToSign: string
  accessToken?: string
}): string {
  const base = TUYA_ACCESS_ID + accessToken + t + stringToSign
  return crypto
    .createHmac('sha256', TUYA_ACCESS_SECRET)
    .update(base, 'utf8')
    .digest('hex')
    .toUpperCase()
}
