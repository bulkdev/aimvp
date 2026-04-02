# SEO Launch Checklist

Use this before enabling indexing on published pages.

## Environment

- Set `NEXT_PUBLIC_APP_URL` to production domain (no localhost).
- Set `NEXT_PUBLIC_ENABLE_PUBLIC_PAGES=true` only when ready.
- Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Optional: set `NEXT_PUBLIC_GA_ID` for pageview/lead tracking.

## Crawl and Indexing

- Confirm `robots.txt` disallows `/admin/`, `/preview/`, `/api/`.
- Confirm `sitemap.xml` includes published routes:
  - `/site/[id]`
  - `/site/[id]/services/[service]`
  - `/site/[id]/areas/[area]`
- Ensure preview/admin pages are `noindex`.

## Metadata

- Every indexable route has:
  - unique title
  - unique description
  - canonical URL
  - Open Graph + Twitter tags

## Structured Data

- Validate JSON-LD for:
  - `LocalBusiness` / `Plumber`
  - `FAQPage`
  - `WebSite`
  - `Service` catalog
  - `AggregateRating`/`Review` only when data exists

## Local SEO Content

- NAP is consistent across UI and schema.
- Service areas are configured.
- Internal links between services and areas exist.
- Core service pages have unique intro copy.

## Measurement

- Verify `page_view` events fire.
- Verify lead submit events fire:
  - `hero_quote`
  - `contact`

## Automated Safety Check

- Call `GET /api/seo-audit` and resolve warnings before launch.
