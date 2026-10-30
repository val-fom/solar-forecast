import { getDevicesStats } from '../device-stats/deviceStatsService'
import { getGrowattStats, type GrowattStats } from '../../integrations/growatt'
import type { DevicesStatsResult } from '../device-stats/deviceStats.types'
import { saveGrowattStats } from '../../persistence/dynamo/growattStatsRepository'

export type SolarReport = {
  tuya?: DevicesStatsResult
  growatt?: GrowattStats
  errors: string[]
}

export async function getSolarReport(): Promise<SolarReport> {
  // Let either provider fail independently. A missing provider must never
  // result in a misleading combined total.
  const [tuya, growatt] = await Promise.allSettled([
    getDevicesStats(),
    getGrowattStats(),
  ])
  if (growatt.status === 'fulfilled') {
    try {
      await saveGrowattStats(growatt.value)
    } catch (error) {
      console.error('Growatt stats persistence failed:', error)
    }
  }
  return {
    tuya: tuya.status === 'fulfilled' ? tuya.value : undefined,
    growatt: growatt.status === 'fulfilled' ? growatt.value : undefined,
    errors: [
      ...(tuya.status === 'rejected' ? ['Tuya MPPT unavailable'] : []),
      ...(growatt.status === 'rejected' ? ['Growatt unavailable'] : []),
    ],
  }
}

const fmt = (n: number, digits = 1): string => n.toFixed(digits)

export function formatSolarReport(report: SolarReport): string[] {
  const { tuya, growatt } = report
  const totalPower = tuya && growatt
    ? fmt(tuya.totals.power + growatt.pvPower) + ' W'
    : '—'
  const totalEnergy = tuya && growatt
    ? fmt(tuya.totals.electric_total + growatt.pvTotal) + ' kWh'
    : '—'
  const mpptToday = tuya?.totals.electric_total_diff
  const combinedToday = mpptToday !== undefined && growatt
    ? fmt(mpptToday + growatt.pvToday) + ' kWh'
    : '—'

  const lines = ['☀️ Generation: ' + totalPower]
  if (tuya) {
    // Preserve the configured controller order, including inactive devices.
    const powers = tuya.devicesStats.map((device) => fmt(device.power))
    lines.push('MPPT: ' + fmt(tuya.totals.power) + ' W (' + powers.join(' + ') + ')')
  }
  if (growatt) lines.push('Growatt: ' + fmt(growatt.pvPower) + ' W')

  lines.push('📈 Total: ' + totalEnergy)
  lines.push('📊 Today: ' + combinedToday)

  if (tuya) {
    const daily = tuya.devicesStats.map((device) =>
      device.electric_total_diff === undefined ? '—' : fmt(device.electric_total_diff),
    )
    lines.push(
      'MPPT: ' + (mpptToday === undefined ? '—' : fmt(mpptToday) + ' kWh') +
        ' (' + daily.join(' + ') + ')',
    )
  }
  if (growatt) {
    lines.push('Growatt: ' + fmt(growatt.pvToday) + ' kWh')
    lines.push('🏠 House: ' + fmt(growatt.outputPower) + ' W')
    lines.push('🏠 Today: ' + fmt(growatt.acLoadToday) + ' kWh')
    lines.push('🔌 Grid: ' + fmt(growatt.acInputPower) + ' W')
  }
  if (report.errors.length) lines.push('⚠️ ' + report.errors.join('; '))
  return ['#solar', lines.join('\n')]
}
