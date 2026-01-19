interface EventLog {
  code: string
  event_time: number
  value: string
}

interface EventLogsData {
  has_next: boolean
  logs: EventLog[]
}

export interface AnalysisResult {
  startTime: number
  endTime: number
  trueTimeMs: number
  trueTimeHours: number
  falseTimeMs: number
  falseTimeHours: number
  totalTimeMs: number
  totalTimeHours: number
  truePercentage: number
  falsePercentage: number
}

export function analyzeEventLogs(
  data: EventLogsData,
  fromTo: { start_time: number; end_time: number },
  fallbackValue: string = 'true',
): AnalysisResult {
  const doorsContactLogs = data.logs.filter(
    (log) => log.code === 'doorcontact_state',
  )
  // Sort by event_time ascending (oldest to newest)
  const sorted = [...doorsContactLogs].reverse()

  let trueTimeMs = 0
  let falseTimeMs = 0

  // Calculate duration between state changes
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    const duration = next.event_time - current.event_time

    if (next.value === 'false' && current.value === 'true') {
      trueTimeMs += duration
    } else {
      falseTimeMs += duration
    }
  }

  // Add duration from last event to end time
  if (sorted.length > 0) {
    const lastEvent = sorted.at(-1)!
    const durationToNow = fromTo.end_time - lastEvent.event_time

    if (lastEvent.value === 'true') {
      trueTimeMs += durationToNow
    } else {
      falseTimeMs += durationToNow
    }
  }

  // Add duration from start_time to first event
  if (sorted.length > 0) {
    const firstEvent = sorted[0]
    const durationFromStart = firstEvent.event_time - fromTo.start_time

    if (firstEvent.value === 'true') {
      falseTimeMs += durationFromStart
    } else {
      trueTimeMs += durationFromStart
    }
  } else {
    // If no events, assume entire duration is fallbackValue
    if (fallbackValue === 'true') {
      trueTimeMs += fromTo.end_time - fromTo.start_time
    } else {
      falseTimeMs += fromTo.end_time - fromTo.start_time
    }
  }

  const totalTimeMs = trueTimeMs + falseTimeMs
  const truePercentage = parseFloat(
    ((trueTimeMs / totalTimeMs) * 100).toFixed(2),
  )
  const falsePercentage = parseFloat(
    ((falseTimeMs / totalTimeMs) * 100).toFixed(2),
  )

  return {
    startTime: fromTo.start_time,
    endTime: fromTo.end_time,
    trueTimeMs,
    trueTimeHours: parseFloat((trueTimeMs / 1000 / 60 / 60).toFixed(2)),
    falseTimeMs,
    falseTimeHours: parseFloat((falseTimeMs / 1000 / 60 / 60).toFixed(2)),
    totalTimeMs,
    totalTimeHours: parseFloat((totalTimeMs / 1000 / 60 / 60).toFixed(2)),
    truePercentage,
    falsePercentage,
  }
}

export function formatAnalysisResult(result: AnalysisResult): string {
  return `
Event Log Analysis:
==================
True duration:  ${result.trueTimeHours} hours (${result.trueTimeMs}ms)
False duration: ${result.falseTimeHours} hours (${result.falseTimeMs}ms)
Total duration: ${result.totalTimeHours} hours (${result.totalTimeMs}ms)

Percentage:
True:  ${result.truePercentage}%
False: ${result.falsePercentage}%
  `.trim()
}
