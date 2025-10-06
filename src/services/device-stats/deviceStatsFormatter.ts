import type { DevicesTotals } from './deviceStats.types'
import { getSOC } from './getSOC'

function formatNumber(value: number): string {
  return value.toFixed(1)
}

export function formatDeviceTotalsMessage(
  totals: DevicesTotals,
  time?: 'morning' | 'evening',
): string[] {
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
      label: 'V',
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

  return [
    ...(dayTimeIcon ? [dayTimeIcon] : []),
    '#mppt_totals',
    lines.join('\n'),
  ]
}
