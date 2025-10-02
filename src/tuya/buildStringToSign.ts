import { sha256 } from "./sha256";

export function buildStringToSign({
  method,
  path,
  body = "",
}: {
  method: string;
  path: string;
  body?: string;
}): string {
  const upperMethod = method.toUpperCase();
  const contentHash = sha256(body);
  const headers = ""; // no custom signed headers for this request
  return [upperMethod, contentHash, headers, path].join("\n");
}
