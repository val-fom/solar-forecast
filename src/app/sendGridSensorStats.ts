import config from '../config'
import {
  getDevicesProperties,
  getDeviceOperationLog,
} from '../integrations/tuya'
import { DeviceProperty } from '../services/device-stats/deviceStats.types'
import {
  analyzeEventLogs,
  formatAnalysisResult,
} from '../services/device-stats/analyzeEventLogs'
import { sendResult } from '../integrations/telegram'

const { TUYA_GRID_SENSOR_DEVICE_ID } = config

export const sendGridSensorStats = async () => {
  const devicesProperties = await getDevicesProperties([
    TUYA_GRID_SENSOR_DEVICE_ID,
  ])
  const doorsContactState = getDoorsContactState(devicesProperties)

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
    doorsContactState,
  )

  sendResult(
    `📊 Grid Sensor Stats for ${new Date(fromTo.start_time).toDateString()}`,
    formatAnalysisResult(analysis),
  )

  return analysis
}

function getDoorsContactState(devicesProperties: DeviceProperty[]) {
  const doorsContactState = devicesProperties
    .find((device) => device.id === TUYA_GRID_SENSOR_DEVICE_ID)
    ?.properties.find((prop) => prop.code === 'doorcontact_state')?.value

  return doorsContactState?.toString() as 'true' | 'false' | undefined
}

function getYesterdayDate() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}
