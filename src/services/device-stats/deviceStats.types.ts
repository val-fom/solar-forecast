export type DeviceProperty = {
  id: string
  properties: { code: string; value: string; custom_name?: string }[]
}

export type DeviceStats = {
  id: string
  name: string
  pv_voltage: number
  bat_voltage: number
  bat_current: number
  power: number
  electric_total: number
  temp_current: number
  electric_total_yesterday?: number
  electric_total_diff?: number
}

export type DevicesTotals = {
  bat_current: number
  bat_voltage: number
  power: number
  electric_total: number
  electric_total_yesterday?: number
  electric_total_diff?: number
}

export type DevicesStatsResult = {
  devicesStats: DeviceStats[]
  totals: DevicesTotals
}
