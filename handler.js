import { getForecast } from "./src/getForcast.js";
import { sendResult } from "./src/sendResult.js";

export async function run() {
  const result = await getForecast();
  await sendResult(result);
}
