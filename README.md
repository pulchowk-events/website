# Pulchowk Events

> A community platform for campus events, student projects, and engineering jobs across Nepal.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Every week, hackathons, workshops, internships and jobs are announced across a dozen different places — Discord servers, Facebook groups, college noticeboards, and event listings scattered over half a dozen websites. Students find out about most of them too late, or not at all. **Pulchowk Events brings the useful signal into one place.**

The site lists verified campus events, showcases student projects in a Product Hunt–style leaderboard, hosts a community lounge for discussions, tracks a prize pool for student investing competitions, and adds a jobs board drawn from Nepal's top engineering recruiters. A Discord bot ([`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator)) scrapes events and jobs from ten sources, runs every item through deduplication and quality checks, posts the vetted results to a community of 5,000+ students, and syncs them to the website within seconds.

The goal is a fast, discoverable, community-run index of what's actually happening — not another event aggregator that dumps scraped noise onto a page.

[Join the Discord](https://discord.gg/cQ5gxusATk) · [Bot repository](https://github.com/pulchowk-events/aggregator)

## What's on the site

**Events.** Campus events scraped from Khalti, KataJaam, NepVents and Kgarira, deduplicated against each other, quality-gated, categorised, and shown on a paginated feed. Filter by tab, category, month, or city.

**Jobs.** Roles from Merojob, SathiJob, InternSathi and KumariJob in a filterable board with structured `JobPosting` schema, so individual listings surface in Google's job-search results.

**Product Hunt.** A vote-ranked leaderboard for student-built projects. Each project has its own page with comments and a cooldown-gated voting system.

**Community Lounge.** A category-tagged feed for discussions, opportunities, tech help, and showcases, with threaded comments and community moderation.

**Donations.** A verified prize pool with a progress bar and top-donors leaderboard. Every verified dollar goes to student competitions and merit-based awards.

**Admin dashboard.** Moderation, user management, event and product approval, donation verification, and notification broadcasts — all under one route.

## How it works

The project is two systems that hand off to each other, in two separate repositories.

**The website** (this repository) is a Next.js App Router application. Pages are server components; data comes from Supabase through a cached query layer (`unstable_cache` with tag-based invalidation). A small set of client components — the theme toggle, the global loading overlay, the modal forms — handle interaction. Every detail page ships with JSON-LD structured data, dynamic OG images, and a 60-second ISR cache.

**The pipeline** ([`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator)) is a separate Node.js process running a Discord bot. Each scrape hits every source in parallel, normalises results into a shared shape, and runs each item through a gate: title normalisation, fuzzy deduplication against the pending queue, image validity, data-quality warnings, and lead-time checks. Items that pass sit in a pending queue for admin review inside Discord. Once posted to a Discord channel, they're synced to the website's Supabase via the bot's `websiteSync` integration — batched upserts on a deterministic ID, followed by a webhook that clears the site's cache so new content appears within seconds of the Discord post.

The two Supabase projects are independent. The bot holds the full ingestion state, including items that never make it to the website. The website only receives events and jobs that already passed every gate, so no human review is required on the website side.

## Related repositories

| Repository | Purpose |
|---|---|
| **`pulchowk-events/website`** (this repo) | The Next.js frontend, its Supabase schema, admin dashboard, and all user-facing surfaces. |
| [`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator) | The Discord bot that scrapes sources, runs the review pipeline, and syncs vetted items to this site's Supabase. |

The two are independently deployable. The website serves correctly with an empty database; the bot can run without a website target configured. They meet only at the website's Supabase `events` and `jobs` tables.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, Radix UI, Headless UI, Framer Motion |
| Database | Supabase (Postgres + Storage) |
| Authentication | NextAuth (Discord + Google OAuth) |
| Validation | Zod |
| Bot | Node.js, Puppeteer, discord.js — [separate repository](https://github.com/pulchowk-events/aggregator) |
| Hosting | Netlify |
| Analytics | Google Analytics 4 |

## Getting started

You need Node.js 20.9 or newer, a Supabase project, OAuth apps for Discord and Google, and optionally a running bot instance. The site renders with empty data if no bot has synced yet.

**1. Clone and install:**

```bash
git clone https://github.com/pulchowk-events/website.git
cd pulchowk-events
npm install
```

**2. Create `.env.local` with the following variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=               # openssl rand -hex 32
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cache revalidation (bot → site)
REVALIDATE_SECRET=

# Public config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GA_ID=             # optional
```

**3. Register the OAuth redirects:**

- Discord Developer Portal → `http://localhost:3000/api/auth/callback/discord`
- Google Cloud Console → `http://localhost:3000/api/auth/callback/google`

**4. Start the dev server:**

```bash
npm run dev
```

Open `http://localhost:3000`. Sign-in will fail until both OAuth redirects are registered and `.env.local` is saved. Data pages will be empty until the bot has run its first sync.

**5. (Optional) Wire up the bot:**

Follow the setup guide in [`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator) to point the bot's `WEBSITE_SUPABASE_URL` and `WEBSITE_SUPABASE_SERVICE_ROLE_KEY` at this project's Supabase, and set `WEBSITE_REVALIDATE_URL` + `WEBSITE_REVALIDATE_SECRET` to match this site's `REVALIDATE_SECRET`. Once the bot posts its first vetted event to Discord, it appears here within seconds.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

## Deployment

The site deploys to Netlify without extra configuration.

1. Set every variable from `.env.local` in Netlify → **Site settings → Environment variables**. Use the production domain for `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`.
2. Add the production OAuth redirect URIs to the Discord and Google consoles.
3. Ensure the Supabase project has the `users`, `events`, `jobs`, `products`, `lounge_posts`, `lounge_comments`, `votes`, `donations`, `admins`, `prize_pool`, and `notifications` tables, plus the `product-images` storage bucket.
4. Netlify's secrets scanner will flag `NEXT_PUBLIC_GA_ID` and other credential-shaped public variables. Add their names to `SECRETS_SCAN_OMIT_KEYS` in the build environment — every `NEXT_PUBLIC_*` variable is public by design.
5. On the bot side, set `WEBSITE_REVALIDATE_URL` to your deployed Netlify revalidate endpoint and `WEBSITE_REVALIDATE_SECRET` to the same value as this site's `REVALIDATE_SECRET`.

For self-hosting, `npm run build && npm start` behind a reverse proxy works like any Node server.

## Project structure

```
app/
├── api/                 # Route handlers (events, jobs, products, lounge, votes, admin)
├── components/          # UI, layout, forms, admin, markdown renderer
├── lib/                 # Supabase clients, cached queries, SEO helpers
├── events/              # Event listing, detail page, pSEO (month, location)
├── jobs/                # Job listing, detail page, pSEO (role, company, skills)
├── product-hunt/        # Product listing and detail
├── lounge/              # Community posts and threaded comments
├── about/               # About page
├── admin/               # Protected admin dashboard
├── auth/                # Sign-in and error pages
└── layout.tsx           # Root layout, analytics, providers
proxy.ts                 # Next.js 16 request middleware
auth.ts                  # NextAuth configuration
next.config.ts
```

## Roadmap and known limitations

The site runs on the assumption that a bot keeps the data fresh. If the bot stops, nothing breaks — pages keep serving the last synced state — but content goes stale.

- **Image reliability.** SathiJob and InternSathi serve company logos through signed S3 URLs that expire 24 hours after each scrape. Broken images fall back to a placeholder GIF on the client. A stable fix would be downloading and re-hosting the images in Supabase Storage, deferred for cost reasons.
- **Search.** `/search` covers events, projects, and lounge posts, but not jobs. Each surface is queried separately.
- **Event quality.** All filtering is done on the bot side. Anything that syncs to the website is assumed vetted; there is no second review layer here.
- **No blog system.** Content that belongs in long-form articles is deliberately not part of this repository. If it's ever added, it will be Supabase-backed, not file-based.

## Contributing

1. Fork the repository and create a branch: `git checkout -b feat/your-feature`
2. Make your changes and confirm the build passes: `npm run build`
3. Open a pull request describing what changed and why.

Small fixes and documentation improvements are welcome as direct PRs. Larger features — especially anything touching the ingestion pipeline, the pSEO surfaces, or the schema — should start as an issue so the design can be discussed first.

Bot-side changes go to [`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator), which has its own contribution guide.

## License and credits

MIT licensed. See `LICENSE` for the full text.

The Discord bot that feeds this site lives at [`pulchowk-events/aggregator`](https://github.com/pulchowk-events/aggregator).
