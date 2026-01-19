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

export async function getDoorsContactLog(
  deviceId: string,
  query: { start_time: number; end_time: number },
): Promise<OperationLogResult> {
  const { access_token } = await getTuyaToken()
  const allLogs: OperationLogResult['logs'] = []
  let hasNext = true
  let endTime = query.end_time

  while (hasNext) {
    const result = await callTuya<OperationLogResult>({
      path: `/v2.0/cloud/thing/${deviceId}/logs`,
      accessToken: access_token,
      query: {
        query_type: 1,
        size: 100, // max 100
        type: '7',
        start_time: query.start_time,
        end_time: endTime,
      },
    })

    allLogs.push(...result.logs)
    hasNext = result.has_next

    if (hasNext && result.logs.length > 0) {
      // Use the last log item's event_time as the end_time for next request
      endTime = result.logs[result.logs.length - 1].event_time
    }
  }

  const doorsContactLogsOnly = allLogs.filter(
    (log) => log.code === 'doorcontact_state',
  )

  return {
    has_next: false,
    logs: doorsContactLogsOnly,
  }
}
