# Living AI Garden

A reflective chat app where conversations with **the Gardener** grow into a personal 3D garden. Each thread plants a flower whose species, color, and the sky’s weather reflect the emotional tone of your exchange.

**Live demo:** [living-ai-garden.r-rababzahra888.workers.dev](https://living-ai-garden.r-rababzahra888.workers.dev)

Logged-out visitors see a **developer showcase garden** on the landing page — flowers, trees, huts, sun/moon, and cycling weather — before signing in.

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 |
| Build / SSR | [Vite 8](https://vite.dev) + [Nitro](https://nitro.build) (Cloudflare Workers preset) |
| 3D garden | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + Three.js + `@react-three/drei` + `@react-three/postprocessing` |
| UI | Tailwind CSS 4, Radix UI, shadcn-style components |
| Auth & data | [Supabase](https://supabase.com) (Auth, Postgres, RLS) |
| AI | OpenAI `gpt-4o-mini` with **Groq** and **Gemini** fallbacks |
| Deploy | Cloudflare Workers |

**Node:** `>= 22.12.0`

---

## Features

### Chat & emotions
- **Gardener chat** — Warm, brief replies in a garden-themed voice; threads persist in Supabase.
- **Sassy gardener** — When you're upbeat or playful, the Gardener can tease back with dry wit and affectionate roasts — never cruel, always kind underneath.
- **Emotion → flower mapping** — 27 emotions (happy, melancholy, heartbroken, playful, …) each map to a flower species, hue, and weather mood via an LLM classifier with keyword fallback.
- **LLM fallbacks** — If OpenAI hits quota/rate limits, chat tries Groq then Gemini automatically (`src/lib/llm-providers.ts`).
- **Content safety** — User messages are screened before the LLM runs (`src/lib/content-safety.ts`). Crisis/self-harm language gets a fixed caring reply with **988** (US) and emergency-line guidance — no normal chat reply. Sexual or explicit messages get a firm boundary response; the Gardener won't engage. See [Safety](#safety) below.

### 3D garden
- **Living meadow** — Terrain, pond, grass, drifting clouds, butterflies, trees, and huts that scale with garden energy.
- **Garden boundary** — A fence marks the planting zone; new flowers spawn inside it.
- **Arrange flowers** — **Arrange** mode lets you drag flowers to new spots; positions save to Supabase when you release or tap **Done**.
- **Unique 3D blooms** — Every catalog species has its own procedural flower shape (`SpeciesBlooms.tsx`).
- **Day / night** — Sun disc by day; starry sky with milky way, aurora, moon phases, and shooting stars at night.
- **Mood weather** — Clear skies, rainbow, or gentle rain driven by conversation tone; rain/rainbow **fade after a while** and return when feelings update (not stuck forever).
- **Flower growth** — Each thread grows a flower over messages; jokes “water” it for a growth boost.

### Progression & memories
- **Garden energy** — Earned from new flowers and messages; never lost when you remove a chat.
- **Scaling visuals** — More energy unlocks more trees, butterflies, and huts in the scene.
- **Memories** — Deleting a conversation soft-deletes its seed: chat goes away, but a numbered stone marker stays in the garden and energy is kept.

### Auth & UX
- **Auth** — Email/password sign-in and sign-up, password reset, and Google OAuth.
- **Landing showcase** — Lite-performance demo garden for visitors (6 sample flowers, cycling day/night + weather).
- **Promo tour** — `/promo` screen-recordable feature walkthrough for sharing the app.
- **Mobile-friendly HUD** — Collapsible stats panel; icon-only top actions on small screens.
- **Resilient loading** — Timeouts and error panels instead of infinite spinners when auth or data loads stall.

---

## Safety

**Living AI Garden is not a crisis service or a substitute for professional help.** The Gardener is a lightweight chat character in a hobby app.

Before any LLM call, each user message is checked with pattern-based rules in `src/lib/content-safety.ts`:

| Trigger | Behavior |
| --- | --- |
| **Crisis / self-harm** (e.g. suicide, self-harm, wanting to die) | Skips the LLM. Returns a fixed, caring message pointing to **988** (US Suicide & Crisis Lifeline), **911** for immediate danger, and local crisis lines elsewhere. Flower growth is not boosted for that message. |
| **Sexual / explicit** content | Skips the LLM. Returns a short boundary message — the garden is for feelings and jokes, not sexual chat. Flower mood trends **unimpressed**; no growth boost. |
| **Everything else** | Normal Gardener reply (with optional sass when the tone is positive/playful). |

**Limitations:** Keyword/pattern matching can miss nuanced cases or false-positive on edge phrasing. It is a basic guardrail, not clinical screening. If you or someone you know is in crisis, contact a qualified professional or emergency service directly.

To adjust patterns or canned replies, edit `src/lib/content-safety.ts` and the handler in `src/lib/chat.functions.ts`.

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd living-ai-garden
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL (Vite bundle) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase anon/publishable key |
| `VITE_APP_URL` | Browser | App origin (e.g. `http://localhost:8080`) |
| `SUPABASE_URL` | Server | Same URL for SSR / server functions |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Same key for SSR / server functions |
| `OPENAI_API_KEY` | Server | Gardener chat + emotion classifier |
| `GROQ_API_KEY` | Server | Optional fallback LLM ([Groq console](https://console.groq.com)) |
| `GEMINI_API_KEY` | Server | Optional fallback LLM ([Google AI Studio](https://aistudio.google.com/apikey)) |

Never commit `.env`.

### 3. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations in the SQL editor (or via CLI), **in order**:

   - `supabase/migrations/20260703172334_ad9fd993-16a6-4ac0-a28d-52e970979a19.sql` — `threads`, `messages`, `seeds`, RLS
   - `supabase/migrations/20260705013000_garden_energy_and_memories.sql` — `user_garden` energy, seed soft-delete / memory columns

3. **Authentication → URL configuration**
   - Site URL: `http://localhost:8080` (and your production URL)
   - Redirect URLs: `http://localhost:8080/**`, your production origin + `/auth`

4. **Email auth** — Enable email provider; configure confirmation settings as you prefer.

5. **Google OAuth (optional)** — Enable Google provider in Supabase, add the same Client ID/secret in Google Cloud Console, and set the callback to:

   `https://<project-ref>.supabase.co/auth/v1/callback`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

---

## Build

```bash
npm run build
```

The build script syncs `SUPABASE_*` → `VITE_*` when needed, then outputs a Cloudflare-ready bundle under `.output/`.

Preview the production build locally:

```bash
npm run preview
```

Other scripts:

```bash
npm run lint      # ESLint
npm run format    # Prettier
npm run verify:ci # clean install + build (CI-style)
```

---

## Deploy (Cloudflare Workers)

Cloudflare uses **two env buckets**. Build vars bake into the browser bundle; runtime secrets power SSR and chat. They do not carry over between each other.

### One-time setup (stop re-pasting keys every deploy)

**1. Runtime secrets** — from your machine, once:

```bash
npx wrangler login   # first time only
npm run cf:secrets   # reads .env → uploads to worker "living-ai-garden"
```

This uses `wrangler secret bulk`. Secrets persist on the worker until you change them.

**2. Build variables** — Cloudflare dashboard → **Settings → Builds → Build variables** (set once):

| Variable | Example |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon/publishable key |
| `VITE_APP_URL` | `https://living-ai-garden.r-rababzahra888.workers.dev` |

**3. Deploy settings** — Build command: `npm run build`, Deploy command: `npx nitro deploy --prebuilt`.

The repo’s [`wrangler.toml`](wrangler.toml) sets `keep_vars = true` so git deploys **do not wipe** secrets you already set in the dashboard or via `cf:secrets`.

> Do **not** rely on the “paste .env on Deploy” dialog for every push — that’s for one-off deploys. Use **Variables and secrets** or `npm run cf:secrets` once instead.

### Optional: auto-sync secrets on every git deploy

If you prefer secrets to refresh from CI on each deploy, add these as **encrypted** Build variables in Cloudflare (same names as runtime), then change **Deploy command** to:

```bash
npm run cf:secrets:ci && npx nitro deploy --prebuilt
```

Still set the three `VITE_*` build variables above for the browser bundle.

### When keys change

- **Runtime** (chat / SSR): run `npm run cf:secrets` again, or update **Variables and secrets** in the dashboard.
- **Browser** (`VITE_*`): update Build variables and trigger a new build.

Connect the repo to Cloudflare Workers Builds (or push to the connected branch) so pushes to `main` deploy automatically.

---

## Project layout

```
src/
  routes/                    # TanStack Router (landing, auth, garden, chat)
  components/
    garden3d/
      scene/                 # R3F scene: terrain, flowers, sky, weather, post-FX
      ui/                    # HUD, landing overlay, chrome
    auth/                    # Google sign-in, flying leaves background
  lib/
    chat.functions.ts        # Server functions: chat, threads, delete, flower position
    content-safety.ts        # Crisis + explicit content screening (pre-LLM)
    garden-emotions.ts       # Emotion catalog + LLM classifier
    garden-energy.ts         # Energy math + visual scaling
    flower-mood.ts           # Keyword fallback for mood → species
    llm-providers.ts         # OpenAI / Groq / Gemini with fallback chain
    garden3d/
      demo-garden.ts         # Landing-page showcase seeds
      garden-weather.ts      # Mood → clear / rainbow / rain
      use-transient-weather.ts
      moon-phase.ts          # Real-date lunar phases
      night-sky-shaders.ts   # Procedural night dome GLSL
supabase/migrations/         # Database schema
scripts/                     # Build helpers (env sync, native bindings)
```

---

## How mood → garden works

1. User sends a message; **content safety** runs first (`checkContentSafety`).
2. If the message is flagged (crisis or sexual), a **fixed Gardener reply** is stored — the LLM is not called for that turn.
3. Otherwise the Gardener replies via the LLM chain (Groq → Gemini → OpenAI, first configured wins).
4. A small classifier picks an emotion from `GARDEN_EMOTION_CATALOG` (27 entries).
5. That emotion sets the flower **species**, **hue**, and contributes to **garden weather**.
6. The seed for that thread is created or updated in Supabase and rendered in the 3D scene.
7. **Weather episodes** (rain/rainbow) run for a while, then fade; new messages or mood changes bring them back.
8. **Deleting a thread** soft-deletes the seed (`deleted_at`) — the flower becomes a numbered **stone** marker; garden energy is unchanged.
9. **Arrange mode** updates seed `x`/`y` in the database so flower layout persists across refreshes.

If the classifier is uncertain, keyword matching in `flower-mood.ts` provides a fallback.

---

## License

Private project — all rights reserved unless otherwise noted.
