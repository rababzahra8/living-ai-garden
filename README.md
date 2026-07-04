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
- **Emotion → flower mapping** — 27 emotions (happy, melancholy, heartbroken, playful, …) each map to a flower species, hue, and weather mood via an LLM classifier with keyword fallback.
- **LLM fallbacks** — If OpenAI hits quota/rate limits, chat tries Groq then Gemini automatically (`src/lib/llm-providers.ts`).

### 3D garden
- **Living meadow** — Terrain, pond, grass, drifting clouds, butterflies, trees, and huts that scale with garden energy.
- **Unique 3D blooms** — Every catalog species has its own procedural flower shape (`SpeciesBlooms.tsx`).
- **Day / night** — Sun disc by day; starry sky with milky way, aurora, moon phases, and shooting stars at night.
- **Mood weather** — Clear skies, rainbow, or gentle rain driven by conversation tone; rain/rainbow **fade after a while** and return when feelings update (not stuck forever).
- **Flower growth** — Each thread grows a flower over messages; jokes “water” it for a growth boost.

### Progression & memories
- **Garden energy** — Earned from new flowers and messages; never lost when you archive a chat.
- **Scaling visuals** — More energy unlocks more trees, butterflies, and huts in the scene.
- **Memories** — Deleting a conversation soft-deletes its seed: chat goes away, but a numbered gray marker stays in the garden and energy is kept.

### Auth & UX
- **Auth** — Email/password sign-in and sign-up, password reset, and Google OAuth.
- **Landing showcase** — Lite-performance demo garden for visitors (6 sample flowers, cycling day/night + weather).
- **Mobile-friendly HUD** — Collapsible stats panel; icon-only top actions on small screens.
- **Resilient loading** — Timeouts and error panels instead of infinite spinners when auth or data loads stall.

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

Cloudflare needs **two separate** env configurations — build-time vars are not available at runtime.

### A) Runtime — Settings → Variables and secrets

Used when the worker handles SSR and chat:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `GROQ_API_KEY` (recommended)
- `GEMINI_API_KEY` (recommended)

### B) Build — Settings → Builds → Build variables

Baked into the browser bundle during `npm run build`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_URL` (your production URL, e.g. `https://living-ai-garden.r-rababzahra888.workers.dev`)

After changing **build** variables, trigger a new deploy with a fresh build. After changing **runtime** variables, saving in the dashboard is enough (no rebuild required).

Connect the repo to Cloudflare Workers Builds (or push to the connected branch) so pushes to `main` deploy automatically.

> **Lovable:** This repo syncs with [Lovable](https://lovable.dev). Avoid force-pushing or rewriting history on `main`.

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
    chat.functions.ts        # Server functions: chat, threads, energy, soft delete
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

1. User sends a message; the Gardener replies via the LLM chain (Groq → Gemini → OpenAI).
2. A small classifier picks an emotion from `GARDEN_EMOTION_CATALOG` (27 entries).
3. That emotion sets the flower **species**, **hue**, and contributes to **garden weather**.
4. The seed for that thread is created or updated in Supabase and rendered in the 3D scene.
5. **Weather episodes** (rain/rainbow) run for a while, then fade; new messages or mood changes bring them back.
6. **Deleting a thread** soft-deletes the seed (`deleted_at`) — the flower becomes a numbered memory marker; garden energy is unchanged.

If the classifier is uncertain, keyword matching in `flower-mood.ts` provides a fallback.

---

## License

Private project — all rights reserved unless otherwise noted.
