const { LAT, LON } = process.env;

async function getFieldForecast(lat, lon, tilt, az, kwp) {
  const url = `https://api.forecast.solar/estimate/${lat}/${lon}/${tilt}/${az}/${kwp}`;
  const result = await fetch(url);
  if (!result.ok) throw new Error(`${result.status} ${result.statusText}`);
  return result.json();
}

function sumWatts(results) {
  return results.reduce((out, res) => {
    for (const [t, w] of Object.entries(res.result.watt_hours_day)) {
      out[t] = (out[t] || 0) + w;
    }
    return out;
  }, {});
}

function toKW(wattsPerDay) {
  return Object.entries(wattsPerDay).reduce((out, [t, w]) => {
    out[t] = (w / 1000).toFixed(1);
    return out;
  }, {});
}

export async function getForcast() {
  const tilt = 30;
  const results = await Promise.all([
    getFieldForecast(LAT, LON, tilt, 0, 1.32),
    getFieldForecast(LAT, LON, tilt, -90, 1.17),
    getFieldForecast(LAT, LON, tilt, 90, 1.17),
  ]);
  return toKW(sumWatts(results));
}
