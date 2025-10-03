import config from './config'
import { storeForecastResult } from './storeResults'

const { LAT, LON } = config

type WATTS = Record<string, number>

export type ForecastResult = {
  result: {
    watt_hours_day: WATTS
    watts: WATTS
    watt_hours_period: WATTS
    watt_hours: WATTS
  }
  message: {
    code: number
    type: string
    text: string
    info: {
      timezone: string
      time: string
      time_utc: string
    }
    ratelimit: {
      zone: string
      period: number
      limit: number
      remaining: number
    }
  }
}

async function getFieldForecast(
  lat: string,
  lon: string,
  tilt: number,
  az: number,
  kwp: number,
): Promise<ForecastResult> {
  const url = `https://api.forecast.solar/estimate/${lat}/${lon}/${tilt}/${az}/${kwp}`
  const result = await fetch(url)
  if (!result.ok) throw new Error(`${result.status} ${result.statusText}`)
  return result.json()
}

function sum(
  results: ForecastResult[],
  key: keyof ForecastResult['result'],
): WATTS {
  return results.reduce((out, res) => {
    for (const [t, w] of Object.entries(res.result[key])) {
      out[t] = (out[t] || 0) + w
    }
    return out
  }, {} as WATTS)
}

function toKW(wattsPerDay: WATTS): Record<string, string> {
  return Object.entries(wattsPerDay).reduce((out, [t, w]) => {
    out[t] = (w / 1000).toFixed(1)
    return out
  }, {} as Record<string, string>)
}

export async function getForecast(): Promise<ForecastResult> {
  const tilt = 30
  const results = await Promise.all([
    getFieldForecast(LAT, LON, tilt, 0, 1.32),
    getFieldForecast(LAT, LON, tilt, -90, 1.17),
    getFieldForecast(LAT, LON, tilt, 90, 1.17),
  ])

  const totalForecast: ForecastResult = {
    result: {
      watt_hours_day: sum(results, 'watt_hours_day'),
      watts: sum(results, 'watts'),
      watt_hours_period: sum(results, 'watt_hours_period'),
      watt_hours: sum(results, 'watt_hours'),
    },
    message: findLowestRemaining(results),
  }

  await storeForecastResult(totalForecast)
  return totalForecast
}

function findLowestRemaining(results: ForecastResult[]) {
  return results.reduce((out, res) => {
    if (res.message.ratelimit.remaining < out.ratelimit.remaining) {
      return res.message
    }
    return out
  }, results[0].message)
}
