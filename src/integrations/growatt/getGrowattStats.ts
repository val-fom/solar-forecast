import { fetchWithTimeout } from '../../utils/fetchWithTimeout'

const GROWATT_LAST_DATA_URL =
  'https://openapi.growatt.com/v4/new-api/queryLastData'

export type GrowattStats = {
  time: string
  lost: boolean
  pv1Power: number
  pv2Power: number
  pvPower: number
  pvToday: number
  pvTotal: number
  batterySoc: number
  batteryVoltage: number
  batteryPower: number
  batteryDischargedToday: number
  outputPower: number
  acLoadToday: number
  acInputPower: number
  acBatteryChargeToday: number
  inverterTemperature: number
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Unexpected Growatt API response shape')
  }
  return value as Record<string, unknown>
}

function numberField(data: Record<string, unknown>, field: string): number {
  const raw = data[field]
  if (raw === undefined || raw === null || raw === '') {
    throw new Error('Missing Growatt field: ' + field)
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    throw new Error('Invalid Growatt field: ' + field)
  }
  return value
}

// A pure parser makes it possible to test against saved API responses
// without exposing the private API token or contacting Growatt.
export function parseGrowattResponse(
  payload: unknown,
  deviceSn: string,
): GrowattStats {
  const response = asObject(payload)
  if (Number(response.code) !== 0) {
    throw new Error('Growatt API returned code ' + String(response.code))
  }

  const data = asObject(response.data)
  if (!Array.isArray(data.storage)) {
    throw new Error('Growatt API did not return storage data')
  }

  const match = data.storage.find((value: unknown) => {
    const item = asObject(value)
    return item.serialNum === deviceSn
  })
  if (!match) {
    throw new Error('Growatt API did not return the configured device')
  }
  const item = asObject(match)

  return {
    time: String(item.time || ''),
    lost: item.lost === true || item.lost === 'true',
    // For SPF storage responses ppv is PV1 and ppv2 is PV2.
    pv1Power: numberField(item, 'ppv'),
    pv2Power: numberField(item, 'ppv2'),
    pvPower: numberField(item, 'ppv') + numberField(item, 'ppv2'),
    // epvToday / epvTotal are combined PV1+PV2 counters.
    pvToday: numberField(item, 'epvToday'),
    pvTotal: numberField(item, 'epvTotal'),
    batterySoc: numberField(item, 'capacity'),
    batteryVoltage: numberField(item, 'vBat'),
    // Retain Growatt's signed value; do not infer direction here.
    batteryPower: numberField(item, 'pBat'),
    batteryDischargedToday: numberField(item, 'eBatDisChargeToday'),
    outputPower: numberField(item, 'outPutPower'),
    // Matches ShinePhone's load-consumption daily counter for this SPF.
    acLoadToday: numberField(item, 'eacDisChargeToday'),
    acInputPower: numberField(item, 'pAcInPut'),
    // AC charging is not the same as total grid import.
    acBatteryChargeToday: numberField(item, 'eacChargeToday'),
    inverterTemperature: numberField(item, 'invTemperature'),
  }
}

export async function getGrowattStats(): Promise<GrowattStats> {
  const token = process.env.GROWATT_API_TOKEN?.trim()
  const deviceSn = process.env.GROWATT_DEVICE_SN?.trim()
  if (!token || !deviceSn) {
    throw new Error('Growatt credentials are not configured')
  }

  const response = await fetchWithTimeout(
    GROWATT_LAST_DATA_URL,
    {
      method: 'POST',
      headers: {
        token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        deviceType: 'storage',
        deviceSn,
      }).toString(),
    },
    10_000,
  )

  if (!response.ok) {
    throw new Error('Growatt API HTTP status ' + response.status)
  }
  return parseGrowattResponse(await response.json(), deviceSn)
}
