import { callTuya } from './callTuya'
import { getTuyaToken } from '../auth/getTuyaToken'

export type OperationLogResult = {
  has_next: boolean
  logs: Array<{
    code: 'doorcontact_state'
    event_time: number
    value: 'true' | 'false'
  }>
}

export async function getOperationLog(
  deviceId: string,
  query: { start_time: number; end_time: number },
): Promise<OperationLogResult> {
  const { access_token } = await getTuyaToken()

  const result = await callTuya<OperationLogResult>({
    path: `/v2.0/cloud/thing/${deviceId}/logs`,
    accessToken: access_token,
    query: {
      query_type: 1,
      size: 100, // max 100
      type: '7',
      start_time: query.start_time,
      end_time: query.end_time,
    },
  })

  return result
}
