export type WattsByHour = Record<string, number>

export type ForecastResult = {
  result: {
    watt_hours_day: WattsByHour
    watts: WattsByHour
    watt_hours_period: WattsByHour
    watt_hours: WattsByHour
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
