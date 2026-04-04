import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserData } from '@/contexts/UserDataContext';
import { validateBuy, hasBlockingErrors } from '@/lib/validation';
import { calculate, UserInputs } from '@/lib/calculations';
import VerdictCard from '@/components/VerdictCard';
import LocationInsights from '@/components/LocationInsights';
import ShareVerdict from '@/components/ShareVerdict';
import UniqueInsights from '@/components/UniqueInsights';
import { Building2, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { UserProfile, PropertyType, Furnishing } from '@/lib/locationData';

interface BuyLocalState {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTenure: number;
  monthlyMaintenance: number;
  propertyAppreciation: number;
  locality: string;
  userProfile: UserProfile;
  propertyType: PropertyType;
  furnishing: Furnishing;
  commuteDistance: number;
  safetyPriority: number;
  resaleConcern: number;
}

const DEFAULT_LOCAL: BuyLocalState = {
  propertyPrice: 8000000,
  downPayment: 1600000,
  interestRate: 8.5,
  loanTenure: 20,
  monthlyMaintenance: 5000,
  propertyAppreciation: 6,
  locality: '',
  userProfile: 'couple',
  propertyType: 'apartment',
  furnishing: 'semi_furnished',
  commuteDistance: 10,
  safetyPriority: 3,
  resaleConcern: 3,
};

const PROFILE_OPTIONS = [
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'retired', label: 'Retired' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'independent_house', label: 'Independent House' },
  { value: 'villa', label: 'Villa' },
];

const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-furnished' },
  { value: 'fully_furnished', label: 'Fully furnished' },
];

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low', 2: 'Slight', 3: 'Moderate', 4: 'High', 5: 'Critical',
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  const isWarning = error.includes('Most banks');
  return (
    <p className={`text-xs flex items-center gap-1 mt-0.5 ${isWarning ? 'text-amber-500' : 'text-destructive'}`}>
      <AlertCircle className="h-3 w-3 shrink-0" /> {error}
    </p>
  );
}

export default function BuyTab() {
  const shared = useUserData();
  const [s, setS] = useState<BuyLocalState>(DEFAULT_LOCAL);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const verdictRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof BuyLocalState>(key: K, val: BuyLocalState[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[shared.city] ?? CITY_DATA.other;
  const downPct = s.propertyPrice > 0 ? (s.downPayment / s.propertyPrice * 100).toFixed(0) : '0';

  const errors = validateBuy({
    propertyPrice: s.propertyPrice,
    downPayment: s.downPayment,
    monthlyIncome: shared.monthlyIncome,
    interestRate: s.interestRate,
  });
  const blocked = hasBlockingErrors(errors);

  // Build full UserInputs for the engine
  const engineInputs: UserInputs = {
    city: shared.city,
    monthlyRent: shared.monthlyRent,
    monthlyIncome: shared.monthlyIncome,
    savings: shared.savings,
    propertyPrice: s.propertyPrice,
    downPayment: s.downPayment,
    interestRate: s.interestRate,
    loanTenure: s.loanTenure,
    monthlyMaintenance: s.monthlyMaintenance,
    plannedStay: s.loanTenure, // use tenure as stay for buy-only view
    propertyAppreciation: s.propertyAppreciation,
    investmentReturn: 12,
    annualRentIncrease: 8,
    locality: s.locality,
    propertyType: s.propertyType,
    furnishing: s.furnishing,
    userProfile: s.userProfile,
    commuteDistance: s.commuteDistance,
    safetyPriority: s.safetyPriority,
    resaleConcern: s.resaleConcern,
  };

  const result = useMemo(() => {
    if (!hasCalculated) return null;
    return calculate(engineInputs);
  }, [hasCalculated, engineInputs]);

  const handleCalculate = () => {
    setLoading(true);
    setHasCalculated(false);
    setTimeout(() => {
      setHasCalculated(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Buying a Home</h1>
        <p className="text-sm text-muted-foreground mt-1">Full cost analysis powered by 30-year engine</p>
      </div>

      {/* Inputs */}
      <div className="glass-card p-4 space-y-3">
        <CitySelector value={shared.city} onChange={v => shared.updateField('city', v)} />
        <div>
          <CurrencyInput label="Property price" value={s.propertyPrice} onChange={v => update('propertyPrice', v)} />
          <FieldError error={errors.propertyPrice} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <CurrencyInput label="Down payment" value={s.downPayment} onChange={v => update('downPayment', v)} hint={`${downPct}%`} />
            <FieldError error={errors.downPayment} />
          </div>
          <div>
            <CurrencyInput label="Monthly income" value={shared.monthlyIncome} onChange={v => shared.updateField('monthlyIncome', v)} />
            <FieldError error={errors.monthlyIncome} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <PercentInput label="Interest rate" value={s.interestRate} onChange={v => update('interestRate', v)} hint="~8.5%" />
            <FieldError error={errors.interestRate} />
          </div>
          <PercentInput label="Appreciation" value={s.propertyAppreciation} onChange={v => update('propertyAppreciation', v)} hint={`${cityData.avgAppreciationRange[0]}-${cityData.avgAppreciationRange[1]}%`} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Loan tenure</label>
            <div className="flex items-center gap-3">
              <Slider value={[s.loanTenure]} onValueChange={([v]) => update('loanTenure', v)} min={5} max={30} step={1} className="flex-1" />
              <span className="text-sm font-mono font-semibold w-10 text-right">{s.loanTenure}yr</span>
            </div>
          </div>
          <CurrencyInput label="Maintenance/mo" value={s.monthlyMaintenance} onChange={v => update('monthlyMaintenance', v)} />
        </div>

        {/* Advanced: Location & Lifestyle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-primary font-medium w-full py-1"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Hide' : 'Show'} location & lifestyle
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Locality / Area</label>
                <Input type="text" placeholder="e.g. Koramangala, Bandra West..." value={s.locality} onChange={(e) => update('locality', e.target.value)} className="h-10 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Profile</label>
                  <Select value={s.userProfile} onValueChange={v => update('userProfile', v as UserProfile)}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROFILE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Property type</label>
                  <Select value={s.propertyType} onValueChange={v => update('propertyType', v as PropertyType)}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Furnishing</label>
                <Select value={s.furnishing} onValueChange={v => update('furnishing', v as Furnishing)}>
                  <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Commute (one-way)</label>
                <div className="flex items-center gap-3">
                  <Slider value={[s.commuteDistance]} onValueChange={([v]) => update('commuteDistance', v)} min={0} max={50} step={1} className="flex-1" />
                  <span className="text-sm font-mono font-semibold w-12 text-right">{s.commuteDistance}km</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Safety priority</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[s.safetyPriority]} onValueChange={([v]) => update('safetyPriority', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[s.safetyPriority]}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Resale concern</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[s.resaleConcern]} onValueChange={([v]) => update('resaleConcern', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[s.resaleConcern]}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleCalculate}
          disabled={blocked}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          <Zap className="h-4 w-4" /> Analyse Purchase
        </button>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Running full analysis...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div ref={verdictRef}>
            <VerdictCard result={result} />
          </div>
          <LocationInsights result={result} />
          <ShareVerdict targetRef={verdictRef} title="My NestDecide Buy Analysis" />
          <div className="text-center pt-1">
            <button onClick={() => setHasCalculated(false)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
              ← Modify inputs
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
