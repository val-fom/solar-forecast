export type DeviceProperty = {
  id: string
  properties: { code: string; value: string }[]
}

export type DeviceStats = {
  id: string
  pv_voltage: number
  bat_voltage: number
  bat_current: number
  power: number
  electric_total: number
  temp_current: number
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
