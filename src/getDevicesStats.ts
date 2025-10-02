import { parse } from "path";
import config from "./config";
import { getDevicesProperties } from "./tuya/getDevicesProperties";

const { TUYA_DEVICE_ID } = config;

const devices = TUYA_DEVICE_ID.split(",");

export async function getDevicesStats() {
  const devicesProps = await getDevicesProperties(devices);
  return deriveDeviceStats(devicesProps);
}

function deriveDeviceStats(
  devicesProps: {
    id: string;
    properties: { code: string; value: string }[];
  }[],
) {
  const devicesPropsMap = devicesProps.map((device) => {
    const propsMap = device.properties.reduce((acc, prop) => {
      acc[prop.code] = prop.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      id: device.id,
      pv_voltage: parseInt(propsMap.pv_voltage) / 10,
      bat_voltage: parseInt(propsMap.bat_voltage) / 10,
      bat_current: parseInt(propsMap.bat_current) / 10,
      power: parseInt(propsMap.power) / 10,
      electric_total: parseInt(propsMap.electric_total) / 10,
      temp_current: parseInt(propsMap.temp_current) / 10,
    };
  });

  const devicesTotals = devicesPropsMap.reduce(
    (acc, device) => {
      acc.bat_current += device.bat_current;
      acc.power += device.power;
      acc.electric_total += device.electric_total;

      return acc;
    },
    {
      bat_current: 0,
      power: 0,
      electric_total: 0,
    },
  );

  const result = {
    propsMap: devicesPropsMap,
    totals: devicesTotals,
  };

  return result;
}
