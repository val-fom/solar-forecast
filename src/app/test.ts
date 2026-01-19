import config from '../config'
import { getDevicesProperties, getOperationLog } from '../integrations/tuya'
import {
  analyzeEventLogs,
  formatAnalysisResult,
} from '../utils/analyzeEventLogs'

const { TUYA_DEVICE_ID_TEST } = config

export const test = async () => {
  const deviceOperationLog = await getOperationLog(TUYA_DEVICE_ID_TEST, {
    start_time: +getMonthStartDate(),
    end_time: Date.now(),
  })

  // Analyze event logs
  const analysis = analyzeEventLogs(deviceOperationLog)
  console.log('\n' + formatAnalysisResult(analysis))

  return deviceOperationLog
}

function getYesterdayDate() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}

function getMonthStartDate() {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  return monthStart
}
