import { NextRequest, NextResponse } from "next/server";
import type { ApiError, GoogleReviewsImportResponse } from "@/types";
import {
  extractPlaceIdFromMapsText,
  extractPlaceQueryFromPath,
  fetchPlaceReviewsByPlaceId,
  resolveGoogleMapsUrl,
  searchPlaceIdByText,
} from "@/lib/googleMapsReviews";

function getPlacesApiKey(): string | undefined {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    undefined
  );
}

export async function POST(req: NextRequest) {
  const apiKey = getPlacesApiKey();
  if (!apiKey) {
    return NextResponse.json<ApiError>(
      {
        error:
          "Missing Google Places API key. Set GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) in .env.local and enable Places API (New) in Google Cloud.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as { url?: string };
    const rawUrl = body?.url?.trim();
    if (!rawUrl) {
      return NextResponse.json<ApiError>({ error: "URL is required." }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return NextResponse.json<ApiError>({ error: "Please enter a valid URL." }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json<ApiError>({ error: "Only http/https links are supported." }, { status: 400 });
    }

    const host = parsed.hostname.toLowerCase();
    if (!/(^|\.)google\.com$|(^|\.)goo\.gl$|(^|\.)maps\.app\.goo\.gl$/i.test(host)) {
      return NextResponse.json<ApiError>(
        { error: "Use a Google Maps link (maps.google.com, goo.gl, or maps.app.goo.gl)." },
        { status: 400 }
      );
    }

    let resolved = parsed.toString();
    try {
      resolved = await resolveGoogleMapsUrl(parsed.toString());
    } catch {
      /* use original */
    }

    let placeId = extractPlaceIdFromMapsText(resolved);
    const notes: string[] = [];

    if (!placeId) {
      const query = extractPlaceQueryFromPath(resolved);
      if (query) {
        try {
          placeId = await searchPlaceIdByText(query, apiKey);
        } catch (e) {
          return NextResponse.json<ApiError>(
            {
              error:
                "Could not find this place automatically. Open the full Google Maps place page (with the business panel) and copy that URL — it usually contains a place id.",
              details: e instanceof Error ? e.message : String(e),
            },
            { status: 400 }
          );
        }
        if (placeId) {
          notes.push(`Matched “${query}” via Text Search — verify it’s the correct business.`);
        }
      }
    }

    if (!placeId) {
      return NextResponse.json<ApiError>(
        {
          error:
            "Could not detect a Place ID from this link. Try: Share → Copy link from the Google Maps business page, or paste a URL that contains “ChIJ…”.",
        },
        { status: 400 }
      );
    }

    let detail: Awaited<ReturnType<typeof fetchPlaceReviewsByPlaceId>>;
    try {
      detail = await fetchPlaceReviewsByPlaceId(placeId, apiKey);
    } catch (e) {
      return NextResponse.json<ApiError>(
        { error: "Could not load reviews from Google.", details: e instanceof Error ? e.message : String(e) },
        { status: 400 }
      );
    }

    if (detail.reviews.length === 0) {
      notes.push("Google returned no reviews for this listing (new listings or restricted reviews).");
    } else {
      notes.push("Google returns at most five reviews per request via the Places API.");
    }

    const payload: GoogleReviewsImportResponse = {
      reviews: detail.reviews,
      placeName: detail.placeName,
      googleMapsUri: detail.googleMapsUri,
      notes: notes.length ? notes : undefined,
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json<ApiError>(
      { error: "Failed to import Google reviews.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
