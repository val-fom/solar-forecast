import config from '../config'
import { sign } from './sign'
import { buildStringToSign } from './buildStringToSign'

const { TUYA_ACCESS_ID, TUYA_ENDPOINT } = config

export async function getTuyaToken(): Promise<{
  access_token: string
  uid: string
  expire_time: number
  refresh_token: string
}> {
  const t = Date.now().toString()
  const path = '/v1.0/token?grant_type=1'
  const stringToSign = buildStringToSign({
    method: 'GET',
    path,
  })
  const signature = sign({
    t,
    stringToSign,
  })

  const res = await fetch(`${TUYA_ENDPOINT}${path}`, {
    headers: {
      client_id: TUYA_ACCESS_ID,
      sign: signature,
      t,
      sign_method: 'HMAC-SHA256',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(
      `Tuya token request failed: ${res.status} ${res.statusText} - ${body}`,
    )
  }
  const result = await res.json()
  return result.result
}
