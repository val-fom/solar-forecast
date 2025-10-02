import config from "../config";
import { buildStringToSign } from "./buildStringToSign";
import { sign } from "./sign";

const { TUYA_ACCESS_ID, TUYA_ENDPOINT } = config;

type TuyaRequestOptions = {
  path: string;
  method?: "GET" | "POST";
  accessToken?: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number>;
};

type TuyaResponse<T> = {
  success: boolean;
  result: T;
  code?: number;
  msg?: string;
};

export async function callTuya<T>({
  path,
  method = "GET",
  accessToken,
  body,
  query,
}: TuyaRequestOptions): Promise<T> {
  const t = Date.now().toString();
  const payload = body ? JSON.stringify(body) : "";
  const { fullPath } = buildPath(path, query);
  const stringToSign = buildStringToSign({
    method,
    path: fullPath,
    body: payload,
  });
  const signature = sign({
    t,
    stringToSign,
    accessToken,
  });

  const headers: Record<string, string> = {
    client_id: TUYA_ACCESS_ID,
    sign: signature,
    sign_method: "HMAC-SHA256",
    t,
  };
  if (accessToken) headers.access_token = accessToken;
  if (payload) headers["Content-Type"] = "application/json";

  const response = await fetch(`${TUYA_ENDPOINT}${fullPath}`, {
    method,
    headers,
    body: payload || undefined,
  });

  const data = (await response.json()) as TuyaResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(
      `Tuya request failed for ${fullPath}: status=${response.status} code=${
        data.code ?? "unknown"
      } msg=${data.msg ?? response.statusText}`,
    );
  }

  return data.result;
}

function buildPath(
  path: string,
  query?: Record<string, string | number>,
): {
  fullPath: string;
  search: string;
} {
  if (!query || Object.keys(query).length === 0) {
    return { fullPath: path, search: "" };
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.append(key, String(value));
  }
  const search = params.toString();
  return { fullPath: `${path}?${search}`, search };
}
