import type { IntakeFormData, GeneratedSiteContent, ServiceItem, FaqItem } from "@/types";
import { pickThemeFromIntake } from "@/lib/utils";
import { resolveSiteVariant } from "@/lib/siteVariant";
import { intakeLocationLine } from "@/lib/location";

// ─── Real OpenAI integration (activate when OPENAI_API_KEY is set) ────────────
// To enable: set OPENAI_API_KEY in .env.local
// The prompt is carefully structured to return valid JSON matching GeneratedSiteContent.

async function generateWithOpenAI(intake: IntakeFormData): Promise<GeneratedSiteContent> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = buildPrompt(intake);
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are an expert copywriter and web designer. Generate professional website content for local businesses.
Always respond with valid JSON only — no markdown, no explanation, just the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(raw) as GeneratedSiteContent;
  // Always attach a theme (AI won't reliably generate color hex values)
  parsed.theme = pickThemeFromIntake(intake);
  parsed.assets = {
    ...parsed.assets,
    heroSlides:
      intake.importedHeroSlides && intake.importedHeroSlides.length > 0
        ? intake.importedHeroSlides
        : parsed.assets?.heroSlides,
    portfolioProjects:
      intake.importedPortfolioProjects && intake.importedPortfolioProjects.length > 0
        ? intake.importedPortfolioProjects
        : parsed.assets?.portfolioProjects,
  };
  return parsed;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(intake: IntakeFormData): string {
  const optionals = [
    intake.phone && `Phone: ${intake.phone}`,
    intake.email && `Email: ${intake.email}`,
    intake.city && `City: ${intake.city}`,
    intake.state && `State/region: ${intake.state}`,
    intake.address && `Address: ${intake.address}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `
Generate a professional website content JSON for this local business:

Company Name: ${intake.companyName}
Business Description: ${intake.businessDescription}
Site layout preference: ${intake.siteTemplate ?? "auto"} (auto = infer trade; plumbing-* = plumber layout; plumbing-flow = compact slider hero + glass nav; super-service = multi-trade HVAC/plumbing style with service areas; renovations = parallax / portfolio showcase for remodel & GC; creator-membership = Patreon-style creator platform with paywall + reels)
Source Link (optional): ${intake.sourceLink || "N/A"}
${optionals}
Booking: ${intake.bookingEnabled ? "Yes" : "No"}
Payment: ${intake.paymentEnabled ? "Yes" : "No"}

Return a JSON object with this EXACT structure:
{
  "brandName": "string",
  "tagline": "short punchy tagline under 8 words",
  "hero": {
    "title": "compelling headline (max 10 words)",
    "subtitle": "1-2 sentences that explain the value prop",
    "ctaText": "primary CTA button text (3-5 words)",
    "ctaSecondaryText": "secondary CTA (optional, e.g. 'Learn More')"
  },
  "services": [
    { "title": "Service Name", "description": "2-3 sentence description", "icon": "lucide-icon-name" },
    { "title": "Service Name", "description": "2-3 sentence description", "icon": "lucide-icon-name" },
    { "title": "Service Name", "description": "2-3 sentence description", "icon": "lucide-icon-name" }
  ],
  "about": {
    "heading": "About [Company Name]",
    "body": "2-3 paragraph about section (genuine, no fake stats)",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
  },
  "faqs": [
    { "question": "Question?", "answer": "Answer." },
    { "question": "Question?", "answer": "Answer." },
    { "question": "Question?", "answer": "Answer." },
    { "question": "Question?", "answer": "Answer." },
    { "question": "Question?", "answer": "Answer." }
  ],
  "contact": {
    "heading": "Get In Touch",
    "subheading": "1-2 sentences encouraging contact"
  }
}

Rules:
- No fake testimonials, no fake reviews, no invented facts
- Keep all copy professional, warm, and conversion-focused
- Use only real information provided — do not invent addresses, phone numbers, or credentials
- When both city and state/region are provided, use them together in natural copy (e.g. "Everett, WA") in hero, about, FAQs, and contact where location matters
- Icon names must be valid lucide-react icons (e.g., "Star", "Shield", "Clock", "Wrench", "Home", "Heart", "Zap", "CheckCircle", "Users", "Award", "Truck", "Settings")
- For super-service layout, also include "assets": { "serviceAreas": ["City, ST", ...] } with 8–16 plausible service area names for the region described (no fake addresses).
${tradePromptExtra(intake)}
`;
}

function tradePromptExtra(intake: IntakeFormData): string {
  const v = resolveSiteVariant(intake.businessDescription, intake.siteTemplate ?? "auto", intake.companyName);
  if (v === "superService") {
    return `
Trade-specific (multi-trade home services — HVAC, plumbing, drains): Sound like a trusted local contractor (see superservicetoday.com-style positioning, but original wording).
- Tagline: memorable one-liner (urgency + trust). Avoid copying trademarked slogans.
- Hero: headline positioning the business as a top local plumbing, heating, cooling, and drain provider for the described area.
- services: Prefer four clear trade lanes when relevant — e.g. Plumbing, Heating, Cooling, Drain & Sewer — with honest scope descriptions (diagnostics, maintenance plans, same-day where applicable).
- about.highlights: industry-appropriate (licensed & insured, emergency availability, stocked trucks, satisfaction focus) without fake awards or BBB claims unless provided in intake.
- assets.serviceAreas: array of city/region names matching the business location context.`;
  }
  if (v === "plumbing") {
    return `
Trade-specific (plumbing / drains): Write like a local licensed plumber — not a generic SaaS landing page.
- Hero headline: emphasize fast response, emergencies, installs, or leak repair (pick what fits the description).
- Tagline: short trust cue (e.g. licensed & insured, 24/7, serving the area).
- Services: use trade terms (e.g. drain cleaning, repiping, fixture install, water heater) when relevant.
- Avoid startup jargon ("scale", "platform", "solutions suite").`;
  }
  if (v === "renovations") {
    return `
Trade-specific (home & commercial renovations / general contractor): Premium, confident tone — not generic SaaS.
- Hero: full-service renovations positioning; mention design clarity, scheduling, permits, and craftsmanship where relevant.
- services: realistic lanes — e.g. design & planning, residential remodels, commercial build-outs / TI, kitchens & baths, additions, finishing & interiors.
- about: describe a real process (discovery → scope → build) without fake awards or certifications not in intake.
- assets: include rich portfolio imagery via portfolioProjects or portfolioEntries when possible.`;
  }
  if (v === "creatorMembership") {
    return `
Trade-specific (content creator membership platform): premium, conversion-focused copy with community energy.
- Hero: creator brand-forward headline + clear member value.
- Services: use creator offers (exclusive videos, live sessions, community, behind-the-scenes).
- about: emphasize creator story and why members join/stay.
- assets.creatorMembership: include monthly/yearly plans, teaser copy, categories/tags, videos, reels, testimonials, and emotes.
- Keep language authentic and direct, avoid generic enterprise buzzwords.`;
  }
  return "";
}

// ─── Mock generator (used when no OpenAI key is configured) ───────────────────

const MOCK_SITE_STATS: { label: string; value: string }[] = [
  { value: "500+", label: "Projects completed" },
  { value: "4.9", label: "Avg. star rating" },
  { value: "A+", label: "BBB rating" },
  { value: "100%", label: "Licensed & insured" },
  { value: "15+", label: "Years in business" },
];

function mockServiceAreas(intake: IntakeFormData, city: string): string[] {
  const st = intake.state?.trim();
  const base = intake.city?.split(",")[0]?.trim() || city.split(",")[0]?.trim() || "Local";
  const primary = st && base ? `${base}, ${st}` : city;
  const pool = [
    primary,
    `${base} area`,
    "North County",
    "South County",
    "East Side",
    "West Side",
    "Downtown",
    "Greater metro",
    "Nearby suburbs",
  ];
  return [...new Set(pool)].filter(Boolean).slice(0, 12);
}

function generateMock(intake: IntakeFormData): GeneratedSiteContent {
  const name = intake.companyName;
  const city = resolveServiceArea(intake);
  const plumbingTaglineArea = city === "your area" ? city : city.toUpperCase();

  // Derive 3 plausible services from the description keywords
  const services = deriveServices(intake, name);
  const faqs = deriveFaqs(intake.businessDescription, name, city);
  const variant = resolveSiteVariant(intake.businessDescription, intake.siteTemplate ?? "auto", intake.companyName);

  if (variant === "superService") {
    const tradeServices: ServiceItem[] = [
      {
        title: "Plumbing",
        description: `Kitchen and bath plumbing, water heaters, leak repair, and fixture installs. Same-day dispatch when you need help fast in ${city}.`,
        icon: "Droplets",
      },
      {
        title: "Heating",
        description: `Furnace and boiler diagnostics, repairs, and safety checks — keep your home warm when it matters most.`,
        icon: "Flame",
      },
      {
        title: "Cooling",
        description: `AC tune-ups, repairs, and performance checks so you stay comfortable through the hottest days.`,
        icon: "Snowflake",
      },
      {
        title: "Drain & Sewer",
        description: `Clear tough clogs, camera inspections, and sewer line solutions with upfront explanations and options.`,
        icon: "Waves",
      },
    ];
    return {
      brandName: name,
      tagline: `Whatever It Takes! · Serving ${city}`,
      hero: {
        title: `#1 Local Plumbing, Heating, Cooling & Drain Experts`,
        subtitle: `${name} keeps your home comfortable year-round — honest recommendations, clear pricing, and technicians who respect your time and your home across ${city} and nearby communities.`,
        ctaText: "Book Online",
        ctaSecondaryText: "Call Now",
      },
      services: tradeServices,
      about: {
        heading: "Why Choose Us?",
        body: `Homeowners across ${city} rely on ${name} for straight answers and workmanship they can feel good about. We're licensed and insured, our trucks are stocked for common repairs, and we explain every option before any work begins.\n\nFrom emergency no-heat calls to planned upgrades, we show up ready to solve the problem — not upsell you on things you don't need. That's how we've earned repeat business and referrals in neighborhoods like yours.`,
        highlights: [
          "Fully licensed & insured",
          "24/7 emergency service",
          "Friendly, respectful technicians",
          "Fully stocked service trucks",
          "Satisfaction guaranteed",
        ],
      },
      faqs,
      contact: {
        heading: "Have a question? Get in touch",
        subheading: `Request service online or call — we'll schedule the right technician for your home in ${city}.`,
      },
      assets: {
        heroSlides: intake.importedHeroSlides,
        portfolioProjects: intake.importedPortfolioProjects,
        serviceAreas: mockServiceAreas(intake, city),
        siteStats: MOCK_SITE_STATS,
      },
      theme: pickThemeFromIntake(intake),
    };
  }

  if (variant === "plumbing") {
    return {
      brandName: name,
      tagline: `Licensed plumbers · ${plumbingTaglineArea}`,
      hero: {
        title: `Fast, Reliable Plumbing When You Need It Most`,
        subtitle: `Burst pipe, clogged drain, or new fixture install — ${name} brings licensed pros to your door in ${city}. Upfront pricing, clean work, and emergency service when minutes count.`,
        ctaText: "Schedule Service",
        ctaSecondaryText: "View services",
      },
      services,
      about: {
        heading: `Your neighborhood plumbing crew`,
        body: `From dripping faucets to full repipes, ${name} handles residential and light commercial work across ${city}. We're licensed and insured, and we treat your home like our own — protective floor coverings, tidy job sites, and clear explanations before we turn a single wrench.\n\nWe stay current on code and best practices for water heaters, drain systems, and fixtures so your repairs last. No scare tactics, no mystery fees — just honest recommendations and workmanship you can count on.\n\nWhether it's an emergency at midnight or a planned bathroom upgrade, we're the team your neighbors trust.`,
        highlights: [
          "Emergency & same-day service available",
          "Licensed, bonded & insured",
          "Upfront estimates — no surprise add-ons",
        ],
      },
      faqs: derivePlumbingFaqs(name, city),
      contact: {
        heading: "Book a plumber or get a quote",
        subheading: `Tell us what's going on — we'll respond quickly and schedule the right technician for ${city} and nearby areas.`,
      },
      assets: {
        heroSlides: intake.importedHeroSlides,
        portfolioProjects: intake.importedPortfolioProjects,
        siteStats: MOCK_SITE_STATS,
      },
      theme: pickThemeFromIntake(intake),
    };
  }

  if (variant === "renovations") {
    const renovationServices = deriveServices(intake, name);
    return {
      brandName: name,
      tagline: `Design-build · ${city}`,
      hero: {
        title: `Full-Service Home & Commercial Renovations`,
        subtitle: `From concept to completion, ${name} coordinates design, permits, and construction — delivering refined spaces and commercial environments across ${city}.`,
        ctaText: "Start your project",
        ctaSecondaryText: "View portfolio",
      },
      services: renovationServices,
      about: {
        heading: "Built around your timeline",
        body: `We're a full-service renovation partner for homeowners and businesses across ${city}. One team owns planning, trade coordination, and quality control — so you're not juggling disconnected crews.\n\nKitchens, baths, additions, and tenant improvements: we protect occupied spaces, communicate milestones clearly, and build with materials chosen to last.\n\nAsk us about phased schedules, after-hours work, and how we document scope so expectations stay aligned from demo day to final walkthrough.`,
        highlights: [
          "Design-build & general contracting",
          "Licensed, insured, inspection-ready",
          "Clear milestones & site protection",
        ],
      },
      faqs: deriveRenovationFaqs(name, city),
      contact: {
        heading: "Tell us about your project",
        subheading: `Share your goals — we'll respond with next steps, timeline context, and what to expect for projects in ${city} and nearby areas.`,
      },
      assets: {
        heroSlides: intake.importedHeroSlides,
        portfolioProjects: intake.importedPortfolioProjects,
        siteStats: MOCK_SITE_STATS,
      },
      theme: pickThemeFromIntake(intake),
    };
  }

  if (variant === "creatorMembership") {
    const creatorName = intake.creatorName?.trim() || name;
    const now = new Date().toISOString();
    return {
      brandName: name,
      tagline: "Exclusive videos, community, and creator access",
      hero: {
        title: `Join ${creatorName}'s Creator Membership`,
        subtitle: `Get premium full-length content, member-only drops, and direct community access. Watch free reels now and unlock the full library anytime.`,
        ctaText: "Join Membership",
        ctaSecondaryText: "Watch free reels",
      },
      services: [
        {
          title: "Member-only full videos",
          description: "Unlock in-depth episodes, classes, and behind-the-scenes releases.",
          icon: "Lock",
        },
        {
          title: "Live creator sessions",
          description: "Monthly livestreams, Q&A, and requests from members.",
          icon: "Video",
        },
        {
          title: "Community access",
          description: "Join comments and reactions with emotes inside the private platform.",
          icon: "Users",
        },
      ],
      about: {
        heading: `Why fans join ${creatorName}`,
        body: `${creatorName} publishes consistent premium content and keeps the community close. Members get early access, longer edits, and deeper context you will not find on public feeds.\n\nThis membership is built for people who want to learn, stay inspired, and support independent creator work.`,
        highlights: ["New drops every week", "Member-first access", "Creator-led community"],
      },
      faqs: [
        { question: "What do members unlock?", answer: "Full videos, private drops, and member-only discussions." },
        { question: "Can I cancel anytime?", answer: "Yes. You can cancel monthly or yearly plans any time from your account." },
        { question: "Are free reels available?", answer: "Yes. Public reels stay open so you can preview content before subscribing." },
        { question: "Do you support yearly billing?", answer: "Yes. Yearly plans are available with a discount over monthly pricing." },
        { question: "How do I track watched content?", answer: "Your account tracks watch progress and marks videos complete as you watch." },
      ],
      contact: {
        heading: "Have a question?",
        subheading: "Reach out and our team will help with billing, access, or account support.",
      },
      assets: {
        heroSlides: intake.importedHeroSlides,
        portfolioProjects: intake.importedPortfolioProjects,
        siteStats: [
          { value: "1.2K+", label: "Active members" },
          { value: "240+", label: "Premium videos" },
          { value: "4.9", label: "Avg member rating" },
          { value: "95%", label: "Monthly retention" },
        ],
        creatorMembership: {
          creatorName,
          creatorTagline: "Create more. Connect deeper. Grow together.",
          creatorBio: `${creatorName} publishes high-value premium content for members who want deeper access.`,
          contentType: intake.creatorContentType || "other",
          stickyCtaText: "Join Membership",
          teaserHeadline: "Preview the latest reels and unlock full episodes.",
          paywallTitle: "Subscribe to unlock full videos",
          paywallSubtitle: "Members get instant access to the complete library and private community.",
          monthlyPlan: {
            id: "monthly",
            name: "Monthly",
            priceUsd: 15,
            billingInterval: "month",
            description: "Full access, cancel anytime",
          },
          yearlyPlan: {
            id: "yearly",
            name: "Yearly",
            priceUsd: 144,
            billingInterval: "year",
            description: "Save 20% with annual billing",
          },
          testimonials: [
            { id: "t1", name: "Ari M.", quote: "Best creator membership I have joined. The long-form drops are worth it." },
            { id: "t2", name: "Mina R.", quote: "Love the community and direct creator replies in comments." },
            { id: "t3", name: "Jordan K.", quote: "The yearly plan paid for itself in the first month." },
          ],
          categories: ["Behind the scenes", "Deep dives", "Live sessions", "Q&A"],
          tags: ["creator", "exclusive", "members", "community"],
          videos: [
            {
              id: "vid-1",
              title: "Masterclass: Building a Creator Business",
              description: "A practical deep dive on content systems, monetization, and audience trust.",
              fullVideoUrl: "",
              thumbnailUrl: "",
              durationSec: 2580,
              views: 3421,
              engagementScore: 91,
              visibility: "member",
              category: "Deep dives",
              tags: ["business", "creator", "systems"],
              createdAt: now,
            },
            {
              id: "vid-2",
              title: "Weekly Behind The Scenes #12",
              description: "Production workflow, edits, and creative decisions from this week.",
              fullVideoUrl: "",
              thumbnailUrl: "",
              durationSec: 1320,
              views: 1880,
              engagementScore: 84,
              visibility: "member",
              category: "Behind the scenes",
              tags: ["workflow", "editing"],
              createdAt: now,
            },
          ],
          reels: [
            {
              id: "reel-1",
              videoId: "vid-1",
              title: "3 growth mistakes creators make",
              previewVideoUrl: "",
              thumbnailUrl: "",
              durationSec: 44,
              createdAt: now,
            },
            {
              id: "reel-2",
              videoId: "vid-2",
              title: "My camera and lighting stack",
              previewVideoUrl: "",
              thumbnailUrl: "",
              durationSec: 37,
              createdAt: now,
            },
          ],
          emotes: [
            { code: ":fire:", label: "Fire" },
            { code: ":clap:", label: "Clap" },
            { code: ":mindblown:", label: "Mind blown" },
          ],
        },
      },
      theme: {
        ...pickThemeFromIntake(intake),
        primaryColor: "#0b1020",
        secondaryColor: "#131a2c",
        accentColor: "#7c3aed",
      },
    };
  }

  return {
    brandName: name,
    tagline: `Trusted ${name} — Serving ${city}`,
    hero: {
      title: `Professional Services You Can Trust`,
      subtitle: `${name} delivers reliable, high-quality work for homeowners and businesses in ${city}. We're committed to your satisfaction from first call to final result.`,
      ctaText: "Get a Free Quote",
      ctaSecondaryText: "Learn More",
    },
    services,
    about: {
      heading: `About ${name}`,
      body: `${name} is a locally owned business proudly serving ${city} and the surrounding communities. We built our reputation on honest work, clear communication, and results that speak for themselves.\n\nOur team brings hands-on experience and a genuine commitment to every project — whether it's a quick job or a complex engagement. We treat every client's property and time with respect.\n\nWhen you work with us, you get a partner, not just a contractor. We stand behind everything we do.`,
      highlights: [
        "Locally owned and operated",
        "Transparent pricing, no surprises",
        "100% satisfaction guaranteed",
      ],
    },
    faqs,
    contact: {
      heading: "Ready to Get Started?",
      subheading: `Reach out today and we'll get back to you promptly. Serving ${city} and surrounding areas.`,
    },
    assets: {
      heroSlides: intake.importedHeroSlides,
      portfolioProjects: intake.importedPortfolioProjects,
      siteStats: MOCK_SITE_STATS,
    },
    theme: pickThemeFromIntake(intake),
  };
}

function resolveServiceArea(intake: IntakeFormData): string {
  const fromIntake = intakeLocationLine(intake);
  if (fromIntake) return fromIntake;

  const address = intake.address?.trim();
  if (!address) return "your area";

  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // Example: "123 Main St, Lynn, MA 01901" -> "Lynn, MA"
    const cityPart = parts[parts.length - 2];
    const stateZipPart = parts[parts.length - 1];
    const state = stateZipPart.split(/\s+/)[0];
    if (cityPart && state) return `${cityPart}, ${state.toUpperCase()}`;
  }

  return address;
}

// ─── Service derivation from description keywords ─────────────────────────────

function deriveServices(intake: IntakeFormData, name: string): ServiceItem[] {
  const lower = intake.businessDescription.toLowerCase();
  const v = resolveSiteVariant(intake.businessDescription, intake.siteTemplate ?? "auto", intake.companyName);

  if (v === "renovations") {
    return [
      {
        title: "Design & pre-construction",
        description: `Concept development, budgeting, and permit-ready drawings so your remodel in ${intake.city || "your area"} starts with a plan you can trust — not surprises mid-build.`,
        icon: "PenLine",
      },
      {
        title: "Residential renovations",
        description: `Whole-home updates, additions, and structural improvements with clean job sites, daily communication, and finishes that hold up to real life.`,
        icon: "Home",
      },
      {
        title: "Commercial build-outs",
        description: `Tenant improvements, retail and office fit-outs, and phased work that keeps your business moving — coordinated trades and inspection-ready documentation.`,
        icon: "Building2",
      },
      {
        title: "Kitchens, baths & interiors",
        description: `Cabinetry, tile, lighting, and millwork installed to designer specs — we sweat the details so the reveal feels effortless.`,
        icon: "Sparkles",
      },
    ];
  }

  if (v === "plumbing") {
    return [
      { title: "Emergency Repairs", description: `When pipes burst or drains back up, ${name} responds fast. We handle urgent plumbing issues day or night to minimize damage and restore service quickly.`, icon: "Wrench" },
      { title: "Installations", description: "From new fixtures to full system installs, we bring precision workmanship to every job. All installations are code-compliant and properly permitted.", icon: "Settings" },
      { title: "Inspections & Maintenance", description: "Prevent costly problems before they start. Our thorough inspections catch small issues early and keep your plumbing running smoothly year-round.", icon: "Shield" },
    ];
  }

  if (lower.includes("clean")) {
    return [
      { title: "Residential Cleaning", description: `${name} leaves your home spotless and fresh. Our trained team uses professional-grade products safe for your family and pets.`, icon: "Home" },
      { title: "Deep Cleaning", description: "Tackle the tough stuff with our comprehensive deep clean service — perfect for move-ins, move-outs, or a seasonal reset.", icon: "Zap" },
      { title: "Commercial Cleaning", description: "Keep your workspace professional and inviting. We offer flexible scheduling including early morning and after-hours service.", icon: "Award" },
    ];
  }

  if (lower.includes("lawn") || lower.includes("landscap")) {
    return [
      { title: "Lawn Maintenance", description: `Regular mowing, edging, and cleanup keep your property looking its best. ${name} handles the work so you can enjoy your outdoor space.`, icon: "Leaf" },
      { title: "Landscaping Design", description: "Transform your yard with thoughtful planting, mulching, and layout that boosts curb appeal and suits your lifestyle.", icon: "Flower2" },
      { title: "Seasonal Services", description: "From spring cleanups to fall leaf removal, we keep your property pristine through every season.", icon: "Sun" },
    ];
  }

  if (lower.includes("salon") || lower.includes("hair") || lower.includes("beauty")) {
    return [
      { title: "Haircuts & Styling", description: `Our experienced stylists at ${name} create looks tailored to your face shape, lifestyle, and personal style — every time.`, icon: "Scissors" },
      { title: "Color & Highlights", description: "From subtle balayage to bold transformations, our colorists use premium products for vibrant, lasting results.", icon: "Palette" },
      { title: "Treatments & Care", description: "Restore shine and strength with our nourishing treatments. We customize every service to your hair's unique needs.", icon: "Heart" },
    ];
  }

  // Generic professional services fallback
  return [
    { title: "Consultation", description: `Start with a no-pressure consultation with the ${name} team. We listen carefully, assess your needs, and map out the best path forward.`, icon: "Users" },
    { title: "Core Services", description: `Our flagship offering — delivered with professionalism and attention to detail. ${name} sets the standard for quality in ${lower.split(" ").slice(0, 3).join(" ")}.`, icon: "CheckCircle" },
    { title: "Ongoing Support", description: "We don't disappear after the job is done. Our team is available for follow-up, maintenance, and any questions that come up down the line.", icon: "Clock" },
  ];
}

// ─── Plumbing-specific FAQs (mock) ───────────────────────────────────────────

function derivePlumbingFaqs(name: string, city: string): FaqItem[] {
  return [
    {
      question: "Do you offer emergency plumbing service?",
      answer: `Yes. ${name} provides emergency service for urgent issues like burst pipes, major leaks, and sewer backups. Call us anytime — we'll dispatch a licensed plumber as quickly as possible.`,
    },
    {
      question: "Are estimates free?",
      answer: `We provide clear, upfront estimates for most jobs. For emergency visits there may be a service fee that we apply toward the repair — we'll explain before any work begins.`,
    },
    {
      question: `What areas around ${city} do you serve?`,
      answer: `We serve ${city} and nearby communities. Contact us with your address and we'll confirm availability.`,
    },
    {
      question: "Are your plumbers licensed and insured?",
      answer: `Absolutely. Every technician is licensed and insured, and we stand behind our workmanship.`,
    },
    {
      question: "What payment methods do you accept?",
      answer: `We accept major credit cards, debit, and other common payment methods. Ask us about financing for larger projects.`,
    },
  ];
}

function deriveRenovationFaqs(name: string, city: string): FaqItem[] {
  return [
    {
      question: "Do you handle permits and inspections?",
      answer: `Yes. ${name} prepares permit packages and coordinates inspections as part of our process. Requirements depend on scope and jurisdiction — we'll outline what's needed for your project in ${city} and surrounding areas.`,
    },
    {
      question: "How long does a typical renovation take?",
      answer: `Timelines vary by scope, material lead times, and inspections. After a site visit, we provide a phased schedule with milestones so you know what happens when — no vague "we'll be done soon" updates.`,
    },
    {
      question: "Can you work while we stay open / live in the home?",
      answer: `Often yes. We use dust containment, phased areas, and after-hours options for commercial work when needed. We'll propose a plan that fits your situation.`,
    },
    {
      question: "Are estimates free?",
      answer: `We typically start with a consultation and can provide a ballpark range before detailed pricing. Larger scopes move into line-item proposals once design direction is set.`,
    },
    {
      question: "What markets do you serve?",
      answer: `We take on residential and commercial projects across ${city} and nearby communities. Share your address and we'll confirm fit.`,
    },
  ];
}

// ─── FAQ derivation ───────────────────────────────────────────────────────────

function deriveFaqs(_description: string, name: string, city: string): FaqItem[] {
  return [
    {
      question: `What areas does ${name} serve?`,
      answer: `We primarily serve ${city} and the surrounding communities. Contact us to confirm service availability in your specific location.`,
    },
    {
      question: "How do I get a quote?",
      answer: `Getting a quote is easy — just fill out our contact form or give us a call. We'll respond within one business day with a clear, itemized estimate.`,
    },
    {
      question: "Are you licensed and insured?",
      answer: `Yes. ${name} is fully licensed and insured. We maintain all required certifications to operate legally and protect our clients throughout every job.`,
    },
    {
      question: "What payment methods do you accept?",
      answer: `We accept all major credit cards, checks, and bank transfers. For larger projects, we offer flexible payment scheduling — ask us for details.`,
    },
    {
      question: "How quickly can you get started?",
      answer: `For most projects, we can schedule a start date within the week. Emergency services are typically available same-day or next-day. Contact us to check current availability.`,
    },
  ];
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Generates website content from intake form data.
 * Uses OpenAI if OPENAI_API_KEY is set; falls back to deterministic mock output.
 *
 * To plug in OpenAI: add OPENAI_API_KEY to .env.local
 */
export async function generateSiteContent(
  intake: IntakeFormData
): Promise<GeneratedSiteContent> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(intake);
    } catch (err) {
      console.error("[generator] OpenAI failed, falling back to mock:", err);
    }
  }
  return generateMock(intake);
}
