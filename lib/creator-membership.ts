import type { GeneratedSiteContent, Project } from "@/types";

export function creatorAssets(content: GeneratedSiteContent) {
  const cm = content.assets?.creatorMembership;
  return {
    creatorName: cm?.creatorName?.trim() || content.brandName,
    creatorTagline: cm?.creatorTagline?.trim() || content.tagline,
    creatorBio: cm?.creatorBio?.trim() || content.about.body,
    creatorAvatarUrl: cm?.creatorAvatarUrl?.trim() || content.assets?.heroSlides?.[0] || "",
    stickyCtaText: cm?.stickyCtaText?.trim() || "Join Membership",
    teaserHeadline: cm?.teaserHeadline?.trim() || "Preview the latest reels and unlock full episodes.",
    paywallTitle: cm?.paywallTitle?.trim() || "Subscribe to unlock full videos",
    paywallSubtitle:
      cm?.paywallSubtitle?.trim() ||
      "Members get instant access to the complete library and private community.",
    monthlyPlan: cm?.monthlyPlan ?? {
      id: "monthly",
      name: "Monthly",
      priceUsd: 15,
      billingInterval: "month" as const,
      description: "Full access, cancel anytime",
    },
    yearlyPlan: cm?.yearlyPlan ?? {
      id: "yearly",
      name: "Yearly",
      priceUsd: 144,
      billingInterval: "year" as const,
      description: "Save with annual billing",
    },
    testimonials: cm?.testimonials ?? [],
    categories: cm?.categories ?? [],
    tags: cm?.tags ?? [],
    videos: cm?.videos ?? [],
    reels: cm?.reels ?? [],
    emotes: cm?.emotes ?? [],
    comments: cm?.comments ?? [],
    reactions: cm?.reactions ?? [],
    watchHistory: cm?.watchHistory ?? [],
    subscriptions: cm?.subscriptions ?? [],
    savedVideos: cm?.savedVideos ?? [],
  };
}

export function isActiveSubscriber(project: Project, userId: string | undefined): boolean {
  if (!userId) return false;
  const subs = project.content.assets?.creatorMembership?.subscriptions ?? [];
  return subs.some((s) => s.userId === userId && (s.status === "active" || s.status === "trialing"));
}

