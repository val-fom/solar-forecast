# MCP POC Plan - Forecast

Proof of Concept for running **forecast logic** as a Model Context Protocol server.

## Problem

`getForecast()` loads config + fetches + saves to DB. Can't use for MCP (no DB needed).

## Solution

Split into two functions:

### 1. `fetchAndAggregateForecast(lat, lon, southOnly)`

Pure fetch/aggregate logic. No DB. No config.

- Used by: MCP, tests, CLI

### 2. `getForecast()`

Wrapper: load config → `fetchAndAggregateForecast()` → save to DB

- Backward compatible (no Lambda changes)

## Steps

1. **Extract in `forecastService.ts`**
   - Move fetch/aggregate into `fetchAndAggregateForecast()`
   - Refactor `getForecast()` to wrap it

2. **Create MCP server** `src/mcp/forecast-server.ts` (minimal POC)
   - Call `fetchAndAggregateForecast()` with env vars
   - Expose single tool: `get_forecast`
   - Expose single resource: `forecast://today`
   - Future: More tools can be added (device stats, uptime, etc.)

3. **Update `package.json`**
   - Add: `tsx`, `@modelcontextprotocol/sdk`, `dotenv`
   - Add scripts: `mcp:server`, `mcp:inspect`

## Config

| Scenario | Needs                           |
| -------- | ------------------------------- |
| Lambda   | LAT, LON, SOUTH_ONLY, DB tables |
| MCP      | LAT, LON                        |

## Wins

✅ MCP works without DB config
✅ Pure logic testable  
✅ Lambda unchanged  
✅ Reusable everywhere
