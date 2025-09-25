const { TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env;

export async function sendResult(text) {
  console.log("text: ", text);
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(
    text
  )}`;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}
