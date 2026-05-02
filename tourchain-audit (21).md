# TourChain — Demo + Repo Audit

**Live demo:** https://tour-chain.vercel.app/
**Repo:** https://github.com/Bikashkc613/Tour_chain
**Audited:** May 1, 2026

---

## A. Executive Summary

TourChain has executed the refactor cleanly — three real Anchor programs with assigned devnet IDs, Supabase migrations in place, the Express/MongoDB backend gone, the broken SDK gone. The codebase is now coherent and matches the strategy. **But the live demo proves none of it.** Every counter on every page reads zero. Explore shows "0 routes." Vibe shows "0 NFTs." DAO shows "0 cases." The product currently exists as architecture without evidence — a polished shell over a database that has no data and on-chain programs with no transactions. The gap between what is built and what is visible is the entire problem.

---

## B. Current Product Identity

The honest framing: **TourChain is a trust-and-proof platform for adventure tourism, currently shipped as a beautiful but empty marketing site backed by real but un-exercised infrastructure.**

The repo says one thing clearly: tourism platform with Solana for trust. The demo shows something muddier — there's a `/dao` page (DAO scope-creep that the refactor was supposed to delete), a `/vibe` page (rebranded NFT collection), and `/explore` with no routes. The branding still says "Tourism Chain Nepal" while the repo says "TourChain." The product hasn't decided which name it owns.

**What it should be called:** a tourism trust platform that uses Solana as plumbing. Not a quest game. Not a DAO. Not a Solana app. The blockchain is infrastructure, not the product.

The intended core loop:
```
Browse routes → Pick verified guide → Book + escrow funds
→ Trek → Check in at GPS checkpoints → Guide co-signs completion
→ Funds release per milestone → cNFT proof minted → Review → Reputation updates
```

**Whether that loop currently works end-to-end:** No. Browsing shows zero routes. Booking is unreachable without data. Without bookings, no escrow runs. Without escrow, no proofs mint. The loop is implemented in code but never executed in production.

---

## C. Live Demo Audit

| Page | What it shows | What it proves |
|---|---|---|
| `/` (landing) | "Forge Your On-Chain Odyssey," value props, three counters all reading 0 | Brand and tagline only. Zero stats undermine the trust pitch. |
| `/explore` | Filter UI, map placeholder, "0 routes found" | The seed migration didn't run against this Supabase project, OR the frontend doesn't query routes correctly. |
| `/dashboard` | Redirects to `/login` | Auth wired. Cannot evaluate dashboard without an account. |
| `/vibe` | NFT proof gallery, all counters at 0, "Live on Solana Devnet" badge | UI exists; no proofs have been minted. |
| `/dao` | Dispute governance UI with "0 cases" | Out-of-scope per strategy — should have been deleted in refactor, still shipping. |
| `/onboard` | 4-step wizard: Identity → Passport → Treasury → Embark | Onboarding flow exists; can't test without wallet. |

**First impression:** Premium visual design. The hero, copy, and motion all signal "real product."

**Clarity of value prop:** The tagline ("Trustless bookings, verifiable experiences, reputation layer") is sharp. But the three counters reading 0 directly contradict the claim of an active platform.

**Whether the flow makes sense:** The intended flow isn't reachable. There are no routes to click into, so there is no booking, so there is no escrow demo, so there is no proof. A judge clicking through has nothing to do.

**Whether the demo feels real:** No. It feels like a skin. The Vercel landing page has more brand polish than substance.

**Whether the demo proves the product:** It proves UI capability and ambition. It does not prove a single transaction, booking, escrow, check-in, or mint has ever occurred.

**Coherence with codebase:** Partially. The repo has three real programs with devnet IDs (`BxgSb…`, `B1M6g…`, `EvRzd…`) — but the demo never references on-chain state from those programs anywhere visible. The `/dao` page implies a fourth program that the refactor explicitly removed. Either that page is mock UI or there's scope drift.

---

## D. Codebase Audit

The repo has been refactored. The earlier audit (`report.md`, still in the repo and now stale) described 9 programs + Express + MongoDB. That state is gone.

### Confirmed (from repo file tree + Anchor.toml + README)

**Solana programs — three, IDs assigned:**
- `tourchain_reputation` → `BxgSbUELdL9cCj4hETtFJqyzDqFeRKAYefWBnVpDXk3L`
- `tourchain_escrow` → `B1M6gHx7W2tKPWwEEuKaumyk2H8zdETZGoBCDt9yamrt`
- `tourchain_proof` → `EvRzd8MXqxojEmn4jViXv8NyxVXoU3X1gEuSv1tw9qML`

**Repo structure:**
- `apps/web/` — Next.js app
- `programs/` — three Anchor programs
- `supabase/migrations/` — schema + RLS + seed
- `tests/` — directory exists
- `scripts/` — helper scripts
- `contracts/` — separate from `programs/` (suggests legacy or alternative implementation; needs investigation)
- `.github/workflows/` — CI configured
- `Anchor.toml` — wallet path uses forward slash (Linux-compatible)
- `tourchain-strategy.md`, `Prompts.md`, `report.md`, `claude-session.jsonl` — documentation/audit artifacts

**Removed since the earlier audit:**
- `backend/` (Express + MongoDB) — gone
- `sdk/` — gone (frontend now imports IDLs directly)
- Six dead programs — gone

### Likely (inferred from README + demo behavior)

- Auth uses Supabase email + wallet signature flow (login page redirects work).
- Frontend reads from Supabase but the production Supabase project is either empty (seed never run) or the queries are misconfigured.
- Anchor litesvm tests claimed in README ("23 tests, all passing") — confirmed presence of `tests/` directory but coverage of all three programs not verified from outside the repo.
- Mapbox is wired through env var (no map renders in the demo, suggesting `NEXT_PUBLIC_MAPBOX_TOKEN` is missing in Vercel env).

### Unknown (cannot verify externally)

- Whether the Bubblegum Merkle tree was actually created on devnet via `init-merkle-tree.ts`.
- Whether IDLs in `apps/web/src/lib/solana/idl/` are current with the deployed programs.
- Whether `/dao` page is a hardcoded UI shell or actually wired to a backend (likely the former).
- Whether the seed migration ran on the production Supabase or only locally.
- Whether `contracts/` directory contains legacy Anchor code that should have been deleted.

### Architecture findings

**Single source of truth:** Mostly achieved. Supabase owns relational data. Solana owns reputation/escrow/proof. No more parallel Express+MongoDB.

**One auth flow:** Single Supabase Auth. Wallet linking via signature. Confirmed by `/login` and `/onboard` behavior.

**Three programs, not nine:** Achieved.

**Coherence:** The code matches the strategy. The demo does not match the code.

### Security and trust observations

- `NEXT_PUBLIC_ADMIN_PUBKEY` in env (per README) — admin gating done client-side as well as on-chain. Acceptable if on-chain checks are enforced.
- The README claims GPS check-in is server-side validated (Haversine, 500m gate) — cannot verify externally, but this is the right pattern.
- Wallet signature linking is implied — cannot verify the nonce-replay protection without inspecting the route handler source.
- `claude-session.jsonl` checked into repo — this is typically AI tooling state, harmless but unusual to ship.

### Architecture duplication

- `contracts/` AND `programs/` — two top-level directories that may both contain Solana-related code. If `contracts/` is legacy Solidity or pre-Anchor scaffolding, delete it.
- `Prompts.md` + `tourchain-strategy.md` + `report.md` + `claude-session.jsonl` — four overlapping documentation artifacts. `report.md` is stale (still describes 9 programs + Express). At least two of these should be archived or merged.

### Dead code / stubs

- `report.md` is stale. Either update or delete.
- `/dao` page in the demo references functionality not in the three-program architecture. Either it's a mock UI shell (delete) or a fourth program crept back in (audit and decide).
- `/vibe` page rebrand: marketing-friendly, but the backing data model in the strategy calls these `completion_proofs`. Make sure both names don't coexist in code.

### Config / environment

- `.env.example` exists — good.
- `Anchor.toml` wallet path fixed (forward slash) — good.
- Vercel deployment lives at `tour-chain.vercel.app` (with hyphen), README references both `tour-chain.vercel.app` and `visitchain.vercel.app` (404'd in earlier conversation) — the alias situation is unclear and is a likely source of confusion.
- Empty production data suggests `SUPABASE_SERVICE_ROLE_KEY` may not be set in Vercel, or the seed migration was never applied to the hosted Supabase project.

---

## E. What Is Working

1. Three Anchor programs compile, have real PDAs, and are deployed/declared on devnet (program IDs in `Anchor.toml`).
2. Supabase schema with RLS and seed data exists in `supabase/migrations/`.
3. Frontend deploys cleanly to Vercel.
4. Auth route protection works (`/dashboard` redirects to `/login`).
5. Onboarding flow exists with multi-step UI.
6. README is comprehensive, accurate, and matches the current architecture.
7. CI workflow file exists in `.github/workflows/`.
8. Brand and visual design are above the bar for hackathon submissions.

---

## F. What Is Broken

1. **Production Supabase is empty or unreachable.** "0 Verified Routes Available" on `/explore` despite `0004_seed.sql` existing in the repo. Either the seed wasn't applied to the hosted DB or the frontend Supabase env vars point elsewhere.
2. **Three landing-page counters all read 0.** "0 Tourists Onboarded / $0 in Escrow / 0 NFTs Minted." The demo accidentally proves the platform has zero usage rather than concealing it.
3. **Mapbox map doesn't render** on `/explore` (only emoji and "0 locations"). `NEXT_PUBLIC_MAPBOX_TOKEN` likely missing in Vercel.
4. **Vercel alias confusion.** README, prior audits, and conversation reference both `tour-chain.vercel.app` and `visitchain.vercel.app` — only the hyphenated one resolves.
5. **No demo path completes the core loop.** A visitor cannot browse a real route, book a real guide, fund an escrow, check in, or see a minted proof. Every demonstrable user journey terminates at empty state.

---

## G. What Is Missing

1. **A populated production database.** The migrations must run against the hosted Supabase, not just local.
2. **At least one demonstrable booking on devnet.** Even a single "demo booking" with a Solana Explorer link as evidence would transform the credibility of the demo.
3. **At least one minted cNFT proof** to populate `/vibe`.
4. **A live guide profile page** (`/guide/[id]`) that judges/users can click into.
5. **Real numbers on the landing page.** Either real counts from Supabase, or remove the counters entirely. Zeros are worse than absence.
6. **A "Demo Mode" or "Try as guest" path** so visitors who don't connect a wallet can still witness the loop.
7. **Visible Solana Explorer links** to the deployed programs and a sample transaction. Right now there's no proof anything is on-chain.
8. **Mobile-responsive verification** — design is responsive in the strategy but unverified on the live deploy.

---

## H. What Is Fake / Placeholder / Overbuilt

**Placeholder:**
- All landing counters (0/0/0) — placeholder pretending to be real metrics.
- `/explore` map area — UI without map.
- `/vibe` proof grid — UI without proofs.

**Overbuilt:**
- `/dao` page. The refactor explicitly removed DAO governance from scope. Its presence suggests scope drift or leftover UI from a deleted feature. **Delete it.**
- The 4-step `/onboard` flow ("Identity → Passport → Treasury → Embark") may be more ceremony than the user needs. A wallet connect + email = enough.
- Two co-existing names: "Tourism Chain Nepal" (in the live page title) and "TourChain" (in the repo and README). Pick one.

**Fake:**
- Three landing counters reading "0 Tourists Onboarded / $0 in Escrow / 0 NFTs Minted" presented as if they were real metrics. Hardcoded zeros are a placeholder masquerading as data.

---

## I. What Should Be Removed or Simplified

| Item | Action |
|---|---|
| `/dao` page and any code supporting it | Delete. DAO is out of scope per strategy. |
| `report.md` (stale audit of pre-refactor state) | Archive or delete — it describes a codebase that no longer exists and confuses readers. |
| `claude-session.jsonl` | Move out of the repo or `.gitignore` it — internal tooling artifact. |
| `contracts/` directory (if legacy, unverified) | Inspect and delete if it duplicates `programs/`. |
| Three landing-page counters | Either wire to real Supabase counts or remove entirely. Hardcoded zeros are worse than nothing. |
| 4-step onboarding | Collapse to 2 steps: connect wallet, optional email. The "Treasury" and "Passport" steps are theater. |
| Dual branding ("Tourism Chain Nepal" vs "TourChain") | Pick one. Update layout title, README, hero copy uniformly. |
| `/vibe` and `/dao` route names | Reconsider. They're cute but disconnect from the trust-tourism narrative. `/proofs` and (if kept) `/disputes` are clearer. |

---

## J. What the Product Should Really Be

A trust-first booking platform for Nepal trekking, demonstrably working with at least one real route, one real guide profile, one fundable booking, one reachable check-in, and one mintable proof. The Solana layer is the trust spine, not the marketing pitch.

The single sentence that should appear on the landing page:

> "Book a verified Nepal trekking guide, pay into a trustless escrow, prove your journey on-chain."

Three actions the visitor should be able to take in under 30 seconds:
1. See real routes on a real map.
2. Click into a real guide profile with a real reputation score from on-chain state.
3. Either initiate a demo booking with devnet SOL OR view a sample completed booking on Solana Explorer.

If the visitor can do those three things, the product is real. If they cannot, the product is a brand asset.

---

## K. Recommended MVP

The MVP that proves TourChain works is the **smallest possible end-to-end execution of the core loop with real on-chain evidence.**

**Build first (in order):**

1. **Run the seed migration against the production Supabase.** This alone makes `/explore` go from "0 routes found" to a populated map. Highest-impact single action.
2. **Set `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel.** Map renders. Demo becomes visually credible.
3. **Run a single end-to-end booking flow on devnet** with a test wallet, capture the transaction signatures, and pin them to the landing page as "Live transactions on Solana Explorer →" links.
4. **Mint one completion proof** to a test wallet so `/vibe` has at least one card.

**Build second:**

5. Wire the three landing-page counters to real Supabase aggregates. Remove if data is too thin (one is better than zero).
6. Build a live guide profile page that fetches the on-chain `GuideReputation` PDA and displays the score.
7. Add Solana Explorer deep-links from any page that references on-chain state.

**Build third:**

8. Polish: loading states, error toasts, mobile QA, animation on completion.
9. Two-minute demo video walking through the core loop using the seeded data.
10. Delete `/dao`, `/vibe` rebrand decisions, dual-name cleanup.

---

## L. Recommended Next 7 Days

| Day | Focus | Definition of done |
|---|---|---|
| 1 | Make `/explore` real | Production Supabase has all 5 routes, 15 places, 3 guides, 10 quests. Mapbox token set. Map renders. |
| 2 | Real guide profile | `/guide/[id]` page fetches `GuideReputation` PDA from devnet and displays score. At least one guide profile reachable from `/explore`. |
| 3 | Devnet booking | Test wallet completes one full booking. Capture the create-escrow tx signature. Link visible from a "Demo Bookings" section. |
| 4 | Devnet completion + proof mint | Same booking advances through milestones, completes, mints one cNFT to a test wallet. Show the cNFT on `/vibe`. |
| 5 | Connect counters | Landing page numbers come from real Supabase counts. Remove `/dao`. Reconcile branding. |
| 6 | Polish + mobile | Loading states, error handling, mobile pass on every key page. Solana Explorer links wherever on-chain state is referenced. |
| 7 | Demo asset + record | Two-minute video walkthrough. Updated README screenshots. One-page pitch deck. Audit checklist before submission. |

---

## M. Final Verdict

The codebase is a near-product. The demo is a prototype. **The team has built more than they're showing.** That is a recoverable problem and a much better problem to have than the inverse.

The refactor instinct was correct: dropping six programs, deleting the duplicate backend, fixing the broken SDK. That work is done and the architecture is sound. What's left is execution discipline, not engineering — populate the database, set the env vars, run the loop once on devnet, and stop hiding the work behind zero-counters.

**Direction:** Sound. Tourism trust platform with Solana-as-infrastructure is the right framing.

**Scope:** Should narrow further. Delete `/dao` for real this time. Resist the pull to add new pages until the existing ones display non-zero data.

**Repo state:** Near-product, missing only deployment hygiene and a populated production database to flip into a believable MVP.

**Demo state:** Prototype masquerading as something more polished. Honesty would help — even a single "Demo Booking — view on Solana Explorer" link does more for credibility than the current empty counters.

**Should the team narrow scope before building more:** Yes. The next commit should be `supabase db push --linked` against production, not a new feature.

**Biggest risk:** The team confuses architectural completeness with product completeness. The repo is impressive. The demo proves nothing. Judges and users see the demo, not the repo. Close that gap before adding anything new.

---

*The work is real. Make it visible.*
