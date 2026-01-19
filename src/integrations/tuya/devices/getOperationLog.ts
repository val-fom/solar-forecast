import { callTuya } from './callTuya'
import { getTuyaToken } from '../auth/getTuyaToken'

export type OperationLogResult = Record<string, unknown>

export async function getOperationLog(
  deviceId: string,
  query?: { start_time: number; end_time: number },
): Promise<OperationLogResult> {
  const { access_token } = await getTuyaToken()

  return callTuya<OperationLogResult>({
    path: `/v2.0/cloud/thing/${deviceId}/logs`,
    accessToken: access_token,
    query: {
      query_type: 1,
      size: 100, // max 100
      type: '7',
      ...query,
    },
  })
}
