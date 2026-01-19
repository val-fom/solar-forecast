import config from '../config'
import { getDevicesProperties } from '../integrations/tuya'

const { TUYA_DEVICE_ID_TEST } = config

export const test = async () => {
  const devicesProps = await getDevicesProperties([TUYA_DEVICE_ID_TEST])
  console.log(JSON.stringify(devicesProps, null, 2))
  return devicesProps
}
