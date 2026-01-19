import config from '../config'
import {
  getDevicesProperties,
  getDeviceOperationLog,
} from '../integrations/tuya'
import {
  analyzeEventLogs,
  formatAnalysisResult,
} from '../utils/analyzeEventLogs'

const { TUYA_GRID_SENSOR_DEVICE_ID } = config

export const test = async () => {
  const devicesProperties = await getDevicesProperties([
    TUYA_GRID_SENSOR_DEVICE_ID,
  ])
  const doorsContactState = devicesProperties
    .find((device) => device.id === TUYA_GRID_SENSOR_DEVICE_ID)
    ?.properties.find((prop) => prop.code === 'doorcontact_state')?.value

  const fromTo = {
    start_time: +getYesterdayDate(),
    end_time: Date.now(),
  }

  const deviceOperationLog = await getDeviceOperationLog(
    TUYA_GRID_SENSOR_DEVICE_ID,
    fromTo,
  )

  // Analyze event logs
  const analysis = analyzeEventLogs(
    deviceOperationLog,
    fromTo,
    doorsContactState?.toString(), // Convert to string for analysis
  )
  console.log('\n' + formatAnalysisResult(analysis))

  return analysis
}

function getYesterdayDate() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}
