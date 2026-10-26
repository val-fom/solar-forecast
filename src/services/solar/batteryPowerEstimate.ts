/**
 * Approximate power flowing into the battery bank on a shared DC bus.
 *
 * Growatt SPF pBat convention: positive is inverter battery discharge,
 * negative is battery charging. External MPPT power feeds the bus,
 * so subtract the inverter's discharge-positive battery power.
 *
 * Positive result = estimated net battery charging;
 * negative result = estimated net battery discharge.
 *
 * This is not a BMS reading: converters, other DC loads and sampling
 * delays are not included. Both values should represent the same DC bus.
 */
export function estimateNetBatteryPowerW(
  externalMpptPowerW: number,
  growattPBatW: number,
): number | undefined {
  if (
    !Number.isFinite(externalMpptPowerW) ||
    externalMpptPowerW < 0 ||
    !Number.isFinite(growattPBatW)
  ) {
    return undefined
  }

  return Math.round((externalMpptPowerW - growattPBatW) * 10) / 10
}
