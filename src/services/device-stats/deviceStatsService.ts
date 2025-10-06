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
  let stats = deriveDeviceStats(devicesProps)
  const yesterdayStats = await getYesterdaysLastDeviceStats()
  if (yesterdayStats) {
    const yesterdayTotals = yesterdayStats.totals.electric_total
    const totalsDiff =
      yesterdayTotals !== undefined
        ? round(stats.totals.electric_total - yesterdayTotals)
        : undefined
    const yesterdayById = new Map(
      yesterdayStats.devicesStats.map((device) => [
        device.id,
        device.electric_total,
      ]),
    )

    stats = {
      devicesStats: stats.devicesStats.map((device) => {
        const previousTotal = yesterdayById.get(device.id)
        const dailyDelta =
          previousTotal !== undefined
            ? round(device.electric_total - previousTotal)
            : undefined

        return {
          ...device,
          electric_total_yesterday: previousTotal,
          electric_total_diff: dailyDelta,
        }
      }),
      totals: {
        ...stats.totals,
        electric_total_yesterday: yesterdayTotals,
        electric_total_diff: totalsDiff,
      },
    }
  }
  await saveDeviceStatsResult(stats)
  return stats
}

function deriveDeviceStats(devicesProps: DeviceProperty[]): DevicesStatsResult {
  const statsList: DeviceStats[] = devicesProps.map((device) => {
    const propsMap = device.properties.reduce((acc, prop) => {
      acc[prop.code] = prop.value
      return acc
    }, {} as Record<string, string>)

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

  const totals: DevicesTotals = statsList.reduce(
    (acc, device) => {
      acc.bat_current += device.bat_current
      acc.power += device.power
      acc.electric_total += device.electric_total

      return acc
    },
    {
      bat_current: 0,
      bat_voltage: statsList.find((d) => d.bat_voltage)?.bat_voltage || 0,
      electric_total: 0,
      power: 0,
    },
  )

  const roundedTotals: DevicesTotals = {
    bat_current: round(totals.bat_current),
    bat_voltage: round(totals.bat_voltage),
    electric_total: round(totals.electric_total),
    power: round(totals.power),
  }

  return {
    devicesStats: statsList,
    totals: roundedTotals,
  }
}

function round(value: number, decimals: number = 2): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}

function getDeviceName(deviceId: string): string {
  return devicesDictionary[deviceId] || deviceId
}
