import { getForcast } from "./src/getForcast.js";
import { sendResult } from "./src/sendResult.js";

export async function run() {
  const result = await getForcast();
  await sendResult(JSON.stringify(result, null, 2));
}
