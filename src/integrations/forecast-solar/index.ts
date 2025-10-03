import type { ForecastResult } from '../../services/forecast/forecast.types'

type ForecastRequest = {
  lat: string
  lon: string
  tilt: number
  azimuth: number
  capacityKwp: number
}

export async function fetchFieldForecast({
  lat,
  lon,
  tilt,
  azimuth,
  capacityKwp,
}: ForecastRequest): Promise<ForecastResult> {
  const url = `https://api.forecast.solar/estimate/${lat}/${lon}/${tilt}/${azimuth}/${capacityKwp}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json()
}
