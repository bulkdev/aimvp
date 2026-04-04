/**
 * Resolve Google Maps links to Place IDs and fetch reviews via Places API (New).
 * HTML scraping is unreliable; this uses the official API (requires GOOGLE_PLACES_API_KEY).
 *
 * **Reviews cap:** Place Details returns at most {@link GOOGLE_PLACES_MAX_REVIEWS_PER_REQUEST} reviews.
 * Google does not document pagination, cursors, or “next batch” for reviews on this endpoint—repeat
 * calls return the same subset. More reviews require manual entry in the admin UI or a different
 * product (e.g. Google Business Profile API for verified owners, with OAuth).
 */
export const GOOGLE_PLACES_MAX_REVIEWS_PER_REQUEST = 5;

const PLACE_ID_REGEX = /(ChIJ[A-Za-z0-9_-]{10,})/;

export type ImportedManualReview = {
  reviewerName: string;
  rating: number;
  text: string;
  reviewUrl?: string;
  reviewAge?: string;
  avatarLetter?: string;
};

/** Follow redirects (goo.gl, maps.app.goo.gl) and return the final URL string. */
export async function resolveGoogleMapsUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    return res.url;
  } finally {
    clearTimeout(t);
  }
}

export function extractPlaceIdFromMapsText(text: string): string | null {
  const m = text.match(PLACE_ID_REGEX);
  return m?.[1] ?? null;
}

/** Decode slug from /maps/place/Name+Here/... for Text Search fallback. */
export function extractPlaceQueryFromPath(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    const m = u.pathname.match(/\/maps\/place\/([^/]+)/i);
    if (!m?.[1]) return null;
    return decodeURIComponent(m[1].replace(/\+/g, " ")).trim() || null;
  } catch {
    return null;
  }
}

type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: { displayName?: string; uri?: string };
};

type PlaceDetailsJson = {
  id?: string;
  displayName?: { text?: string };
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

function mapReview(r: PlacesReview, fallbackMapsUri: string): ImportedManualReview {
  const name = r.authorAttribution?.displayName?.trim() || "Google user";
  const text = r.text?.text?.trim() || "";
  const rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
  const uri = r.authorAttribution?.uri?.trim();
  return {
    reviewerName: name,
    rating,
    text,
    reviewUrl: uri || fallbackMapsUri || undefined,
    reviewAge: r.relativePublishTimeDescription?.trim() || undefined,
    avatarLetter: name.charAt(0).toUpperCase(),
  };
}

/** GET Place Details (New). Returns up to {@link GOOGLE_PLACES_MAX_REVIEWS_PER_REQUEST} reviews; no pagination. */
export async function fetchPlaceReviewsByPlaceId(
  placeId: string,
  apiKey: string
): Promise<{ placeName: string; googleMapsUri: string; reviews: ImportedManualReview[] }> {
  const encoded = encodeURIComponent(placeId);
  const url = `https://places.googleapis.com/v1/places/${encoded}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,googleMapsUri,reviews",
    },
  });
  const raw = (await res.json()) as PlaceDetailsJson & { error?: { message?: string; status?: string } };
  if (!res.ok) {
    const msg = raw.error?.message || res.statusText || "Place Details failed";
    throw new Error(msg);
  }
  const mapsUri = raw.googleMapsUri?.trim() || `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
  const label = raw.displayName?.text?.trim() || "Business";
  const list = (raw.reviews || []).map((r) => mapReview(r, mapsUri));
  return { placeName: label, googleMapsUri: mapsUri, reviews: list };
}

/** Text Search (New) — first result’s place id. */
export async function searchPlaceIdByText(query: string, apiKey: string): Promise<string | null> {
  const q = query.trim();
  if (!q) return null;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: q, maxResultCount: 1 }),
  });
  const raw = (await res.json()) as {
    places?: { id?: string; name?: string }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(raw.error?.message || "Text search failed");
  }
  const p = raw.places?.[0];
  const id = p?.id?.trim() || p?.name?.replace(/^places\//, "").trim();
  return id || null;
}
