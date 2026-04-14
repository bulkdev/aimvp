export function normalizeCustomDomain(input: string): string {
  const raw = input.trim().toLowerCase();
  if (!raw) return "";
  let host = raw;
  try {
    host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase();
  } catch {
    host = raw.replace(/^https?:\/\//, "").split("/")[0] || "";
  }
  host = host.replace(/\.+$/, "").replace(/^www\./, "");
  return host;
}

export function parseRequestHost(input: string): string {
  return normalizeCustomDomain(input.split(",")[0]?.split(":")[0] || "");
}

export function isAppHost(host: string): boolean {
  const h = normalizeCustomDomain(host);
  if (!h) return true;
  if (h === "localhost" || h === "127.0.0.1") return true;
  const appHost = normalizeCustomDomain(process.env.NEXT_PUBLIC_APP_URL || "");
  return Boolean(appHost && h === appHost);
}
