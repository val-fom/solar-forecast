import type { DevicesTotals } from './deviceStats.types'

function formatNumber(value: number): string {
  return value.toFixed(1)
}

export function formatDeviceTotalsMessage(totals: DevicesTotals): string[] {
  const entries: Array<{
    icon: string
    label: string
    value: number | undefined
    unit: string
  }> = [
    { icon: '🔋', label: 'Current', value: totals.bat_current, unit: 'A' },
    { icon: '🔌', label: 'Voltage', value: totals.bat_voltage, unit: 'V' },
    { icon: '⚡', label: 'Power', value: totals.power, unit: 'W' },
    { icon: '📈', label: 'Total', value: totals.electric_total, unit: 'kWh' },
    {
      icon: '📊',
      label: 'Today',
      value: totals.electric_total_diff,
      unit: 'kWh',
    },
  ]

  const rows = entries.filter((entry) => entry.value !== undefined)

  const lines = rows.map((entry) => {
    const label = entry.label
    const valueText = `${formatNumber(entry.value as number)} ${entry.unit}`
    return `${entry.icon} ${label}: ${valueText}`
  })

  return ['#mppt_totals', lines.join('\n')]
}
