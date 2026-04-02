# SiteGenAI — AI Website Builder

Generate professional small-business websites in seconds. Enter your business details and get a fully-structured, polished landing page draft ready to publish.

---

## What It Does

- **Intake form** — company name, description, logo upload, contact details, booking/payment toggles
- **AI generation** — structured website content (hero, services, about, FAQ, contact) via OpenAI or a smart mock fallback
- **Live preview** — full rendered website draft in a builder shell
- **Template system** — reusable section components driven by generated JSON
- **Booking placeholder** — ready for Calendly or Square Appointments embed
- **Payment placeholder** — ready for Stripe Payment Link or Checkout
- **File-based storage** — generated projects saved locally in `.projects/`, swappable to Postgres/Supabase

---

## Tech Stack

- **Next.js 15** (App Router, Server Actions, Server Components)
- **TypeScript** — strict, fully typed
- **Tailwind CSS** — utility-first styling
- **OpenAI SDK** — pluggable AI generation
- **UUID** — project IDs
- File-based JSON store (`.projects/` directory)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/ai-website-builder
cd ai-website-builder
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values you need (see **Environment Variables** below).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Optional | Enables real AI generation. Without it, the app uses smart mock output. |
| `OPENAI_MODEL` | Optional | OpenAI model to use. Default: `gpt-4o` |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployment URL. Used for metadata. |

Future (uncomment when ready):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (replaces file store) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_CALENDLY_URL` | Your Calendly booking page URL |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Your Stripe Payment Link URL |

---

## Plugging in OpenAI

The generator is in `lib/generator.ts`. It auto-detects whether `OPENAI_API_KEY` is set:

```
OPENAI_API_KEY set? → Use real OpenAI (gpt-4o)
Not set?            → Use smart mock output (structured, professional)
```

**To activate:**

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o
   ```
3. Restart the dev server. That's it — no code changes needed.

**To change the prompt:** Edit `buildPrompt()` in `lib/generator.ts`.

**To swap models:** Change `OPENAI_MODEL` in `.env.local`. `gpt-4o-mini` works great for speed and cost; `gpt-4o` produces the best copy quality.

---

## Swapping Storage to Postgres / Supabase

The persistence layer is in `lib/store.ts`. All functions have the same signatures — just replace the file I/O with your DB client:

```typescript
// lib/store.ts — swap these implementations:

export async function createProject(...) { /* replace fs.writeFile with db.insert */ }
export async function getProject(id)     { /* replace fs.readFile with db.select */ }
export async function listProjects()     { /* replace fs.readdir with db.findMany */ }
export async function updateProject(...) { /* replace fs.writeFile with db.update */ }
```

**With Supabase:**
```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function getProject(id: string) {
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  return data;
}
```

**With Prisma + Postgres:**
```typescript
import { prisma } from "@/lib/prisma";

export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}
```

The `Project` type in `types/index.ts` maps directly to your schema.

---

## Project Structure

```
ai-website-builder/
├── app/
│   ├── page.tsx                  # Intake form (homepage)
│   ├── layout.tsx                # Root layout + fonts
│   ├── globals.css               # Tailwind + global styles
│   ├── not-found.tsx             # 404 page
│   ├── api/
│   │   ├── generate/route.ts     # POST — generate website from intake
│   │   └── projects/route.ts     # GET — list all projects
│   └── preview/[id]/
│       └── page.tsx              # Preview page (server component)
│
├── components/
│   ├── form/
│   │   └── IntakeForm.tsx        # Intake form with all fields + toggles
│   ├── preview/
│   │   └── PreviewShell.tsx      # Builder toolbar wrapper
│   └── template/
│       ├── SiteTemplate.tsx      # Assembles all sections
│       ├── ServiceIcon.tsx       # SVG icon mapper
│       └── sections/
│           ├── NavbarSection.tsx
│           ├── HeroSection.tsx
│           ├── ServicesSection.tsx
│           ├── AboutSection.tsx
│           ├── FaqSection.tsx    # Interactive accordion
│           ├── CtaBanner.tsx
│           ├── ContactSection.tsx # Contact form + info
│           ├── BookingSection.tsx # Calendly/Square placeholder
│           ├── PaymentSection.tsx # Stripe placeholder
│           └── FooterSection.tsx
│
├── lib/
│   ├── generator.ts              # AI generation (mock + OpenAI)
│   ├── store.ts                  # File-based project persistence
│   └── utils.ts                  # cn(), theme utils, color picker
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── .projects/                    # Generated project data (gitignored)
├── .env.local.example            # Env var template
└── README.md
```

---

## Adding a New Template

1. Create a new folder: `components/template-v2/`
2. Build your `SiteTemplate.tsx` and section components
3. In `app/preview/[id]/page.tsx`, add template selection logic:
   ```typescript
   const Template = project.intake.templateId === "v2" ? SiteTemplateV2 : SiteTemplate;
   ```
4. Add a `templateId` field to `IntakeFormData` and show the user a template picker

---

## Activating Booking & Payment

### Calendly
```tsx
// In BookingSection.tsx, replace the placeholder with:
<div
  className="calendly-inline-widget"
  data-url={process.env.NEXT_PUBLIC_CALENDLY_URL}
  style={{ minWidth: "320px", height: "700px" }}
/>
// Add to layout.tsx <head>:
<script src="https://assets.calendly.com/assets/external/widget.js" async />
```

### Stripe Payment Link
```tsx
// In PaymentSection.tsx, update the CTA:
<a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} target="_blank" className="btn-primary">
  Pay Now
</a>
```

### Stripe Checkout (server-side)
Create `app/api/checkout/route.ts` using `stripe.checkout.sessions.create()` and redirect to the session URL.

---

## Deploy to Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. In **Environment Variables**, add:
   - `OPENAI_API_KEY` (if using real AI)
   - `NEXT_PUBLIC_APP_URL` = your Vercel domain
4. Click **Deploy**

> ⚠️ **Storage note:** The file-based `.projects/` store does **not** persist on Vercel (serverless, ephemeral filesystem). Before going to production, swap `lib/store.ts` to use Supabase or Postgres (see above).

**Vercel-specific tips:**
- The API route has `export const maxDuration = 60` for OpenAI calls — make sure your plan supports it
- Use Vercel Blob or S3 for logo file storage in production (currently stored as base64 in the project JSON)

---

## Roadmap / Next Features

- [ ] Multiple templates (professional, creative, minimal)
- [ ] Logo color extraction → auto-theme matching
- [ ] Export to HTML/ZIP download
- [ ] Subdomain publishing (`client-name.youragency.com`)
- [ ] Client dashboard (list / manage / regenerate projects)
- [ ] Inline editing (click-to-edit any text in preview)
- [ ] CMS integration (Contentful, Sanity)
- [ ] White-label mode for client delivery

---

## License

MIT — use this freely for your agency projects.
