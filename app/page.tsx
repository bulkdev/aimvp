import type { Metadata } from "next";
import LandingHome from "@/components/marketing/LandingHome";
import HomePageJsonLd from "@/components/seo/HomePageJsonLd";
import {
  marketingHomeDescription,
  marketingHomeTitle,
  marketingLocalKeywords,
} from "@/lib/marketing-seo";
import { absoluteUrl } from "@/lib/seo";

const canonicalPath = "/";

export const metadata: Metadata = {
  title: {
    absolute: marketingHomeTitle(),
  },
  description: marketingHomeDescription(),
  keywords: marketingLocalKeywords(),
  alternates: {
    canonical: absoluteUrl(canonicalPath),
  },
  openGraph: {
    title: marketingHomeTitle(),
    description: marketingHomeDescription(),
    url: absoluteUrl(canonicalPath),
    type: "website",
    locale: "en_US",
    siteName: "Website by Jay",
  },
  twitter: {
    card: "summary_large_image",
    title: marketingHomeTitle(),
    description: marketingHomeDescription(),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function HomePage() {
  return (
    <>
      <HomePageJsonLd />
      <LandingHome />
    </>
  );
}
