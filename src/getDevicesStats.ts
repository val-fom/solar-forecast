import { parse } from 'path'
import config from './config'
import { getDevicesProperties } from './tuya/getDevicesProperties'

const { TUYA_DEVICE_ID } = config

const devices = TUYA_DEVICE_ID.split(',')

type DeviceProperty = {
  id: string
  properties: { code: string; value: string }[]
}

type DeviceStats = {
  id: string
  pv_voltage: number
  bat_voltage: number
  bat_current: number
  power: number
  electric_total: number
  temp_current: number
}

type DevicesTotals = {
  bat_current: number
  bat_voltage: number
  power: number
  electric_total: number
}

export async function getDevicesStats() {
  const devicesProps = await getDevicesProperties(devices)
  return deriveDeviceStats(devicesProps)
}

function deriveDeviceStats(devicesProps: DeviceProperty[]) {
  const statsList: DeviceStats[] = devicesProps.map((device) => {
    const propsMap = device.properties.reduce(
      (acc, prop) => {
        acc[prop.code] = prop.value
        return acc
      },
      {} as Record<string, string>,
    )

    return {
      id: device.id,
      bat_current: parseInt(propsMap.bat_current) / 10,
      bat_voltage: parseInt(propsMap.bat_voltage) / 10,
      electric_total: parseInt(propsMap.electric_total) / 10,
      power: parseInt(propsMap.power) / 10,
      pv_voltage: parseInt(propsMap.pv_voltage) / 10,
      temp_current: parseInt(propsMap.temp_current) / 10,
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
