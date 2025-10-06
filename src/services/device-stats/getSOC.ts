export function getSOC(voltage: number, seriesCount = 4): number {
  // Reference table for one LiFePO₄ battery (12V nominal)
  const table = [
    { soc: 0, voltage: 12.0 },
    { soc: 25, voltage: 13.1 },
    { soc: 50, voltage: 13.18 },
    { soc: 75, voltage: 13.32 },
    { soc: 100, voltage: 13.4 },
  ]

  // Scale the table voltage according to the number of elements in series
  const scaledTable = table.map((t) => ({
    soc: t.soc,
    voltage: t.voltage * seriesCount,
  }))

  // If voltage is lower than minimum
  if (voltage <= scaledTable[0].voltage) return -1
  // If voltage is higher than maximum
  if (voltage >= scaledTable[scaledTable.length - 1].voltage) return 100

  // Linear interpolation between points
  for (let i = 0; i < scaledTable.length - 1; i++) {
    const v1 = scaledTable[i].voltage
    const v2 = scaledTable[i + 1].voltage
    if (voltage >= v1 && voltage <= v2) {
      const ratio = (voltage - v1) / (v2 - v1)
      return (
        scaledTable[i].soc +
        ratio * (scaledTable[i + 1].soc - scaledTable[i].soc)
      )
    }
  }
  // If voltage is not within any range, return -1
  return -1
}
