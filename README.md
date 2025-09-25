# Solar Forecast Bot

This project is a Serverless AWS Lambda bot that fetches daily solar power forecasts and sends results to Telegram at scheduled times (Kyiv local time).

## Features

- Fetches solar power forecast from [forecast.solar](https://forecast.solar/)
- Sends results to a Telegram chat using the Telegram Bot API
- Runs automatically at 7:00 and 22:00 Kyiv time (converted to UTC for AWS)

## Environment Variables

Set these environment variables in your deployment environment or in `serverless.yml`:

- `TELEGRAM_TOKEN`: Your Telegram bot token
- `TELEGRAM_CHAT_ID`: The chat ID to send messages to
- `LAT`: Latitude of the solar plant location
- `LON`: Longitude of the solar plant location

Example for local testing:

```bash
TELEGRAM_TOKEN=xxx TELEGRAM_CHAT_ID=yyy LAT=50.00000 LON=30.00000 node index.js
```

## Deployment

Deploy to AWS Lambda using Serverless Framework:

```bash
serverless deploy
```

## Scheduling

The function is scheduled to run at:

- 7:00 Kyiv time (4:00 UTC during DST)
- 22:00 Kyiv time (19:00 UTC during DST)

See `serverless.yml` for the cron expressions.

## References

- [Serverless schedule event docs](https://serverless.com/framework/docs/providers/aws/events/schedule/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [forecast.solar API](https://forecast.solar/)
