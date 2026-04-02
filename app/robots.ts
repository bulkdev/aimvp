import type { MetadataRoute } from "next";
import { appBaseUrl, publicPagesEnabled } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const appUrl = appBaseUrl();
  if (!publicPagesEnabled()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/preview/", "/api/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
