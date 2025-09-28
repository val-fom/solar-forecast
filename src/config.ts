const REQUIRED_ENV_VARS = [
  "LAT",
  "LON",
  "TELEGRAM_TOKEN",
  "TELEGRAM_CHAT_ID",
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

type Config = Record<RequiredEnvVar, string>;

function readEnv(name: RequiredEnvVar): string {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return raw.trim();
}

const config: Config = REQUIRED_ENV_VARS.reduce((acc, name) => {
  acc[name] = readEnv(name);
  return acc;
}, {} as Config);

export default config;
