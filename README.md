# Solar Forecast Bot

Serverless (AWS Lambda) automation that pulls a daily production forecast, live MPPT statistics, and grid-sensor uptime, then relays neatly formatted updates to Telegram twice per day. A lightweight HTTPS endpoint also listens for `/manual_run` to run the full workflow, `/mppt_totals` to fetch the latest MPPT totals on demand, and `/uptime` to report grid availability.

## Daily Flow

- **Forecast** data comes from [forecast.solar](https://forecast.solar/); multiple field orientations are aggregated when both east/west strings are active.
- **Device statistics** are fetched from Tuya-powered MPPT controllers and summarised (current, voltage, state-of-charge estimate, instantaneous power, daily totals, and deltas).
- **Uptime stats** are calculated from Tuya operation logs for the grid sensor's door-contact signal to determine online/offline time.
- **Storage**: each run persists forecast snapshots and MPPT stats to DynamoDB tables for historical comparison.
- **Delivery**: the results are formatted into emoji-friendly blocks and posted to the configured Telegram chat.
- **Schedules**: CloudWatch cron triggers fire the `morning` Lambda at 04:00 UTC (07:00 Kyiv), the `evening` Lambda at 19:00 UTC (22:00 Kyiv), and `uptimeStats` at 19:00 UTC (22:00 Kyiv).

### Telegram Output Examples

```text
#forecast
📅 2025-10-03: 2.3 kWh
📅 2025-10-04: 2.3 kWh
🔄 Req/h left: 3
(#south_only)
```

```text
#mppt_totals
⚡ Current: 2.5 A
🔋 Voltage: 52.9 V (62%)
🔌 Power: 147.5 W
🔢 (53.5 + 43.1 + 47.7 + 3.2)
📈 Total: 2120.6 kWh
📊 Today: 4.6 kWh
🔢 (1.6 + 1.6 + 1.4 + 0.0)
```

```text
#uptime
⚡ Power Status Report

Duration: 24 hours

🟢 Online:  22 hours (91.67%)
🔴 Offline: 2 hours (8.33%)
```

> ℹ️ The SOC data is a voltage-derived estimate tuned for a 4S LiFePO₄ pack. If the measured voltage drops below the reference table the bot falls back to `❌ SOC: -1 %` to signal the value is unreliable.

## Project Structure

```text
src/
  app/                # Lambda orchestration + manual webhook handler
  config/             # Environment variable loader
  integrations/       # External API clients (forecast.solar, Telegram, Tuya)
  persistence/        # DynamoDB repositories
  services/           # Domain logic: forecast + device stats, formatters, types
handler.ts            # Lambda exports (scheduled + manual HTTP endpoint proxies)
serverless.yml        # Infrastructure definition (cron + manual-run API)
```

## Configuration

| Variable                                | Description                                                                                                      |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_TOKEN`                        | Bot token issued by BotFather.                                                                                   |
| `TELEGRAM_CHAT_ID`                      | Numeric chat ID that receives messages.                                                                          |
| `LAT` / `LON`                           | Plant coordinates sent to forecast.solar.                                                                        |
| `SOUTH_ONLY`                            | Set to `'true'` to fetch only south-facing string data (disables east/west strings) and reduce API request usage |
| `FORECAST_TABLE_NAME`                   | Injected by Serverless; no manual change required.                                                               |
| `DEVICE_STATS_TABLE_NAME`               | Injected by Serverless.                                                                                          |
| `TUYA_ACCESS_ID` / `TUYA_ACCESS_SECRET` | Tuya cloud credentials.                                                                                          |
| `TUYA_DEVICE_ID`                        | Comma-separated Tuya device IDs.                                                                                 |
| `TUYA_GRID_SENSOR_DEVICE_ID`            | Tuya device ID for the grid sensor used by uptime reporting.                                                     |
| `TUYA_ENDPOINT`                         | Tuya API base URL.                                                                                               |

Populate these values in your shell (for local runs) or provide them to the Serverless deployment environment (e.g. via `.env` + `aws-vault`, CI secrets, or AWS Parameter Store).

## Running Locally

```bash
sls invoke local -f <morning|evening|manualRun --path payload.json>
```

```json
// payload.json
{
  "body": "{\"message\":{\"chat\":{\"id\":<TELEGRAM_CHAT_ID>},\"text\":\"/mppt_totals\"}}"
}
```

The local run will send real Telegram messages; ensure you point to a test chat before experimenting.

## Deploying

1. Install the Serverless CLI and configure AWS credentials with rights to deploy Lambda, API Gateway, and DynamoDB tables.
2. Ensure the required environment variables are available to `serverless deploy` (for example, by exporting them in your shell or using a `.env` file consumed by your tooling).
3. Deploy:

   ```bash
   serverless deploy
   ```

4. Copy the API Gateway URL emitted for the `manualRun` function (e.g. `https://xxxx.execute-api.eu-central-1.amazonaws.com/dev/manual-run`).
5. Register the Telegram webhook so `/manual_run` commands reach the manual endpoint:

   ```bash
   curl --request POST \
     --url https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook \
     --header 'content-type: application/json' \
     --data '{"url":"https://xxxx.execute-api.eu-central-1.amazonaws.com/dev/manual-run"}'
   ```

6. In Telegram, message `/manual_run` (full forecast + device stats), `/mppt_totals` (device totals only), and `/uptime` (grid uptime) to confirm the webhook works as expected.
7. Optionally, add both commands to your bot's command list using BotFather:
   - Open a chat with [BotFather](https://t.me/botfather) in Telegram.
   - Send `/mybots`, select your bot, then choose "Edit Commands".
   - Add `/manual_run - Trigger an immediate update`, `/mppt_totals - Fetch the latest device totals`, and `/uptime - Report grid uptime`.

## Useful References

- [Serverless schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [forecast.solar API](https://forecast.solar/)
