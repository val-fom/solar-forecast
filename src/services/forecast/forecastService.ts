import config from '../../config'
import { fetchFieldForecast } from '../../integrations/forecast-solar'
import { saveForecastResult } from '../../persistence/dynamo/forecastRepository'
import type { ForecastResult, WattsByHour } from './forecast.types'

const { LAT, LON, SOUTH_ONLY } = config

const southOnly = SOUTH_ONLY === 'true'
const TILT = 30

type ForecastScenario = {
  azimuth: number
  capacityKwp: number
}

const BASE_SCENARIOS: ForecastScenario[] = [
  {
    azimuth: 0,
    capacityKwp: 1.32,
  },
]

const SIDE_SCENARIOS: ForecastScenario[] = [
  { azimuth: -90, capacityKwp: 1.17 },
  { azimuth: 90, capacityKwp: 1.17 },
]

export async function getForecast(): Promise<ForecastResult> {
  const scenarios = southOnly
    ? BASE_SCENARIOS
    : BASE_SCENARIOS.concat(SIDE_SCENARIOS)

  const results = await Promise.all(
    scenarios.map((scenario) =>
      fetchFieldForecast({
        lat: LAT,
        lon: LON,
        tilt: TILT,
        azimuth: scenario.azimuth,
        capacityKwp: scenario.capacityKwp,
      }),
    ),
  )

  const totalForecast: ForecastResult = {
    result: {
      watt_hours_day: sum(results, 'watt_hours_day'),
      watts: sum(results, 'watts'),
      watt_hours_period: sum(results, 'watt_hours_period'),
      watt_hours: sum(results, 'watt_hours'),
    },
    message: findLowestRemaining(results),
  }

  await saveForecastResult(totalForecast)
  return totalForecast
}

function sum(
  results: ForecastResult[],
  key: keyof ForecastResult['result'],
): WattsByHour {
  return results.reduce((out, res) => {
    for (const [time, watts] of Object.entries(res.result[key])) {
      out[time] = (out[time] || 0) + watts
    }
    return out
  }, {} as WattsByHour)
}

function findLowestRemaining(results: ForecastResult[]) {
  return results.reduce((out, res) => {
    if (res.message.ratelimit.remaining < out.ratelimit.remaining) {
      return res.message
    }
    return out
  }, results[0].message)
}
