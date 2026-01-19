import config from '../config'
import { getDevicesProperties, getOperationLog } from '../integrations/tuya'
import {
  analyzeEventLogs,
  formatAnalysisResult,
} from '../utils/analyzeEventLogs'

const { TUYA_DEVICE_ID_TEST } = config

export const test = async () => {
  const fromTo = {
    start_time: +getYesterdayDate(),
    end_time: Date.now(),
  }
  const deviceOperationLog = await getOperationLog(TUYA_DEVICE_ID_TEST, fromTo)

  // Analyze event logs
  const analysis = analyzeEventLogs(deviceOperationLog, fromTo)
  console.log('\n' + formatAnalysisResult(analysis))

  return deviceOperationLog
}

function getYesterdayDate() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}
