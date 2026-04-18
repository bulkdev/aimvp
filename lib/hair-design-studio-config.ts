import type { GeneratedSiteContent, HairDesignStudioConfig, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

const IMG =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80";

/** Ensures booking + UI always have locations & stylists (AI/mock may omit). */
export function ensureHairDesignStudioConfig(
  content: GeneratedSiteContent,
  intake: IntakeFormData
): HairDesignStudioConfig {
  const raw = content.assets?.hairDesignStudio;
  const city = intakeLocationLine(intake) || intake.city || "your area";
  const phone = intake.phone?.trim();
  const baseLocations =
    raw?.locations?.length && raw.locations.length >= 2
      ? raw.locations
      : [
          {
            id: "studio-a",
            name: `${content.brandName} — Studio A`,
            shortLabel: "Studio A",
            address: intake.address?.trim() || `${city}`,
            hours: ["Tue–Sat 9a–7p"],
            phone,
            mapEmbedUrl: raw?.locations?.[0]?.mapEmbedUrl,
          },
          {
            id: "studio-b",
            name: `${content.brandName} — Studio B`,
            shortLabel: "Location 2",
            address: `${city} — second chair`,
            hours: ["Wed–Sun 10a–8p"],
            phone,
            mapEmbedUrl: raw?.locations?.[1]?.mapEmbedUrl,
          },
        ];

  const titles = content.services.map((s) => s.title.trim()).filter(Boolean);
  const pair = (i: number) => {
    const a = titles[i * 2];
    const b = titles[i * 2 + 1];
    if (a && b) return [a, b];
    if (a) return [a];
    return titles.slice(0, 2);
  };

  const baseStylists =
    raw?.stylists?.length && raw.stylists.length >= 2
      ? raw.stylists
      : [
          {
            id: "artist-1",
            name: "Jordan Ellis",
            specialty: "Dread specialist",
            rating: 4.95,
            bio: "Section-clean sets, realistic timing, and scalp-first care.",
            serviceTitles: pair(0),
            photoUrl: IMG,
            portfolioUrls: [IMG],
          },
          {
            id: "artist-2",
            name: "Mei Alvarez",
            specialty: "Braid architect",
            rating: 4.9,
            bio: "Knotless and feed-in specialist — symmetry-obsessed.",
            serviceTitles: pair(1).length ? pair(1) : titles.slice(0, 2),
            photoUrl: IMG,
            portfolioUrls: [IMG],
          },
          {
            id: "artist-3",
            name: "Sam Okonkwo",
            specialty: "Color + cut",
            rating: 4.92,
            bio: "Texture-aware shaping and honest color timelines.",
            serviceTitles: pair(2).length ? pair(2) : titles.slice(-2),
            photoUrl: IMG,
            portfolioUrls: [IMG],
          },
        ];

  return {
    depositPercent: raw?.depositPercent ?? 25,
    depositFlatUsd: raw?.depositFlatUsd ?? 35,
    cancellationSummary:
      raw?.cancellationSummary ??
      "Cancel 24+ hours before your appointment to transfer your deposit. Late cancellations and no-shows may forfeit the deposit per studio policy.",
    lateCancelFeeUsd: raw?.lateCancelFeeUsd ?? 35,
    noShowFeeUsd: raw?.noShowFeeUsd ?? 75,
    loyaltyBlurb:
      raw?.loyaltyBlurb ??
      "Repeat guests: ask the desk about priority booking and add-on perks after your third visit.",
    socialVideoEmbeds: raw?.socialVideoEmbeds ?? [],
    beforeAfterPairs: raw?.beforeAfterPairs?.length
      ? raw.beforeAfterPairs
      : [
          {
            beforeUrl:
              "https://images.unsplash.com/photo-1503951914875-452162b0e3e1?auto=format&fit=crop&w=800&q=80",
            afterUrl:
              "https://images.unsplash.com/photo-1492106087828-4f1cb1e4e5c4?auto=format&fit=crop&w=800&q=80",
          },
        ],
    locations: baseLocations,
    stylists: baseStylists,
  };
}
