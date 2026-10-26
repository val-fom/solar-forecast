import config from '../../config'
import { getDevicesProperties } from '../../integrations/tuya'
import { saveDeviceStatsResult } from '../../persistence/dynamo/deviceStatsRepository'
import type {
  DeviceProperty,
  DevicesStatsResult,
  DeviceStats,
  DevicesTotals,
} from './deviceStats.types'
import { getYesterdaysLastDeviceStats } from './deviceStatsHistory'

const { TUYA_DEVICE_ID } = config

const devicesDictionary: Record<string, string> = Object.fromEntries(
  TUYA_DEVICE_ID.split(',').map((pair) => {
    const [name, id] = pair.split(':')
    return [id, name]
  }),
)

const devices = Object.keys(devicesDictionary)

export async function getDevicesStats(): Promise<DevicesStatsResult> {
  const devicesProps = await getDevicesProperties(devices)
  const baseStats = deriveDeviceStats(devicesProps)
  const yesterdayStats = await getYesterdaysLastDeviceStats()

  const enrichedStats = yesterdayStats
    ? enrichWithYesterdayData(baseStats, yesterdayStats)
    : baseStats

  await saveDeviceStatsResult(enrichedStats)
  return enrichedStats
}

function enrichWithYesterdayData(
  baseStats: DevicesStatsResult,
  yesterdayStats: DevicesStatsResult,
): DevicesStatsResult {
  const yesterdayById = new Map(
    yesterdayStats.devicesStats.map((device) => [
      device.id,
      device.electric_total,
    ]),
  )

  // Compare by stable device ID, never by sum of the old device set.
  // Otherwise retiring MPPT #4 makes the daily delta incorrectly negative.
  const devicesStats = baseStats.devicesStats.map((device) => {
    const previousTotal = yesterdayById.get(device.id)
    // If the controller has reset/replaced its lifetime counter, do not
    // report a negative amount of energy as today's production.
    const dailyDelta =
      previousTotal !== undefined &&
      device.electric_total >= previousTotal
        ? round(device.electric_total - previousTotal)
        : undefined

    return {
      ...device,
      electric_total_yesterday: previousTotal,
      electric_total_diff: dailyDelta,
    }
  })

  const allHaveBaseline = devicesStats.every(
    (device) => device.electric_total_diff !== undefined,
  )
  const baselineTotal = allHaveBaseline
    ? round(
        devicesStats.reduce(
          (sum, device) => sum + (device.electric_total_yesterday ?? 0),
          0,
        ),
      )
    : undefined
  const dailyTotal = allHaveBaseline
    ? round(
        devicesStats.reduce(
          (sum, device) => sum + (device.electric_total_diff ?? 0),
          0,
        ),
      )
    : undefined

  return {
    devicesStats,
    totals: {
      ...baseStats.totals,
      // This baseline includes only currently active MPPTs.
      electric_total_yesterday: baselineTotal,
      electric_total_diff: dailyTotal,
    },
  }
}

function deriveDeviceStats(devicesProps: DeviceProperty[]): DevicesStatsResult {
  const statsList: DeviceStats[] = devicesProps.map((device) => {
    const propsMap = Object.fromEntries(
      device.properties.map((prop) => [prop.code, prop.value]),
    )

    return {
      id: device.id,
      name: getDeviceName(device.id),
      bat_current: parseInt(propsMap.bat_current, 10) / 10,
      bat_voltage: parseInt(propsMap.bat_voltage, 10) / 10,
      electric_total: parseInt(propsMap.electric_total, 10) / 10,
      power: parseInt(propsMap.power, 10) / 10,
      pv_voltage: parseInt(propsMap.pv_voltage, 10) / 10,
      temp_current: parseInt(propsMap.temp_current, 10) / 10,
    }
  })

  const totals: DevicesTotals = {
    bat_current: round(
      statsList.reduce((sum, device) => sum + device.bat_current, 0),
    ),
    bat_voltage: round(statsList.find((d) => d.bat_voltage)?.bat_voltage || 0),
    electric_total: round(
      statsList.reduce((sum, device) => sum + device.electric_total, 0),
    ),
    power: round(statsList.reduce((sum, device) => sum + device.power, 0)),
  }

  return {
    devicesStats: statsList,
    totals,
  }
}

function round(value: number, decimals: number = 2): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}

function getDeviceName(deviceId: string): string {
  return devicesDictionary[deviceId] || deviceId
}
