/** Parse a data URL into raw bytes for HTTP responses. */
export function parseDataUrlToBuffer(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const trimmed = dataUrl.trim();
  const m = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
  if (!m) return null;
  try {
    const buffer = Buffer.from(m[2], "base64");
    return { mime: m[1].trim(), buffer };
  } catch {
    return null;
  }
}
