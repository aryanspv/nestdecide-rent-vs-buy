
# NestDecide UX Upgrade — Focused Build

## Scope: 3 features, no live API calls

### 1. Onboarding Wizard (Home Tab)
Replace the static Home tab with a 3-step guided flow:
1. **City picker** — large tap-friendly city cards with illustrations
2. **Quick numbers** — Monthly rent + income + savings (3 fields)
3. **Intent** — "Thinking of buying?" → routes to Compare tab; "Just exploring rent?" → Rent tab

Pre-fills shared context via `UserDataContext` so other tabs have data ready. Animated step transitions with Framer Motion. Progress dots at top.

**Files:** Rewrite `src/pages/HomeTab.tsx`, update `src/contexts/UserDataContext.tsx` if needed.

### 2. Story-Mode Results
Refactor the results section (in CompareTab primarily) from a wall of cards into a narrative scroll:
1. **Hero verdict** — Large animated verdict ("RENT" or "BUY") with count-up number showing savings difference
2. **"Here's why"** — 2-3 top reasons with icons, staggered fade-in
3. **Chart** — existing NetWorthChart (keep as-is)
4. **"What surprised us"** — highlight the single most unexpected insight
5. **Deep dive** — existing insight cards, collapsible accordion

New components:
- `src/components/AnimatedNumber.tsx` — count-up effect for key metrics
- `src/components/StoryResult.tsx` — orchestrates the narrative sections

Integrate into `CompareTab.tsx` results area.

### 3. "People Like You" Benchmarks
Hardcoded persona × city benchmarks showing what similar people typically do:
- "Most bachelors in Bengaluru earning ₹1L+ rent for 3-5 years before buying"
- "Families in Mumbai with ₹50L+ savings typically buy within 2 years"
- "Couples in Pune prefer renting in Kothrud/Baner before buying in Hinjewadi"

Data structure: `{ profile, city, incomeRange, insight }[]` in a new file.

**Files:** Create `src/lib/benchmarkData.ts`, create `src/components/PeopleLikeYou.tsx`, integrate into results.

### 4. Hardcoded Livability Data (crime + traffic + AQI)
Enrich `locationData.ts` with NCRB crime rates, TomTom congestion index, and typical AQI per city. No live API calls — all static. Show in LocationInsights cards.

**Files:** Update `src/lib/locationData.ts`, update `src/components/LocationInsights.tsx`.

## Explicitly skipped
- ❌ Live API calls (TomTom, WAQI, Open-Meteo)
- ❌ Theme toggle
- Decision journal and share cards: not prioritized but can add later

## Build order
1. Onboarding wizard (HomeTab rewrite)
2. AnimatedNumber + StoryResult components
3. Story-mode integration into CompareTab
4. PeopleLikeYou benchmarks
5. Livability data enrichment (crime/traffic/AQI cards)
