import { getForecast } from "./src/getForecast";
import { sendResult } from "./src/sendResult";
import { getDevicesStats } from "./src/getDevicesStats";

export async function run(): Promise<void> {
  await sendResult("#forecast", await getForecast());
  await sendResult("#mppt_totals", (await getDevicesStats()).totals);
}
