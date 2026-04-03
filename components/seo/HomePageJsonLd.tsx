import {
  MARKETING_BRAND,
  MARKETING_REGION_LABEL,
  MARKETING_SERVICE_CITIES,
  marketingHomeDescription,
} from "@/lib/marketing-seo";
import { appBaseUrl } from "@/lib/seo";

/**
 * WebSite + Organization + ProfessionalService JSON-LD for `/` only.
 * Helps brand + local queries without affecting client site metadata.
 */
export default function HomePageJsonLd() {
  const url = appBaseUrl().replace(/\/$/, "");
  const desc = marketingHomeDescription();

  const cities = MARKETING_SERVICE_CITIES.map((name) => ({
    "@type": "City" as const,
    name,
    containedInPlace: {
      "@type": "State",
      name: "Massachusetts",
    },
  }));

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: MARKETING_BRAND,
        url,
        description: desc,
        inLanguage: "en-US",
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: MARKETING_BRAND,
        url,
        description: desc,
        areaServed: [
          {
            "@type": "AdministrativeArea",
            name: MARKETING_REGION_LABEL,
          },
          ...cities,
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${url}/#localbusiness`,
        name: MARKETING_BRAND,
        url,
        description: desc,
        serviceType: ["Web design", "Website development", "Local SEO", "Small business websites"],
        areaServed: cities,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
