import { getDevicesStats } from '../device-stats/deviceStatsService'
import { getGrowattStats, GrowattStats } from '../../integrations/growatt/getGrowattStats'
import type { DevicesStatsResult } from '../device-stats/deviceStats.types'

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
  const lines = ['☀️ SOLAR PRODUCTION']
  if (tuya && growatt) {
    lines.push('⚡ Total: ' + fmt(tuya.totals.power + growatt.pvPower) + ' W')
    if (tuya.totals.electric_total_diff !== undefined) {
      lines.push('📊 Today: ' + fmt(tuya.totals.electric_total_diff + growatt.pvToday) + ' kWh')
    }
  } else {
    lines.push('⚠️ Combined totals unavailable (incomplete sources)')
  }

  if (tuya) {
    lines.push('', '🔆 MakeSkyBlue (' + tuya.devicesStats.length + ')')
    lines.push('Power: ' + fmt(tuya.totals.power) + ' W')
    lines.push('MPPT: ' + tuya.devicesStats.map(d => d.name + ' ' + fmt(d.power)).join(' + ') + ' W')
    lines.push('Total: ' + fmt(tuya.totals.electric_total) + ' kWh')
    if (tuya.totals.electric_total_diff !== undefined) {
      lines.push('Today*: ' + fmt(tuya.totals.electric_total_diff) + ' kWh')
    }
  }

  if (growatt) {
    lines.push('', '🌞 Growatt SPF 6000 ES Plus')
    lines.push('PV: ' + fmt(growatt.pvPower) + ' W (' + fmt(growatt.pv1Power) + ' + ' + fmt(growatt.pv2Power) + ')')
    lines.push('Today: ' + fmt(growatt.pvToday) + ' kWh')
    lines.push('Total: ' + fmt(growatt.pvTotal) + ' kWh')
    lines.push('', '🔋 BATTERY')
    lines.push('SOC: ' + fmt(growatt.batterySoc, 0) + '%')
    lines.push('Voltage: ' + fmt(growatt.batteryVoltage, 2) + ' V')
    lines.push('Power (raw signed): ' + fmt(growatt.batteryPower) + ' W')
    lines.push('Discharged today: ' + fmt(growatt.batteryDischargedToday) + ' kWh')
    lines.push('', '🏠 HOUSE')
    lines.push('Load: ' + fmt(growatt.outputPower) + ' W')
    lines.push('AC consumption today: ' + fmt(growatt.acLoadToday) + ' kWh')
    lines.push('', '🔌 GRID')
    lines.push('AC input: ' + fmt(growatt.acInputPower) + ' W')
    lines.push('AC battery charging today: ' + fmt(growatt.acBatteryChargeToday) + ' kWh')
    lines.push('🌡 Inverter: ' + fmt(growatt.inverterTemperature) + '°C')
    lines.push('🕒 Data: ' + growatt.time + (growatt.lost ? ' ⚠️ lost=true' : ''))
  }
  if (report.errors.length) lines.push('', '⚠️ ' + report.errors.join('; '))
  if (tuya?.totals.electric_total_diff !== undefined) {
    lines.push('* Tuya today is estimated from yesterday\'s last snapshot')
  }
  return ['#solar', lines.join('\n')]
}
