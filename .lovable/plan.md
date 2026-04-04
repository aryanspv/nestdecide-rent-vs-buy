

# Unique Insights — Features No Other Calculator Has

## What already exists
- Rental yield analysis, bachelor discrimination score, resale liquidity risk, mobility score, hidden costs breakdown, location score gauge

## 7 New Insights (ranked by uniqueness)

### 1. EMI Stress Test Timeline
Show what happens to the user's EMI burden under real scenarios: job loss (3-6 month buffer check), interest rate hike (+1-2%), income stagnation. Display a "months of runway" number — how many months they can survive on savings if income stops. No Indian calculator visualizes this.

**Engine addition**: Calculate `emergencyRunwayMonths = savings / (emi + maintenance)`, stress-test EMI at +1% and +2% rates, show the delta.

### 2. Rent Trap Detector
Calculate the year when cumulative rent paid exceeds total transaction cost of buying (stamp duty + registration + brokerage). Before that year, renting is "free" relative to sunk buy costs. After it, every month of rent is money that could have gone to equity. Show: "You'll pay more in rent than buying costs by Year X."

**Engine addition**: Simple loop — find year where `totalRentPaid > totalTransactionCost`. Display as a timeline marker on the chart.

### 3. Real Inflation-Adjusted Verdict
Every calculator shows nominal returns. Add a toggle that shows all numbers in today's rupees (deflated at 6% inflation). The property that "appreciated to ₹2Cr" might only be ₹1.1Cr in real terms. This is the single biggest blind spot in Indian housing decisions.

**Engine addition**: Add `realValue = nominalValue / (1.06)^year` to snapshots. New toggle on NetWorthChart for "Show in today's ₹".

### 4. Lifestyle Cost Parity Index
Calculate how much more/less disposable income the user has under each scenario. Factor in: EMI vs rent, maintenance, property tax, insurance, commute delta, society restrictions (pet deposit, parking fees). Show a monthly "freedom money" comparison — the cash left after housing for travel, dining, hobbies.

**Engine addition**: `buyerFreedomMoney = income - emi - maintenance - propertyTax/12 - insurance` vs `renterFreedomMoney = income - rent`. Display as a side-by-side bar.

### 5. Wealth Milestone Tracker
Instead of just "net worth at Year X", show when the user hits life milestones: "When can I afford my kid's education?", "When do I hit ₹1Cr net worth?", "When can I retire early?" Map these against both buy and rent paths. Makes the abstract chart deeply personal.

**Engine addition**: Define milestone thresholds (₹25L, ₹50L, ₹1Cr, ₹2Cr, ₹5Cr). Find the year each path hits each milestone. Display as a comparison timeline.

### 6. Landlord Risk Score (Rent path)
Unique to India: quantify the risk of landlord-driven disruptions — eviction for "personal use", arbitrary rent hikes beyond agreement, deposit withholding, maintenance neglect. Score based on city (some cities have stronger tenant protection laws) and lease duration. No calculator acknowledges this real friction cost.

**Data addition**: Add `tenantProtectionScore` (1-5) per city to `locationData.ts`. Show insight card: "Tenant protection in [city] is [weak/moderate/strong]. Factor in X% chance of forced relocation every Y years."

### 7. Opportunity Cost Clock
A live-feeling counter showing: "Every month you delay deciding, you lose ₹X in potential wealth." Calculated from the difference in monthly compounding between the two paths. Creates urgency without being pushy — pure math.

**Engine addition**: `monthlyOpportunityCost = abs(buyNetWorthGrowthRate - rentNetWorthGrowthRate) * currentCorpus / 12`

---

## Implementation approach

- Add new fields to `CalculationResult` interface for stress test, rent trap year, real-value snapshots, freedom money, milestones
- Add `tenantProtectionScore` to `CityData` in `locationData.ts`
- Create a new component `src/components/UniqueInsights.tsx` with collapsible cards for each insight
- Add inflation toggle to `NetWorthChart.tsx`
- Wire into both CompareTab and BuyTab results sections

## Files to create/edit
- `src/lib/calculations.ts` — new calculations for all 7 insights
- `src/lib/locationData.ts` — add `tenantProtectionScore` per city
- `src/components/UniqueInsights.tsx` — new component with all insight cards
- `src/components/NetWorthChart.tsx` — add real-value toggle
- `src/pages/CompareTab.tsx` — integrate UniqueInsights
- `src/pages/BuyTab.tsx` — integrate stress test + milestones

