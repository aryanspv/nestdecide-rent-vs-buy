

# NestDecide — High-Value Prototype Improvements

## What exists today
- **Home**: Static hero + 3 feature cards
- **Rent**: Input form → affordability check, expense breakdown, investment projection
- **Buy**: Input form (with Location & Lifestyle) → EMI, day-1 costs, long-term outlook
- **Compare**: Full 30-year engine with VerdictCard, NetWorthChart, LocationInsights, HonestBreakdown
- **Profile pages**: About, Permissions, Notifications (mostly static)
- **Engine**: `calculations.ts` (480 lines) — full rent-vs-buy comparison with location scoring

## Key gaps that hurt user value

1. **Buy tab doesn't use the real engine** — has its own inline EMI calc, ignores Location & Lifestyle inputs in results
2. **Rent tab has no verdict** — shows numbers but never tells the user "your rent is healthy/stretched, here's what to do"
3. **No input sync** — filling city + income in Rent, then switching to Buy = start over
4. **No input validation** — 0 income, down payment > property price, all silently accepted
5. **Notification preferences don't persist** — reset on refresh

---

## Plan (6 items, ordered by user impact)

### 1. Shared input context across tabs
Create `src/contexts/UserDataContext.tsx` with shared fields: `city`, `monthlyIncome`, `monthlyRent`, `savings`. Wrap in `Index.tsx`. Each tab reads from context on mount, writes back on change. Switching tabs preserves common inputs.

### 2. Wire Buy tab to the real calculation engine
- Import `calculate()` from `calculations.ts` into BuyTab
- Pass all Buy inputs (including Location & Lifestyle) to the engine
- Show `VerdictCard` (buy-focused summary), `LocationInsights`, and the property equity chart in Buy results
- Remove the inline `calculateEMI` function; use engine output for EMI, upfront costs, and long-term numbers

### 3. Add Rent tab verdict + Compare CTA
- After analysis, show a summary verdict card at top: "Your rent is healthy / moderate / stretched" with a one-liner recommendation
- Add a CTA button: "See if buying beats renting →" that switches to Compare tab (via `onNavigate`) with pre-filled inputs from shared context

### 4. Input validation with inline errors
- Create a `validate(inputs)` utility returning `Record<string, string>` error messages
- Rules: income > 0, down payment ≤ property price (with warning at < 10%), rent > 0, property price > 0
- Show errors below each FormField; disable Analyse button until critical errors are resolved
- Add contextual hints: "Most banks need 10-20% down payment"

### 5. Persist notification & permission preferences
- Save notification toggle states to `localStorage` on change, restore on mount
- Mark features that need a backend with a subtle "(coming soon)" label rather than removing them

### 6. Shareable verdict card
- Add a "Share Result" button below VerdictCard in Compare and Buy results
- Use `html2canvas` to capture the verdict as a branded PNG
- Fallback: Web Share API on mobile, download on desktop
- New component: `src/components/ShareVerdict.tsx`

---

## Technical notes

- **Context shape**: `{ city, monthlyIncome, monthlyRent, savings, updateField }` — minimal, only truly shared fields
- **Buy tab engine call**: Create a wrapper that maps BuyState to `UserInputs` (filling in rent/investment fields with defaults since Buy tab doesn't collect those)
- **Validation**: Reusable across all 3 tabs — each tab calls `validate(fields)` with its own subset
- **html2canvas**: Add as dependency; capture a ref'd div, convert to blob, trigger download or share

