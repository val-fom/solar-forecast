import config from '../config'
import { getDevicesProperties, getOperationLog } from '../integrations/tuya'

const { TUYA_DEVICE_ID_TEST } = config

export const test = async () => {
  const deviceOperationLog = await getOperationLog(TUYA_DEVICE_ID_TEST, {
    start_time: +getMonthStartDate(),
    end_time: Date.now(),
    query_type: 1,
    size: 100, // max 100
    type: '7',
  })
  console.log(JSON.stringify(deviceOperationLog, null, 2))
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
