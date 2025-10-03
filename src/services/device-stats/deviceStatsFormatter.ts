import type { DevicesTotals } from './deviceStats.types'

function formatNumber(value: number): string {
  return value.toFixed(1)
}

export function formatDeviceTotalsMessage(totals: DevicesTotals): string {
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
      label: 'Yesterday',
      value: totals.electric_total_yesterday,
      unit: 'kWh',
    },
    { icon: '➕', label: 'Today', value: totals.electric_total_diff, unit: 'kWh' },
  ]

  const rows = entries.filter((entry) => entry.value !== undefined)

  const labelWidth = rows.reduce(
    (max, entry) => Math.max(max, entry.label.length),
    0,
  )
  const valueWidth = rows.reduce((max, entry) => {
    const text = `${formatNumber(entry.value as number)} ${entry.unit}`
    return Math.max(max, text.length)
  }, 0)

  const lines = rows.map((entry) => {
    const label = entry.label.padEnd(labelWidth, ' ')
    const valueText = `${formatNumber(entry.value as number)} ${entry.unit}`
    const paddedValue = valueText.padStart(valueWidth, ' ')
    return `${entry.icon} ${label}: ${paddedValue}`
  })

  return ['#mppt_totals', ...lines].join('\n')
}
