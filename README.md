# Pulchowk Events

A web platform for discovering, sharing, and managing events and student projects across Nepal's educational institutions. Browse campus events, showcase projects in Product Hunt, vote and comment, post in the community lounge, and manage everything from a dedicated admin dashboard.

The app runs on Next.js 16 with Supabase for data and storage, and NextAuth for Discord and Google sign-in. Everything is server-rendered where it matters and interactive where it should be.


## Features

- Discord and Google OAuth login via NextAuth
- Event listings with add and remove from the admin side
- Product Hunt for student projects, with vote, comment, edit and remove
- Community lounge with categories, posts and threaded comments
- Voting cooldown to keep the leaderboard fair
- Admin dashboard for moderation, users and donations
- Donation and prize pool tracking with verified entries
- Image upload with size and dimension validation
- Protected routes for admin and authenticated actions
- Responsive UI with Tailwind CSS and dark theme
- Toast notifications for every user action

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, Framer Motion, Headless UI and Sonner for the interface. Supabase for database and storage, NextAuth for authentication, Zod for input validation.

## Project structure

```
pulchowk-events/
├── app/
│   ├── actions/          # Server actions (voting, submissions)
│   ├── api/              # Route handlers for lounge, products, votes, admin
│   ├── auth/             # Sign-in and error pages
│   ├── components/       # UI, admin, form and layout components
│   ├── lib/              # Supabase clients and utilities
│   ├── product-hunt/     # Product Hunt pages
│   ├── lounge/           # Community lounge and post detail
│   └── admin/            # Protected admin dashboard
├── components/           # Shared shadcn/ui and layout components
├── lib/                  # Shared helpers
├── types/                # TypeScript definitions
├── proxy.ts              # Next.js 16 proxy (formerly middleware)
├── auth.ts               # NextAuth configuration
├── next.config.ts
└── package.json
```

## Prerequisites

- Node.js 20.9 or newer
- A Supabase project (database and storage)
- A Discord application (OAuth2 credentials)
- A Google Cloud project (OAuth2 credentials)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/pulchowk-events/website.git
cd pulchowk-events
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_hex_32

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. In the Discord Developer Portal, add this exact redirect under OAuth2:

```
http://localhost:3000/api/auth/callback/discord
```

5. In the Google Cloud Console, add this exact redirect under OAuth2:

```
http://localhost:3000/api/auth/callback/google
```

6. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000. Sign-in will fail until both redirect URIs are registered and `.env.local` is saved.

## How it works

The app uses the Next.js App Router. Route handlers under `app/api/` validate the session with `getServerSession(authOptions)` before touching Supabase, and use `createServerClient` from `@supabase/ssr` so the session cookies are honoured on every request.

`proxy.ts` (Next.js 16's replacement for `middleware.ts`) runs on every protected path. It refreshes the Supabase session, checks the NextAuth JWT with `getToken`, and redirects unauthenticated users to `/auth/signin` with a `callbackUrl` so they land back where they started.

Discord and Google are both configured in `auth.ts`. Discord uses NextAuth's built-in provider defaults with `issuer` set to `https://discord.com`, which satisfies the RFC 9207 `iss` check that Discord now returns. The `redirect` callback honours `callbackUrl` so users return to the page they tried to reach.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |

## Deployment

The app is a standard Next.js application and deploys to Vercel without extra configuration. On the Vercel dashboard:

1. Set every variable from `.env.local` under Project Settings, Environment Variables. Use your production domain for `NEXTAUTH_URL`.
2. Add `https://your-domain.com/api/auth/callback/discord` and `https://your-domain.com/api/auth/callback/google` to the Discord and Google consoles.
3. Make sure the Supabase project has the `users`, `products`, `posts`, `comments`, `votes`, `events`, `donations`, `admins` and `notifications` tables and the `product-images` storage bucket.

For self-hosting, `npm run build && npm start` behind a reverse proxy works the same as any Node server.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `OAuthCallback` error on Discord sign-in | Check that the Discord redirect URI matches exactly and that `NEXTAUTH_URL` has no trailing slash. Restart the dev server after editing `.env.local`. |
| `issuer must be configured on the issuer` | Ensure `DiscordProvider` in `auth.ts` includes `issuer: "https://discord.com"`. |
| `params is a Promise` in a dynamic route | The route handler or page must await `params` (and `searchParams`). This is the Next.js 16 async request API. |
| `Module not found: @supabase/auth-helpers-nextjs` | The package is deprecated and was removed. Replace imports with `createServerClient` from `@supabase/ssr`. |
| `upstream image response failed` for an avatar | The user's Discord or Google avatar URL is stale. The page still renders; refresh the session to pick up the new URL. |
| Build fails on a route that calls `getServerSession` | Add `export const dynamic = 'force-dynamic'` to that route, or move the session read into a route handler instead of a static page. |

## Contributing

1. Fork the repository.
2. Create a branch:

```bash
git checkout -b feat/your-feature
```

3. Make your changes and confirm the build still passes:

```bash
npm run build
```

4. Commit, push and open a pull request describing what changed and why.

## Credits and license

- Next.js, React, Tailwind CSS and the rest of the stack listed above.
- Supabase for the database and storage layer.
- Discord and Google for OAuth.
- All contributors to the repository.

Released under the MIT License. See the `LICENSE` file for the full text.