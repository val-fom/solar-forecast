import config from "../config";
import { callTuya } from "./callTuya.js";
import { getTuyaToken } from "./getTuyaToken.js";

const { TUYA_DEVICE_ID } = config;

type TuyaDevice = {
  id: string;
  name: string;
  category: string;
};

type DeviceListResult = TuyaDevice[];

export async function getTotalEnergy(): Promise<DeviceListResult[]> {
  const { access_token } = await getTuyaToken();

  const devicesStats = await Promise.all(
    TUYA_DEVICE_ID.split(",").map((deviceId) =>
      callTuya<DeviceListResult>({
        path: `/v2.0/cloud/thing/${deviceId}/shadow/properties`,
        accessToken: access_token,
      }),
    ),
  );

  return devicesStats;
}
