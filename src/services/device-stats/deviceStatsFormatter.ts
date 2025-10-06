import type { DeviceStats, DevicesTotals } from './deviceStats.types'
import { getSOC } from './getSOC'

function formatNumber(value: number): string {
  return value.toFixed(1)
}

type FormatDeviceTotalsInput = {
  totals: DevicesTotals
  devices?: DeviceStats[]
  time?: 'morning' | 'evening'
}

export function formatDeviceTotalsMessage({
  totals,
  devices = [],
  time,
}: FormatDeviceTotalsInput): string[] {
  const SOC = Math.floor(getSOC(totals.bat_voltage))
  const SOCIcon = SOC < 0 ? '❌' : SOC < 25 ? '🪫' : '🔋'
  const entries: Array<{
    icon: string
    label: string
    value: number | undefined
    unit: string
  }> = [
    { icon: '⚡', label: 'Current', value: totals.bat_current, unit: 'A' },
    {
      icon: SOCIcon,
      label: 'Voltage',
      value: totals.bat_voltage,
      unit: `V (${SOC}%)`,
    },
    { icon: '🔌', label: 'Power', value: totals.power, unit: 'W' },
    { icon: '📈', label: 'Total', value: totals.electric_total, unit: 'kWh' },
    {
      icon: '📊',
      label: 'Today',
      value: totals.electric_total_diff,
      unit: 'kWh',
    },
  ]
  const dayTimeIcon =
    time === 'morning' ? '🌅' : time === 'evening' ? '🏙️' : null

  const rows = entries.filter((entry) => entry.value !== undefined)

  const lines = rows.map((entry) => {
    const label = entry.label
    const valueText = `${formatNumber(entry.value as number)} ${entry.unit}`
    return `${entry.icon} ${label}: ${valueText}`
  })

  const perDevicePowerLine = devices
    .filter((device) => device.power !== undefined)
    .map((device) => formatNumber(device.power))
    .join(' + ')

  if (perDevicePowerLine.length > 0) {
    const powerIndex = lines.findIndex((line) => line.startsWith('🔌'))
    const insertIndex = powerIndex >= 0 ? powerIndex + 1 : lines.length
    lines.splice(insertIndex, 0, `🔢 (${perDevicePowerLine})`)
  }

  const perDeviceDailyLine = devices
    .filter((device) => device.electric_total_diff !== undefined)
    .map((device) => formatNumber(device.electric_total_diff as number))
    .join(' + ')

  if (perDeviceDailyLine.length > 0) {
    const todayIndex = lines.findIndex((line) => line.startsWith('📊'))
    const insertIndex = todayIndex >= 0 ? todayIndex + 1 : lines.length
    lines.splice(insertIndex, 0, `🔢 (${perDeviceDailyLine})`)
  }

  return [
    ...(dayTimeIcon ? [dayTimeIcon] : []),
    '#mppt_totals',
    lines.join('\n'),
  ]
}
