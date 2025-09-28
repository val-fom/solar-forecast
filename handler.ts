import { getForecast } from "./src/getForecast";
import { sendResult } from "./src/sendResult";

export async function run(): Promise<void> {
  const result = await getForecast();
  await sendResult(result);
}
