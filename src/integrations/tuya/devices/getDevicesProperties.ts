import { callTuya } from './callTuya'
import { getTuyaToken } from '../auth/getTuyaToken'
import type { DeviceProperty } from '../../../services/device-stats/deviceStats.types'

type QueryPropertiesResponse = {
  properties: Property[]
}

type Property = {
  code: string
  custom_name: string
  dp_id: number
  time: number
  type: string
  value: string
}

export async function getDevicesProperties(
  devices: string[],
): Promise<DeviceProperty[]> {
  const { access_token } = await getTuyaToken()

  const devicesStats = await Promise.all(
    devices.map((deviceId) =>
      getSingleDeviceProperties(deviceId, access_token),
    ),
  )

  return devicesStats.map((res, index) => ({
    id: devices[index],
    properties: res.properties,
  }))
}

async function getSingleDeviceProperties(
  deviceId: string,
  access_token?: string,
) {
  return callTuya<QueryPropertiesResponse>({
    path: `/v2.0/cloud/thing/${deviceId}/shadow/properties`,
    accessToken: access_token,
  })
}
