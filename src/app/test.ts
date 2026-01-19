import config from '../config'
import { getDevicesProperties, getDoorsContactLog } from '../integrations/tuya'
import {
  analyzeEventLogs,
  formatAnalysisResult,
} from '../utils/analyzeEventLogs'

const { TUYA_DEVICE_ID_TEST } = config

export const test = async () => {
  const devicesProperties = await getDevicesProperties([TUYA_DEVICE_ID_TEST])
  const doorsContactState = devicesProperties
    .find((device) => device.id === TUYA_DEVICE_ID_TEST)
    ?.properties.find((prop) => prop.code === 'doorcontact_state')?.value

  const fromTo = {
    start_time: +getYesterdayDate(),
    end_time: Date.now(),
  }

  const deviceOperationLog = await getDoorsContactLog(
    TUYA_DEVICE_ID_TEST,
    fromTo,
  )

  // Analyze event logs
  const analysis = analyzeEventLogs(
    deviceOperationLog,
    fromTo,
    doorsContactState?.toString(), // Convert to string for analysis
  )
  console.log('\n' + formatAnalysisResult(analysis))

  return deviceOperationLog
}

function getYesterdayDate() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}
