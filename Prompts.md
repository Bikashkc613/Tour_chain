# TourChain — Claude Code CLI Prompt Pack

Execute in order. Each prompt assumes prior prompts succeeded.

---

## A. Cleanup & Architecture Alignment

---

### A1. Eliminate scope-drift pages and dual branding

**Purpose:** Remove `/dao` and `/vibe` route names that don't fit the trust-tourism narrative; reconcile "Tourism Chain Nepal" vs "TourChain" branding to one name everywhere.

**Prompt:**
```
Audit the apps/web/src/app/ directory and the entire repo for scope drift and branding inconsistency.

1. DELETE the /dao route entirely:
   - Remove apps/web/src/app/dao/ and any subroutes.
   - Remove any DAO-related components from apps/web/src/components/.
   - Remove DAO links from the global navigation (find <Link href="/dao"> in layout/header components and delete).
   - Remove any DAO-related Supabase queries, types, or migrations if present.

2. RENAME /vibe to /proofs:
   - Rename apps/web/src/app/vibe/ → apps/web/src/app/proofs/
   - Update all internal links from /vibe to /proofs.
   - Rename the page heading from "Himalayan Vibe" to "Your Proofs" or "Completion Proofs".
   - Keep the existing UI structure; only change the route name and copy.

3. RECONCILE branding to "TourChain" everywhere (singular product name):
   - apps/web/src/app/layout.tsx: change <title> metadata to "TourChain — Trust-first trekking in Nepal".
   - All occurrences of "Tourism Chain Nepal" in any .tsx, .ts, .md, or .json file → replace with "TourChain".
   - Update README.md hero, package.json name, and apps/web/package.json name.

4. DELETE stale documentation that no longer reflects the current architecture:
   - Delete report.md (describes pre-refactor 9-program state).
   - Delete claude-session.jsonl (internal tooling artifact, should not be in version control).
   - Add claude-session.jsonl, *.session.jsonl to .gitignore.

5. Search for and delete the contracts/ directory if it exists at repo root and is unrelated to the three current Anchor programs in programs/. If contracts/ contains valid Solana code, report what is in it before deleting.

Acceptance:
- `rg -i "tourism chain nepal" .` returns zero matches in source files (only allowed in historical commit messages or strategy.md if explicitly preserved).
- `ls apps/web/src/app/dao` fails.
- `ls apps/web/src/app/proofs` succeeds.
- `ls report.md claude-session.jsonl` fails.
- `npm run build` in apps/web succeeds with no broken imports.

Pitfalls:
- Header navigation often hardcodes route paths — grep for "dao" and "vibe" string literals across all .tsx files before assuming the rename is complete.
- The site title appears in both layout.tsx metadata AND in OpenGraph tags AND in any manifest.json — update all three.
- Do not commit-and-push between the rename and the import updates; do both in a single commit so no intermediate state is broken.
```

**Acceptance criteria:**
- `/dao` returns 404 in dev and on Vercel.
- `/proofs` renders the previously-`/vibe` UI.
- One product name visible across the entire app and README.
- `report.md` and `claude-session.jsonl` not tracked.

**Risks:**
- Hardcoded `/dao` or `/vibe` strings in components missed by grep due to template literals.
- Vercel cached routes may briefly 404 on `/proofs` until redeploy.

---

### A2. Audit and prune the docs folder

**Purpose:** Reduce documentation surface area to one strategy doc, one refactor log, one current README.

**Prompt:**
```
The repo has multiple overlapping docs: tourchain-strategy.md, tourchain-refactor.md, tourchain-audit.md, Prompts.md, report.md, README.md.

1. Confirm report.md is deleted (handled in A1).
2. Move tourchain-refactor.md and tourchain-audit.md into a docs/ directory at repo root: docs/refactor.md, docs/audit.md.
3. Move Prompts.md → docs/prompts-archive.md (it's a Claude prompt log, not user-facing).
4. Keep tourchain-strategy.md at repo root as the canonical product doc.
5. Update README.md to add a "Documentation" section linking to:
   - tourchain-strategy.md (vision & architecture)
   - docs/refactor.md (refactor history)
   - docs/audit.md (latest audit)
6. Search README.md for any references to deleted features (DAO, /vibe, MongoDB, Express, port 3001, the SDK) and remove or correct them.

Acceptance:
- Repo root has at most: README.md, tourchain-strategy.md, docs/.
- README links resolve to existing files.
- No README mention of deleted infrastructure.

Pitfalls:
- The README's "Repository Structure" tree must be updated to reflect actual directories.
```

**Acceptance criteria:**
- Single canonical strategy doc; auxiliary docs in `docs/`.
- README accurately reflects current architecture.

**Risks:**
- Internal README anchor links breaking if section names change.

---

### A3. Verify and lock the Anchor + Supabase ground truth

**Purpose:** Confirm program IDs, IDL freshness, Supabase migration applied to production. This is hygiene, not new feature work.

**Prompt:**
```
Verify the production deployment is wired correctly. Do not change any business logic.

1. Confirm Anchor.toml [programs.devnet] block contains all three program IDs and matches the declare_id!() macro in each program's lib.rs. If any mismatch, run `anchor keys sync` and rebuild.

2. Confirm apps/web/src/lib/solana/idl/ contains current JSON files for all three programs. If stale, copy from target/idl/ and commit.

3. Confirm apps/web/.env.example contains every variable the app actually reads. Add any missing:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SOLANA_CLUSTER
   NEXT_PUBLIC_SOLANA_RPC
   NEXT_PUBLIC_REPUTATION_PROGRAM_ID
   NEXT_PUBLIC_ESCROW_PROGRAM_ID
   NEXT_PUBLIC_PROOF_PROGRAM_ID
   NEXT_PUBLIC_MERKLE_TREE
   NEXT_PUBLIC_ADMIN_PUBKEY
   NEXT_PUBLIC_MAPBOX_TOKEN
   NEXT_PUBLIC_APP_URL
   SOLANA_PLATFORM_KEYPAIR

4. Create a script scripts/verify-deployment.ts that:
   - Reads each program ID from env
   - Calls connection.getAccountInfo() for each program
   - Reports owner, executable status, and last slot
   - Exits non-zero if any program is missing or non-executable on the configured cluster

5. Document in README under a "Production Setup" section the exact commands required for a fresh deploy:
   supabase link --project-ref XXX
   supabase db push
   anchor build && anchor deploy --provider.cluster devnet
   npm run copy:idl --prefix apps/web
   npx tsx scripts/apply-seed.ts
   npx tsx scripts/init-merkle-tree.ts
   vercel env pull && vercel deploy --prod

Acceptance:
- `npx tsx scripts/verify-deployment.ts` prints all three programs as deployed.
- .env.example lists every env var the codebase reads.
- README documents the exact deploy sequence.

Pitfalls:
- declare_id!() must be updated AFTER `anchor keys sync` and the program rebuilt before redeploy, otherwise the binary still expects the old ID.
- IDL drift between target/idl/ and apps/web/src/lib/solana/idl/ is silent — frontend will deserialize incorrectly and fail with cryptic errors.
```

**Acceptance criteria:**
- Verification script confirms three live programs.
- `.env.example` complete.
- README has reproducible deploy steps.

**Risks:**
- Forgetting `npm run copy:idl` after `anchor build` — frontend silently uses stale account layouts.

---

## B. Data & Auth Foundation

---

### B1. Apply Supabase schema and seed to production

**Purpose:** Stop the empty-database problem. The migrations exist; they need to be applied to the hosted project.

**Prompt:**
```
The Supabase migrations in supabase/migrations/ exist but the production project is empty. Apply them and verify.

1. Confirm supabase/config.toml has the linked project_ref. If not, run `supabase link --project-ref <id>` (project ID provided as env var SUPABASE_PROJECT_REF).

2. Run `supabase db push` to apply all migrations to production. Capture the output and report any migration that failed.

3. Verify the schema in production by running these checks via psql or Supabase SQL editor (output as a script scripts/verify-schema.sql):
   SELECT count(*) FROM users;
   SELECT count(*) FROM guides;
   SELECT count(*) FROM places;
   SELECT count(*) FROM routes;
   SELECT count(*) FROM route_checkpoints;
   SELECT count(*) FROM quests;
   SELECT count(*) FROM services;
   SELECT relname FROM pg_class WHERE relkind = 'm';  -- materialized views
   SELECT polname, polrelid::regclass FROM pg_policy ORDER BY polrelid;  -- RLS policies

4. If counts on places/routes/guides are 0, the seed migration didn't run. Apply scripts/apply-seed.ts:
   npx tsx scripts/apply-seed.ts
   This script should be idempotent (use ON CONFLICT DO NOTHING or upserts).

5. Run REFRESH MATERIALIZED VIEW leaderboard once after seeding.

6. Sanity-check the data:
   - All 5 routes have lat/lng coordinates inside Nepal's bounding box (lat 26-31, lng 80-89).
   - All 3 guides have user_id references that exist in users.
   - Each route has at least 3 route_checkpoints.

Acceptance:
- `SELECT count(*) FROM routes` returns 5.
- `SELECT count(*) FROM places` returns 15.
- `SELECT count(*) FROM guides WHERE is_verified = true` returns 3.
- Production /explore page displays routes (after frontend env vars are set in B3).

Pitfalls:
- Running migrations against the wrong project (linked vs default). Always confirm `supabase status` before push.
- The seed script may reference UUIDs that conflict with existing rows — make seeds idempotent before running.
- RLS policies that depend on auth.uid() may block service-role-key inserts in unexpected ways during seeding; use the service role and explicitly bypass RLS for seed scripts.
```

**Acceptance criteria:**
- Production Supabase has all 5 routes, 15 places, 3 verified guides, 10 quests.
- Leaderboard materialized view exists and refreshes.

**Risks:**
- Migrations applied to a stale local Supabase instead of production.
- Seed script not idempotent → second run fails.

---

### B2. Implement Supabase Auth + wallet signature linking cleanly

**Purpose:** Auth must be invisible until the user needs to act. Email or social for identity. Wallet only when on-chain action is requested.

**Prompt:**
```
Implement clean dual auth in apps/web/.

1. Verify apps/web/src/middleware.ts uses @supabase/ssr to refresh sessions on every request and protects:
   - /dashboard, /book, /trek, /profile, /admin (require authenticated user)
   - /admin/* (require role='admin' lookup from users table)
   Redirect unauthenticated to /login?next=<original-path>.

2. Apps/web/src/app/(auth)/login/page.tsx and signup/page.tsx:
   - Email + password form (Supabase Auth)
   - "Continue with Google" button (Supabase OAuth)
   - On success, insert/upsert into public.users with id = auth.uid(), email, display_name (from email if not provided), role='tourist'
   - Use a Supabase trigger on auth.users INSERT to auto-create the public.users row — do not duplicate this in the client

3. Apps/web/src/lib/auth/wallet.ts must export:
   - generateLinkNonce(userId): inserts a row into auth_nonces (create this table if missing) with 5-minute expiry, returns the nonce
   - buildSignMessage(nonce, walletAddress): returns "TourChain wallet link\nWallet: {addr}\nNonce: {nonce}\nExpires: {iso}"
   - verifyAndLinkWallet(userId, walletAddress, signature, nonce): server-side; verifies via tweetnacl, marks nonce used, updates users.wallet_address (UNIQUE constraint enforces one-wallet-per-user)

4. Apps/web/src/app/api/auth/link-wallet/route.ts:
   - POST { walletAddress, signature, nonce }
   - Reads current user from session
   - Returns 400 on invalid signature, 409 if wallet already linked elsewhere, 200 on success

5. Update Onboarding flow at apps/web/src/app/onboard/ from 4 steps to 2 steps:
   Step 1: "Sign up or log in" (email or Google)
   Step 2: "Connect your wallet" (optional with skip; required only when first booking)
   Delete steps 3 and 4 ("Treasury" and "Embark") — they were ceremony.

6. Replace any client-side admin checks with server-side verification: never trust NEXT_PUBLIC_ADMIN_PUBKEY in client code as the sole gate. The middleware checks users.role='admin'.

Acceptance:
- New user can sign up via email, see /dashboard.
- "Connect Wallet" button on dashboard prompts Phantom signature, links the wallet, and persists across sessions.
- Attempting to link a wallet already linked to another account returns 409.
- /admin redirects non-admins to /dashboard.

Pitfalls:
- Nonce must be single-use AND expire — without expiry, signature replay is possible.
- Don't lowercase base58 wallet addresses; case matters.
- Supabase auth.users vs public.users — the trigger must create the public profile or auth-only users will silently bypass app data.
- The "next" query param redirect must validate the URL is internal (starts with /) to prevent open-redirect attacks.
```

**Acceptance criteria:**
- Email signup → dashboard works without wallet.
- Wallet link works on second visit, persists.
- Auth feels invisible on public pages, clear on protected ones.

**Risks:**
- Forgetting the auth.users → public.users trigger leaves orphaned auth records.
- Open redirect via `?next=` if not validated.

---

### B3. Set Vercel production environment variables

**Purpose:** The app cannot read Supabase or Mapbox in production without these. This is what is breaking the live demo.

**Prompt:**
```
Configure Vercel project environment variables for production. These are not code changes; they are deployment hygiene.

1. List required production env vars and confirm each is set in Vercel:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY (encrypted, server-only)
   NEXT_PUBLIC_SOLANA_CLUSTER=devnet
   NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
   NEXT_PUBLIC_REPUTATION_PROGRAM_ID=BxgSbUELdL9cCj4hETtFJqyzDqFeRKAYefWBnVpDXk3L
   NEXT_PUBLIC_ESCROW_PROGRAM_ID=B1M6gHx7W2tKPWwEEuKaumyk2H8zdETZGoBCDt9yamrt
   NEXT_PUBLIC_PROOF_PROGRAM_ID=EvRzd8MXqxojEmn4jViXv8NyxVXoU3X1gEuSv1tw9qML
   NEXT_PUBLIC_MERKLE_TREE
   NEXT_PUBLIC_ADMIN_PUBKEY
   NEXT_PUBLIC_MAPBOX_TOKEN
   NEXT_PUBLIC_APP_URL=https://tour-chain.vercel.app
   SOLANA_PLATFORM_KEYPAIR (encrypted; base58 secret key, server-only)

2. Use the Vercel CLI to set them via `vercel env add <name> production`. Document the exact list in docs/deployment.md.

3. After all vars are set, run `vercel deploy --prod` and verify:
   - https://tour-chain.vercel.app/explore shows non-empty route list
   - Mapbox map renders
   - /dashboard redirect chain works

4. Add scripts/check-env.ts that fetches the production URL and reports:
   - Whether the page returns 200
   - Whether the page contains expected content (e.g., "Annapurna" or "Everest" in /explore HTML)

Acceptance:
- /explore on production shows all 5 routes.
- Map renders on /explore.
- /dashboard redirects unauthenticated users to /login.
- check-env.ts passes.

Pitfalls:
- NEXT_PUBLIC_* must be set at BUILD time. Setting them after deploy without redeploying does nothing — Next.js inlines them at build.
- Vercel separates env scopes (development / preview / production). Set production explicitly.
- Service role key in NEXT_PUBLIC_* by accident exposes the master Supabase key to the browser. Triple-check the prefix.
```

**Acceptance criteria:**
- Live demo `/explore` shows real routes.
- Live demo `/explore` map renders.

**Risks:**
- Setting `NEXT_PUBLIC_` on a server-only secret leaks it to the bundle.
- Forgetting to redeploy after adding env vars.

---

## C. UI/UX for Core Journey

---

### C1. Rebuild the landing page around the core loop

**Purpose:** A first-time visitor must understand "book a verified guide → trek → prove it on-chain" within 10 seconds. Remove zero-counters that undermine the pitch.

**Prompt:**
```
Rewrite apps/web/src/app/(public)/page.tsx (the home page) for a first-time tourist visitor.

1. HERO section:
   - Single H1: "Trek Nepal with verified guides. Trustless escrow. Proof on-chain."
   - Subhead (1 sentence): "Book a verified guide, pay into an escrow, complete your trek, and walk away with a permanent on-chain proof of your journey."
   - One primary CTA button: "Browse routes →" (links to /explore)
   - One secondary link: "How it works" (smooth-scroll anchor to section below)
   - Background: keep the Himalayan panorama image.

2. REMOVE the three zero-counters ("0 Tourists Onboarded / $0 in Escrow / 0 NFTs Minted"). Replace with a single dynamic stat fetched from Supabase server-side:
   `SELECT count(*) FROM routes WHERE is_active` displayed as "{N} verified routes across Nepal"
   If N is 0, hide the stat entirely. Never show "0".

3. THREE-STEP "How it works" section (replace the existing three feature cards):
   1. "Pick your trek" — Browse routes from Everest, Annapurna, Langtang, Manaslu, and Mustang. Each verified by the platform.
   2. "Book a guide, fund the escrow" — Funds are held in a Solana smart contract. Released to your guide as you complete each milestone.
   3. "Trek and earn proof" — GPS-verified check-ins at each waypoint. A compressed NFT proof minted to your wallet on completion.

4. PROOF section (new, replaces FAQ if any):
   - "See it on-chain" with three Solana Explorer deep-links:
     - View the Reputation program → explorer.solana.com/address/{REPUTATION_PROGRAM_ID}?cluster=devnet
     - View the Escrow program → same pattern
     - View the Proof program → same pattern
   - This single section turns "marketing claim" into "verifiable claim."

5. FOOTER (minimal):
   - GitHub link
   - "Built for Nepal trekking" small text
   - Devnet badge: "Currently live on Solana Devnet"

6. Remove all Lucide icons that don't directly serve a sentence. The page should feel like a serious product, not a crypto landing page.

7. Use only existing shadcn/ui components and Framer Motion for entrance animations on hero and step-cards.

Acceptance:
- Page renders under 2.5s on slow 3G (Lighthouse mobile).
- A new visitor can articulate "what does this do" within 10 seconds.
- No counter showing 0.
- Three Solana Explorer links resolve to the actual deployed programs on devnet.

Pitfalls:
- Don't add carousels, parallax, or auto-playing video. They distract from the loop.
- The route count must be fetched in a server component so it's part of initial HTML, not loaded client-side after hydration.
- Avoid jargon: "PDA," "escrow program," "cNFT" should not appear in user-facing copy. Use "smart contract" and "on-chain proof."
```

**Acceptance criteria:**
- Hero clearly states the value in two lines.
- Single primary CTA visible without scroll.
- No zero-counters.
- Solana Explorer links to real programs.

**Risks:**
- Adding too many CTAs dilutes intent.
- Server-side fetch failure crashes the entire page — wrap in try/catch and degrade gracefully.

---

### C2. Rebuild /explore as a usable route browser

**Purpose:** A visitor must be able to see real routes on a real map, filter them, and click into one in two clicks.

**Prompt:**
```
Rebuild apps/web/src/app/(public)/explore/page.tsx as a real route browser.

1. Server-side fetch on page load:
   const routes = await supabase.from('routes').select('*, route_checkpoints(*, places(*))').eq('is_active', true);
   If routes is empty or errors, show a clear empty state (NOT zero counters).

2. LAYOUT: split-screen on desktop (Mapbox map left 50%, route cards right 50%); stacked on mobile (map on top, cards below).

3. FILTERS at top:
   - Region: All / Annapurna / Everest / Langtang / Manaslu / Mustang
   - Difficulty: All / Easy / Moderate / Hard / Extreme
   - Both filters update the visible cards AND map markers in real time
   - Filter state in URL search params (so /explore?region=Everest is shareable)

4. ROUTE CARDS (right column):
   - Hero image (image_url from routes table; if null, show a region placeholder)
   - Route name, difficulty badge, duration in days, distance in km
   - "{N} checkpoints" pulled from route_checkpoints count
   - Click → navigate to /route/[id]

5. MAP (left column):
   - Mapbox GL with center on Nepal (28.39, 84.12, zoom 6)
   - Plot one marker per checkpoint place across all visible routes
   - Marker click → highlight the corresponding card in the right column
   - Different marker color per route region
   - Token from NEXT_PUBLIC_MAPBOX_TOKEN (verify it's set; if missing, show a graceful fallback "Map unavailable" with the cards still functional)

6. EMPTY STATE: if Supabase returns zero routes, show:
   "No routes available yet. Check back soon, or follow updates on GitHub."
   Never show the page header with "0 routes" — either hide the count or display the count as "{N} routes available" only when N > 0.

7. Remove the "All Verified Routes Available" counter at the top (or only show when N > 0).

Acceptance:
- /explore loads in under 3 seconds with all 5 routes visible.
- Clicking a card navigates to /route/[id].
- Map markers correspond to actual checkpoint coordinates.
- Filter changes update both map and cards.
- URL filter params shareable.

Pitfalls:
- N+1 queries: fetch routes WITH route_checkpoints+places in a single Supabase query using nested select syntax.
- Mapbox markers must be cleaned up on filter change to prevent leaks (use useEffect cleanup).
- Server component vs client component: filters require client interactivity, so split into a server-fetched parent and client filter+map child.
- Mapbox token must be NEXT_PUBLIC_; without it, fall back to cards-only view, never crash.
```

**Acceptance criteria:**
- Real routes from Supabase, real markers on map.
- Filters work and update URL.
- No "0" anywhere visible.

**Risks:**
- Map performance degrades with many markers — at this scale (15 places) it's fine, but lazy-load Mapbox.
- Server/client component split confusion in App Router.

---

### C3. Build /route/[id] as the single most important page

**Purpose:** This is where the visitor decides to book. It must show the route, its checkpoints, the verified guides who lead it, and a clear "Book this trek" CTA.

**Prompt:**
```
Build apps/web/src/app/(public)/route/[id]/page.tsx as the booking-decision page.

1. Server-side fetch:
   - Route by id with all route_checkpoints + places
   - Services associated with this route, joined to guides + users (display_name, avatar_url)
   - For each guide, fetch on-chain GuideReputation PDA via apps/web/src/lib/solana/reputation.ts and compute average score = total_score / total_reviews / 100

2. HEADER:
   - Route name as H1
   - Difficulty badge, duration, distance, max altitude
   - Hero image (route.image_url)

3. STORY section (new):
   - Render route.description as prose
   - Below: a Mapbox map with the route's checkpoints connected by a polyline (in order of route_checkpoints.sequence_order)

4. CHECKPOINTS section (numbered list):
   - Each checkpoint shows: place.name, place.altitude_meters, place.description (one line)
   - Linked quest, if any: render quest.title and a short story_text excerpt

5. GUIDES section:
   - One card per service offered for this route
   - Each card: guide avatar, display_name, languages, on-chain reputation score (e.g., "4.8 ★ from 23 reviews"), price_usd, includes[]
   - "Book with {name} →" button (links to /book/[serviceId])
   - If no guides offer this route: "No guides yet for this route." with a "Notify me" placeholder.

6. PROOF AND TRUST section:
   - "What you'll receive on completion: a Solana cNFT permanently linking this trek to your wallet."
   - "Funds held in escrow, released to guide only as you reach checkpoints."
   - Two micro-copy lines, no hype.

7. STICKY CTA bar on mobile: "Book this trek" at the bottom of the viewport, scrolls user to the GUIDES section.

Acceptance:
- Page loads in under 3s with full data.
- Each guide's reputation score reflects actual on-chain PDA state (or "New" if PDA doesn't exist yet).
- Map shows route polyline connecting checkpoints.
- "Book with {name}" navigates to the booking flow with the right serviceId.

Pitfalls:
- Reputation PDA may not exist yet for a guide — handle null gracefully ("New guide" badge).
- Solana RPC calls during SSR can slow page load; cache reputation in Supabase guides.on_chain_score and refresh in a server action or background job.
- Mapbox polyline requires checkpoint coordinates in order — sort by sequence_order before passing to Mapbox.
- Image URLs from seed data may be broken — show a fallback Nepal landscape image.
```

**Acceptance criteria:**
- Real route + real guides visible.
- On-chain reputation displayed.
- Booking CTA per guide works.

**Risks:**
- SSR latency from on-chain RPC calls; caching is required.
- Missing guide reputation PDAs cause null errors if not handled.

---

### C4. Build /guide/[id] for guide profile depth

**Purpose:** Trust is the product. A visitor must be able to inspect a guide before paying.

**Prompt:**
```
Build apps/web/src/app/(public)/guide/[id]/page.tsx.

1. Server-side fetch:
   - Guide row by id, joined to users (display_name, avatar_url, wallet_address)
   - Services offered by this guide
   - Reviews where guide_id = id, joined to reviewer's display_name, ordered by created_at desc, limit 20
   - On-chain GuideReputation PDA derived from users.wallet_address

2. HEADER:
   - Avatar, display_name, "Verified Guide" badge if guides.is_verified
   - Languages spoken, years_experience, bio
   - Reputation: average score (1 decimal), total reviews, total completions
   - "View on Solana →" link to explorer.solana.com/address/{guide_pda}?cluster=devnet

3. SERVICES section:
   - One card per service: route name, price_usd, max_group_size, includes[]
   - "Book this trek" → /book/[serviceId]

4. REVIEWS section:
   - Each review: reviewer display_name, rating (★★★★☆), comment, date
   - Empty state: "No reviews yet — be the first to trek with this guide."

5. SAFETY/CREDENTIALS section (lightweight):
   - "Verified by TourChain admin on {verified_at}"
   - License number visible if guides.license_number is non-null
   - Specialties[] as small pills

6. If guide is suspended (is_suspended=true), show prominent banner: "This guide is currently suspended pending review." and disable booking CTAs.

Acceptance:
- Guide profile shows real reviews from Supabase, real reputation from chain.
- Suspended guides cannot be booked from this page.
- Solana Explorer link resolves to the guide's reputation PDA.

Pitfalls:
- Wallet_address may be null if the guide hasn't linked a wallet — handle "Reputation not yet on-chain" gracefully.
- License numbers are sensitive — display only the verified status, not the raw license number, on the public page.
- Reviews must respect RLS — public SELECT is allowed, but ensure the query doesn't accidentally use service-role key in a public context.
```

**Acceptance criteria:**
- Profile feels trustworthy without showing PII.
- Suspended guides clearly flagged.

**Risks:**
- Showing license_number publicly is a privacy issue.

---

### C5. Make navigation honest and minimal

**Purpose:** A user-first nav lists only the destinations a tourist needs.

**Prompt:**
```
Audit and simplify the global navigation in apps/web/src/components/Header.tsx (or wherever the nav lives).

1. Public nav (when not logged in):
   - TourChain logo → /
   - Explore → /explore
   - How it works → /#how-it-works (smooth scroll on home, otherwise navigate)
   - "Sign in" button → /login

2. Authenticated tourist nav:
   - TourChain logo → /
   - Explore → /explore
   - My Trips → /dashboard (renamed from "Dashboard" — more user-language)
   - My Proofs → /proofs
   - Profile menu (dropdown): Profile, Sign out

3. Authenticated guide nav:
   - TourChain logo → /
   - My Bookings → /guide/dashboard
   - My Profile → /guide/[id] (their own)
   - Profile menu: Profile, Sign out

4. Authenticated admin nav:
   - TourChain logo → /
   - Admin → /admin
   - Profile menu: Profile, Sign out

5. REMOVE any link to /dao (handled in A1 but verify).
6. REMOVE the static "Dashboard" link if present in unauthenticated nav.
7. Mobile: hamburger menu collapses everything except logo and primary CTA.

Acceptance:
- Public visitor sees Explore + How it works + Sign in only.
- Logged-in tourist sees their three relevant destinations.
- No DAO, no Vibe, no obsolete links.

Pitfalls:
- Conditional rendering must check session AND role from public.users — don't trust client state alone.
- Mobile hamburger must close on navigation (often missed).
```

**Acceptance criteria:**
- Nav adapts to auth state and role.
- No dead-end or obsolete links.

**Risks:**
- Role check race condition between session refresh and nav render.

---

## D. Core Booking + Escrow + Check-in

---

### D1. Implement /book/[serviceId] flow with escrow funding

**Purpose:** This is the tourist's first transaction. It must be fast, clear, and trustworthy.

**Prompt:**
```
Build apps/web/src/app/(app)/book/[serviceId]/page.tsx and /api/booking/prepare/route.ts.

1. /book/[serviceId] page (4 sub-steps in a single-page wizard):
   STEP 1 — Review:
     - Show service details: route, guide, price, includes, max group
     - "Continue" button
   STEP 2 — Dates:
     - Date picker for start_date
     - Number of travelers (party_size)
     - Compute end_date = start_date + duration_days
   STEP 3 — Connect wallet:
     - If wallet not linked, prompt to connect; require devnet network
     - Show wallet balance; if balance < total price + fees, link to a faucet
   STEP 4 — Confirm and fund:
     - Summary: total_price_usd → SOL (use a hardcoded conversion for devnet, e.g., 1 SOL = $150)
     - Number of milestones = number of route_checkpoints (default to 3 if too many)
     - "Sign and fund escrow" button

2. On confirm:
   - POST /api/booking/prepare with { serviceId, startDate, partySize, milestones }
   - Server creates a `bookings` row with status='pending', returns escrow PDA address and serialized create_escrow instruction
   - Client signs the instruction with the connected wallet, sends via @solana/web3.js
   - On confirmation, POST /api/booking/confirm with { bookingId, txSignature, escrowPda }
   - Server verifies the tx on-chain, updates bookings.status='confirmed', stores escrow_pda and escrow_tx_signature

3. Success screen:
   - "Booking confirmed. View it on Solana Explorer."
   - "Go to my trip dashboard" button → /trek/[bookingId]

4. /api/booking/prepare/route.ts:
   - Validate input with zod
   - Authenticated session required
   - Returns: { bookingId (uuid), escrowPda (string), instruction (base64 serialized), expectedAmountLamports }

5. /api/booking/confirm/route.ts:
   - Validate { bookingId, txSignature, escrowPda }
   - Confirm the tx on-chain (await connection.confirmTransaction)
   - Verify the escrow PDA exists and the BookingEscrow.tourist matches the user's wallet
   - Update bookings row

6. Error handling: rejected wallet signature → "You cancelled the signature, your booking was not created." On-chain failure → "Funding failed: {error}. Your booking is pending; try again from your dashboard."

Acceptance:
- A user can complete the booking from /route/[id] → /book/[serviceId] in under 90 seconds with a funded devnet wallet.
- A bookings row in Supabase has status='confirmed' and escrow_pda populated.
- The escrow vault PDA on-chain holds the SOL.

Pitfalls:
- Race condition: user signs, but tx fails before /api/booking/confirm fires. Always create the Supabase row in 'pending' state first; the confirmation step is what flips it to 'confirmed'.
- created_at byte order in PDA seeds must match between client and program (`to_le_bytes()` exactly).
- Don't rely on client-computed escrow PDA — always recompute server-side and verify match.
- Currency conversion: hardcoded for devnet but flag as TODO for V1 USDC.
```

**Acceptance criteria:**
- End-to-end booking with real escrow PDA on devnet.
- Clear error states on rejection or failure.

**Risks:**
- Failed tx after Supabase row creation leaves dangling pending bookings — needs cleanup job.
- PDA seed mismatch causes silent rejection.

---

### D2. Implement /trek/[bookingId] active trek view + GPS check-in

**Purpose:** During the trek, the tourist needs a single screen showing progress and the next checkpoint.

**Prompt:**
```
Build apps/web/src/app/(app)/trek/[bookingId]/page.tsx and /api/checkin/route.ts.

1. /trek/[bookingId] page:
   - Server fetch: booking + route + route_checkpoints + places + completed check_ins for this booking
   - Header: route name, guide name, "Day X of Y"
   - Progress bar: completed checkpoints / total checkpoints
   - Map: route polyline with checkpoints; completed ones in green, current in yellow, future in gray
   - Next checkpoint card: place name, distance from current GPS, "Check in here" button (enabled only when within 500m)
   - List below: all checkpoints with status (completed/active/upcoming)

2. Check-in button click flow:
   - Browser geolocation prompt
   - Compute haversine distance from {browser lat,lng} to {checkpoint lat,lng}
   - If > 500m, disable button and show "Move closer to {place.name} ({distance}m away)"
   - If within 500m, enable
   - On click, POST /api/checkin with { bookingId, placeId, lat, lng }

3. /api/checkin/route.ts:
   - Validate input with zod
   - Authenticated; user must be the booking's tourist
   - Server-side recompute haversine using place.lat/lng from DB; reject if > 500m
   - Insert check_ins row with verified=true, method='gps'
   - If this completes all checkpoints, set bookings.milestones_completed accordingly and return a flag completion_ready=true

4. Milestone release UI:
   - After each verified check-in, show a "Release milestone payment" button
   - This requires both tourist AND guide to sign — implement as:
     - Tourist clicks "Release"; server creates a partially-signed transaction, stores it
     - Guide gets notification (email or Supabase realtime), signs from their dashboard
     - Once both sigs, server submits to chain, increments milestones_completed
   - Display txSignature with Explorer link after each release

5. Final completion:
   - After last check-in: "Complete trek and release final payment" button
   - Same dual-sig flow, but calls complete_booking instruction
   - On success: "Mint your proof" button → POST /api/proof/mint

Acceptance:
- A user with browser geolocation enabled can check in within 500m of any checkpoint.
- Check-in count increments in Supabase and is visible immediately.
- Milestone release transactions show up on Solana Explorer.

Pitfalls:
- Geolocation permission denied: degrade gracefully with manual "I'm here" + guide co-sign as fallback (V1).
- GPS spoofing: 500m gate is server-validated; client gate is courtesy only.
- Browser geolocation can be inaccurate to 30-100m on mobile; the 500m radius accounts for this.
- Dual-signature flow requires either offline tx serialization OR a coordination layer; for MVP, use a partially-signed tx stored in Supabase with TTL.
- Don't allow check-in for the same place twice in a single booking.
```

**Acceptance criteria:**
- GPS check-in works on a phone in a real location.
- Milestone release submits a dual-sig tx that lands on devnet.

**Risks:**
- Dual-signature coordination is complex; may need to simplify to admin-co-sign for MVP.
- Geolocation permission UX is friction-heavy.

---

### D3. Build /guide/dashboard for guides

**Purpose:** Guides need to see incoming bookings, accept them, and confirm completions. Their value depends on this loop.

**Prompt:**
```
Build apps/web/src/app/(app)/guide/dashboard/page.tsx.

1. Auth: middleware checks user is authenticated AND has a guide row in guides table; redirect non-guides to /dashboard.

2. Sections:
   a. "Pending acceptance" — bookings with status='confirmed', awaiting guide.activate()
      - Each row: tourist name, route, dates, total price
      - "Accept" button → calls escrow.activate() → updates booking.status='active'
   b. "Active treks" — bookings with status='active'
      - Show check-in progress per booking
      - "Co-sign milestone release" button when tourist has initiated one
      - "Confirm completion" button when all checkpoints done
   c. "Completed" — bookings with status='completed', show 30-day history
   d. "Earnings" — sum of released SOL across all completed bookings
   e. "Reputation" — current on-chain score, total reviews, link to public profile

3. Guides see only their own bookings (RLS already enforces this; verify).

4. Notification panel: badges on each section showing count of items needing action.

Acceptance:
- A guide logs in, sees pending bookings, can accept them.
- Active treks update in real time as tourist checks in.
- Co-sign flow completes milestone releases.

Pitfalls:
- Real-time updates require Supabase realtime subscription on bookings + check_ins for this guide.
- Guides must also have a wallet_address linked before accepting bookings — show inline prompt if missing.
```

**Acceptance criteria:**
- Guide can complete the full bookings → activate → release → complete loop from this page.

**Risks:**
- Guide forgets to link wallet, no booking can move forward.

---

## E. Proof & Reputation

---

### E1. Implement /api/proof/mint and /proofs page

**Purpose:** Closing the loop. Tourist gets a permanent on-chain artifact.

**Prompt:**
```
Implement proof minting and display.

1. /api/proof/mint/route.ts:
   - Auth: session required
   - Body: { bookingId }
   - Server checks:
     - booking exists and status='completed'
     - all checkpoints have verified check_ins
     - guide co-signature on completion is recorded
   - Build cNFT metadata JSON:
     {
       name: "{route_name} Completion",
       symbol: "TREK",
       description: "Verified on-chain proof of completing {route_name} on {completed_at}",
       image: "{route.image_url or platform default}",
       attributes: [
         { trait_type: "Route", value: route.name },
         { trait_type: "Region", value: route.region },
         { trait_type: "Duration", value: "{N} days" },
         { trait_type: "Guide", value: guide_display_name },
         { trait_type: "Completed", value: ISO date },
         { trait_type: "Checkpoints", value: "{N}/{M}" }
       ]
     }
   - Upload metadata JSON to Supabase Storage (bucket: 'proof-metadata', public-read)
   - Call tourchain_proof.mint_completion_proof with platform keypair (loaded from SOLANA_PLATFORM_KEYPAIR env)
   - Insert completion_proofs row with nft_mint_address, mint_tx_signature, metadata_uri
   - Return { mintAddress, txSignature, explorerUrl }

2. /proofs page (renamed from /vibe in A1):
   - Auth required
   - Server fetch: completion_proofs WHERE user_id = current user
   - Each card: route image, route name, completion date, "View on Solana →" link
   - Empty state: "Your trek proofs will appear here. Start with a route on /explore."

3. Public share: each proof has a permalink /proof/[mintAddress]:
   - Server fetch by mint address
   - Public read access (no auth)
   - Renders a single proof card with full metadata, route info, guide info
   - OG tags for social sharing

Acceptance:
- After completing a trek end-to-end on devnet, calling /api/proof/mint mints a cNFT to the tourist's wallet.
- /proofs page displays the cNFT with correct metadata.
- /proof/[mintAddress] is publicly shareable and shows correct info.

Pitfalls:
- Bubblegum mint requires the Merkle tree to be initialized; if NEXT_PUBLIC_MERKLE_TREE is missing, the route returns a clear error, not a stack trace.
- Metadata JSON URI must be reachable publicly — Supabase Storage public bucket is fine.
- Don't allow re-minting for the same booking — check completion_proofs uniqueness.
- Platform keypair must NEVER be logged.
```

**Acceptance criteria:**
- One real cNFT mint after a completed trek.
- /proofs displays it.
- /proof/[mint] works publicly.

**Risks:**
- Merkle tree exhaustion at scale (16K mints for depth 14); plan for re-init.
- Platform keypair leakage.

---

### E2. Implement review submission and on-chain reputation update

**Purpose:** The reputation loop is what makes guides care about quality. Closes the trust feedback.

**Prompt:**
```
Build /api/reviews/route.ts and the review UI.

1. UI: on /trek/[bookingId] after booking.status='completed', show "Leave a review" form:
   - Star rating (1-5)
   - Comment textarea (max 2000 chars)
   - Submit button

2. /api/reviews/route.ts (POST):
   - Validate body with zod
   - Auth required
   - Verify: booking belongs to user, status='completed', no existing review (UNIQUE on booking_id+reviewer_id)
   - Insert reviews row
   - Trigger reputation sync:
     - Call tourchain_reputation.update_reputation with platform keypair (admin) — increments total_reviews, adds score*100 to total_score, increments completed_treks
     - Set reviews.on_chain_updated = true on success
   - Return { reviewId, onChainTx }

3. Reputation sync as background-safe operation:
   - If on-chain call fails, retry up to 3 times
   - If still failing, set on_chain_updated=false and return success on Supabase write only
   - Add a Supabase Edge Function `reputation-sync` that periodically retries failed on-chain updates

4. Update /guide/[id] page to show reviews list after the new review is added.

5. After submission, refresh the materialized view leaderboard:
   - Either via a Supabase trigger on reviews INSERT
   - Or via a scheduled function every 5 minutes

Acceptance:
- After completing a trek, a tourist can leave a review.
- The review appears on the guide's profile.
- The guide's on-chain reputation PDA reflects the new score (verifiable via Solana Explorer).

Pitfalls:
- Don't double-count reviews if the user submits twice in rapid succession — UNIQUE constraint + idempotency.
- The on-chain update is admin-signed; never let the user submit on-chain reputation directly.
- Materialized view refresh on every review insert is expensive at scale; batch via cron.
```

**Acceptance criteria:**
- Review → guide reputation update visible on-chain.

**Risks:**
- On-chain retry logic loops if program is broken.
- Score inflation if duplicate reviews not prevented.

---

### E3. Wire leaderboard to real data

**Purpose:** Replace any leaderboard placeholders with real materialized view data.

**Prompt:**
```
Build/fix apps/web/src/app/(app)/leaderboard/page.tsx.

1. Server-side fetch: SELECT * FROM leaderboard ORDER BY position LIMIT 50.

2. Display:
   - Top 3 with podium-style cards (1st, 2nd, 3rd)
   - Ranks 4-50 as a sortable table: Rank, Display name, XP, Completions, Unique places visited
   - Avatar from users.avatar_url
   - Click on a name → /traveler/[userId] (V1 — for now just disable click)

3. Empty state: if leaderboard has < 3 rows, show "Be the first to climb the rankings."

4. Filter chips: All-time / This month / This week (use materialized view variants if needed; for MVP, all-time only).

5. Refresh: a Supabase trigger or Edge Function cron should refresh `leaderboard` materialized view at most every 5 minutes.

Acceptance:
- Leaderboard page shows real users sorted by XP.
- Empty state when fewer than 3 entries.

Pitfalls:
- Materialized view staleness: ensure refresh fires on review insert OR on a schedule.
- PII concern: only show display_name, never email or wallet_address.
```

**Acceptance criteria:**
- Real users on leaderboard.
- No fake placeholder rankings.

**Risks:**
- Stale view shows out-of-date ranks.

---

## F. Admin & Safety

---

### F1. Build /admin guide verification queue

**Purpose:** Trust starts here. No guide on the platform without admin approval.

**Prompt:**
```
Build apps/web/src/app/(admin)/admin/guides/page.tsx.

1. Auth: admin-only via middleware (users.role='admin').

2. Sections:
   a. "Pending verification" — guides with is_verified=false AND license_document_url IS NOT NULL
      - Each row: display_name, license number, document link, applied_at
      - "Approve" button → marks is_verified=true, sets verified_at and verified_by, calls tourchain_reputation.initialize_guide
      - "Reject" button → opens modal for rejection reason, marks rejected (or deletes the row + sends rejection email)
   b. "Active guides" — is_verified=true AND is_suspended=false
      - Search by name
      - "Suspend" button → calls tourchain_reputation.suspend_guide, sets is_suspended=true
   c. "Suspended" — is_suspended=true
      - "Reinstate" button → reverses suspension

3. Each verification action triggers an on-chain instruction signed by the admin platform keypair.

4. Audit log table admin_actions: { id, admin_id, action_type, target_id, notes, on_chain_tx, timestamp }. Insert a row for every admin action.

Acceptance:
- Admin can approve a pending guide; on-chain initialize_guide tx confirmed.
- Admin can suspend an active guide; on-chain tx confirmed.
- All actions logged to admin_actions table.

Pitfalls:
- Approving a guide who never linked their wallet will fail at initialize_guide. Show inline error: "Guide must link wallet before approval."
- Rejection should not delete the user account, only the guide application — preserve the audit trail.
```

**Acceptance criteria:**
- Full guide lifecycle controllable from admin panel.
- Every action logged.

**Risks:**
- Admin keypair compromise grants total platform control — store in Vercel encrypted env, never log.

---

### F2. Build /admin/disputes for dispute resolution

**Purpose:** Without dispute resolution, escrow trust collapses. This is the safety net.

**Prompt:**
```
Build apps/web/src/app/(admin)/admin/disputes/page.tsx and /api/admin/resolve-dispute/route.ts.

1. Display open disputes (status='open' or 'under_review'):
   - Each card: booking summary, filer (tourist or guide), category, description, evidence_urls
   - Both parties' contact info (display_name, wallet linked Y/N)
   - Booking history: check_ins, milestones_completed, current escrow state on-chain

2. Resolution actions:
   a. "Approve refund" — calls tourchain_escrow.resolve_dispute(10000) → 100% to tourist
   b. "Approve partial" — admin enters tourist_refund_bps (0-10000), calls resolve_dispute
   c. "Dismiss" — status='resolved_dismissed', no on-chain action
   d. Each requires admin to enter resolution_notes

3. After action:
   - Update disputes row (resolved_by, resolved_at, status)
   - Notify both parties (Supabase realtime + email if configured)
   - Log to admin_actions

4. SLA tracker at top: "{N} disputes open > 48 hours" highlighted in red.

Acceptance:
- Admin can resolve a real dispute on devnet, verifying escrow PDA changes accordingly.

Pitfalls:
- resolve_dispute can only run if escrow status='Disputed' — verify on-chain state before allowing the admin action.
- Don't expose evidence_urls publicly (RLS + signed URLs from Supabase Storage).
```

**Acceptance criteria:**
- End-to-end dispute resolution working.

**Risks:**
- Admin overreach: dispute resolution is a high-trust action; consider 2-of-2 admin signatures in V2.

---

### F3. Add safety guards to check-in and proof minting

**Purpose:** Defense against spoofing and fraud.

**Prompt:**
```
Harden the check-in and proof flows.

1. /api/checkin route:
   - Server-side recompute haversine using place coordinates from DB; do not trust client-supplied distance
   - Rate limit: 1 check-in per booking per place (UNIQUE constraint on check_ins table: booking_id + place_id)
   - Reject check-ins outside the booking's start_date - 1 day to end_date + 1 day window
   - Log unusual patterns (e.g., user "teleporting" between checkpoints faster than feasible) to a flagged_activity table

2. /api/proof/mint route:
   - Only mint if:
     a. booking.status='completed'
     b. completion_proofs has no row for this booking
     c. all required checkpoints have verified check_ins
     d. guide_co_signed_completion=true on the booking
   - Do not mint if any of these fail; return a clear error

3. Add a flag suspicious_booking on bookings table (default false). Flag any booking where:
   - 5+ check-ins within 1 hour
   - Check-in distances from previous exceed 50km/hour travel speed (impossible on foot)
   - Guide and tourist wallet are the same address (self-deal)

4. /admin dashboard adds a "Flagged" tab listing suspicious bookings for review.

Acceptance:
- An attacker cannot mint a proof for an incomplete trek.
- Suspicious patterns appear in admin flagged tab.

Pitfalls:
- False positives on flagged_activity for guides who legitimately teleport (e.g., between Kathmandu office and Lukla airport). Tune thresholds.
- Don't surface "suspicious" status to the tourist; only admins.
```

**Acceptance criteria:**
- Server-side enforced check-in + mint integrity.

**Risks:**
- Over-aggressive flagging blocks real users.

---

## G. Tests & Hardening

---

### G1. Anchor program test coverage

**Purpose:** Critical financial logic must be tested.

**Prompt:**
```
Add or expand Anchor tests for all three programs to cover happy path + at least one failure case per instruction.

1. tests/tourchain_reputation/:
   - initialize_guide: success, double-init rejection, non-admin rejection
   - update_reputation: success, score=0 rejection, score=6 rejection, suspended-guide rejection
   - suspend / reinstate: success, non-admin rejection
   Use anchor-bankrun or litesvm for fast in-memory testing.

2. tests/tourchain_escrow/:
   - Full lifecycle: create_escrow → activate → release_milestone (×N) → complete_booking; assert vault balance at each step
   - cancel_booking: success when Funded, rejection when Active
   - open_dispute → resolve_dispute with various tourist_refund_bps (0, 5000, 10000)
   - Failure: release_milestone called twice for same milestone
   - Failure: complete_booking before all milestones released

3. tests/tourchain_proof/:
   - initialize_proof_authority: success, non-admin rejection
   - mint_completion_proof: success, non-admin rejection, name-too-long rejection, uri-too-long rejection

4. CI workflow at .github/workflows/anchor.yml runs all three test suites on every PR.

Acceptance:
- `anchor test` passes locally and in CI.
- Each instruction has at least 1 happy + 1 failure test.

Pitfalls:
- Bubblegum CPI in tests requires either a real validator or mocking; using litesvm with bubblegum may need fixtures.
- Test wallets need devnet airdrops in CI; cache them in fixtures.
```

**Acceptance criteria:**
- All Anchor tests pass.
- CI runs them on every PR.

**Risks:**
- CI runtime explodes with on-chain integration tests; keep them in-process via litesvm.

---

### G2. Frontend integration tests for the core loop

**Purpose:** Catch UI regressions on the path that matters.

**Prompt:**
```
Add Vitest + React Testing Library tests for the critical flows.

1. apps/web/tests/booking-flow.test.tsx:
   - Mocks Supabase + Solana wallet
   - Renders /book/[serviceId] with seeded service
   - Walks through the 4 steps
   - Asserts /api/booking/prepare and /api/booking/confirm are called

2. apps/web/tests/checkin.test.tsx:
   - Mocks browser geolocation
   - Renders /trek/[bookingId] with a partially-completed booking
   - Tests: button disabled when far away, enabled when near, POST /api/checkin called with correct payload

3. apps/web/tests/auth-redirect.test.tsx:
   - Tests middleware behavior: unauthenticated → /login, non-admin → /dashboard from /admin

4. apps/web/tests/explore.test.tsx:
   - Mocks Supabase response with 5 routes
   - Asserts cards render, filter changes update visible cards

5. CI workflow .github/workflows/web.yml runs `npm test` and `npm run typecheck` on every PR.

Acceptance:
- All tests pass in CI.
- Coverage of booking, check-in, auth, explore.

Pitfalls:
- Mocking @supabase/ssr properly is non-trivial — use vi.mock at the top of test files.
- Geolocation API needs vi.stubGlobal('navigator', { geolocation: ... }).
```

**Acceptance criteria:**
- Critical flows tested in CI.

**Risks:**
- Brittle mocks → flaky tests; prefer integration tests against a local Supabase instance.

---

### G3. Input validation and rate limiting

**Purpose:** Protect trust boundaries.

**Prompt:**
```
Add zod validation and rate limiting to every API route.

1. Create apps/web/src/lib/validation/schemas.ts with zod schemas for every route's input:
   CreateBookingInput, CheckinInput, ReviewInput, WalletLinkInput, DisputeInput, ProofMintInput, AdminApproveGuideInput, AdminResolveDisputeInput.

2. Wrap every route handler with a `handle(req, schema, fn)` helper:
   - Validates body with schema.safeParse
   - Returns 400 with field errors on validation failure
   - Wraps fn in try/catch
   - Returns 500 with generic message on uncaught error
   - Logs full error server-side

3. Add rate limiting per route using Upstash or a Supabase-backed counter:
   /api/auth/link-wallet — 5/min per IP
   /api/checkin — 10/min per user
   /api/booking/prepare — 20/min per user
   /api/booking/confirm — 20/min per user
   /api/reviews — 10/min per user
   /api/proof/mint — 5/min per user
   /api/admin/* — 60/min per admin user

4. Add a global error.tsx boundary at apps/web/src/app/error.tsx with friendly fallback UI.

Acceptance:
- Malformed body to /api/checkin returns 400 with field-level zod messages.
- Exceeding rate limit returns 429.
- Crashed route returns 500 with generic message; full stack trace in server logs only.

Pitfalls:
- Don't return raw zod errors directly to client (may leak schema internals); transform to a clean { errors: [{ field, message }] }.
- Rate limit by user OR IP — falling back to IP for unauthenticated routes.
```

**Acceptance criteria:**
- Every API route validated and rate-limited.

**Risks:**
- Aggressive rate limits break legitimate flows (e.g., a slow CI test).

---

## H. Demo Polish

---

### H1. Seed a "demo journey" that's visible from the landing page

**Purpose:** A new visitor can see a completed trek as social proof.

**Prompt:**
```
Create a demo data set that proves the loop end-to-end.

1. Run scripts/seed-demo-journey.ts that, on devnet:
   - Creates a demo tourist user (with a known test wallet)
   - Creates a booking for "Annapurna Base Camp" with a verified guide
   - Funds the escrow
   - Simulates check-ins at all 3 demo checkpoints (admin-signed, marked verified=true)
   - Releases all milestones
   - Mints a proof cNFT
   - Posts a 5-star review

2. On the landing page, add a "Recently completed" section:
   - Display the demo journey: "Demo Tourist completed Annapurna Base Camp with Guide Ram Gurung — proof minted on {date}"
   - Link to /proof/[mintAddress] (the public proof permalink)
   - Link to Solana Explorer for each on-chain artifact (escrow, proof mint, reputation update)

3. Mark the demo entry visibly: "Demo journey — devnet only" with a small badge.

Acceptance:
- The landing page shows one completed trek with three Explorer links to verifiable on-chain artifacts.

Pitfalls:
- The demo journey should not leak the test wallet's private key or be reproducible by anyone — use admin-signed instructions where the tourist signature would be required.
- Don't let demo data appear in production stats (filter `is_demo=true` from leaderboard, real bookings count, etc.).
```

**Acceptance criteria:**
- Visible proof of the loop on the landing page.

**Risks:**
- Demo data contaminating real metrics.

---

### H2. Mobile QA pass

**Purpose:** Tourists trekking will use phones. The product must work on mobile.

**Prompt:**
```
Run a mobile QA pass on every key page using Chrome DevTools mobile emulation (iPhone 14, Pixel 7).

For each page below, verify:
- All content visible without horizontal scroll
- CTAs reachable with thumb (bottom 1/3 of viewport)
- Maps render and are interactable
- Forms usable with mobile keyboard
- Loading states visible on slow 3G
- No tap targets smaller than 44x44px

Pages to check:
- / (landing)
- /explore
- /route/[id]
- /guide/[id]
- /login, /signup, /onboard
- /book/[serviceId]
- /trek/[bookingId]
- /proofs
- /dashboard

For each issue found, file a fix in the same commit.

Acceptance:
- Every key page works on a real iPhone and a real Android device (use Vercel preview URL).
- No horizontal scroll.
- All CTAs tappable.

Pitfalls:
- Mapbox on mobile can be janky — disable rotation and pitch on small screens.
- Modal dialogs and date pickers behave differently on iOS Safari; test specifically.
```

**Acceptance criteria:**
- Full flow completable on a phone.

**Risks:**
- Mapbox mobile performance issues.

---

### H3. Final demo recording + landing page proof links

**Purpose:** The submission needs a 2-minute video that walks the loop, plus on-page evidence anyone can verify.

**Prompt:**
```
Produce final demo assets.

1. Record a 2-minute screen capture walking through:
   - Landing page → /explore → click Annapurna Base Camp
   - View guide profile, see on-chain reputation
   - Book trek with funded test wallet
   - Show escrow tx on Solana Explorer
   - Simulate check-in (or fast-forward to next step)
   - Show milestone release tx
   - Show proof cNFT in /proofs
   - Show updated guide reputation on-chain

2. Embed the video on the landing page below the hero in a "See it in action" section. Use a click-to-play poster image (don't autoplay).

3. Add a "Verify on-chain" footer section to the landing page with:
   - Reputation program: explorer.solana.com/address/{ID}?cluster=devnet
   - Escrow program: same
   - Proof program: same
   - Demo escrow account: link to a real BookingEscrow PDA from the demo journey
   - Demo proof mint: link to a real cNFT from the demo journey

4. Update README with the demo video link and the same Explorer URLs.

Acceptance:
- A judge clicking the demo video understands the product in 2 minutes.
- Every claim on the landing page links to a verifiable on-chain artifact.

Pitfalls:
- Don't put the video as a background hero — it's distracting and slows page load.
- Make the video downloadable from a public URL (e.g., S3 or unlisted YouTube).
```

**Acceptance criteria:**
- Submission-ready demo asset on landing page.
- All on-chain claims verifiable via links.

**Risks:**
- Video file size hurts page performance — host externally and embed via iframe.

---

## Execution Order Summary

1. **A1 → A2 → A3** — clean the repo and verify ground truth
2. **B1 → B2 → B3** — populate database, fix auth, set Vercel env (B3 unblocks the live demo immediately)
3. **C1 → C2 → C3 → C4 → C5** — rebuild user-facing surfaces in priority order
4. **D1 → D2 → D3** — implement the booking + check-in + guide loops
5. **E1 → E2 → E3** — close the loop with proof and reputation
6. **F1 → F2 → F3** — admin and safety
7. **G1 → G2 → G3** — tests and hardening
8. **H1 → H2 → H3** — demo polish

**The single most impactful prompt is B3.** Run it first if you only run one. The infrastructure is built; production is unconfigured.