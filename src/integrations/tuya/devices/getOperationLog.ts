import { callTuya } from './callTuya'
import { getTuyaToken } from '../auth/getTuyaToken'

export type OperationLogResult = Record<string, unknown>

export async function getOperationLog(
  deviceId: string,
  query?: Record<string, string | number | undefined>,
): Promise<OperationLogResult> {
  const { access_token } = await getTuyaToken()

  return callTuya<OperationLogResult>({
    path: `/v2.0/cloud/thing/${deviceId}/logs`,
    accessToken: access_token,
    query,
  })
}
