import config from "./config";

const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = config;

export async function sendResult(text: any): Promise<any> {
  if (typeof text !== "string") {
    text = JSON.stringify(text, null, 2);
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(
    text
  )}`;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}
