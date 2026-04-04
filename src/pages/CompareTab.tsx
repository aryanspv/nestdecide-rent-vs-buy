import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { calculate, UserInputs } from '@/lib/calculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StoryResult from '@/components/StoryResult';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/contexts/UserDataContext';
import { validateCompare, hasBlockingErrors } from '@/lib/validation';
import { ChevronDown, ChevronUp, Zap, AlertCircle } from 'lucide-react';
import { useAiInsights } from '@/hooks/useAiInsights';
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

export default function CompareTab() {
  const shared = useUserData();
  const [localInputs, setLocalInputs] = useState({
    propertyPrice: 8000000,
    downPayment: 1600000,
    interestRate: 8.5,
    loanTenure: 20,
    monthlyMaintenance: 5000,
    plannedStay: 7,
    propertyAppreciation: 6,
    annualRentIncrease: 8,
    locality: '',
    propertyType: 'apartment' as UserInputs['propertyType'],
    furnishing: 'semi_furnished' as UserInputs['furnishing'],
    userProfile: 'couple' as UserInputs['userProfile'],
    commuteDistance: 10,
    safetyPriority: 3,
    resaleConcern: 3,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const ai = useAiInsights();


  const updateLocal = <K extends keyof typeof localInputs>(key: K, val: (typeof localInputs)[K]) =>
    setLocalInputs(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[shared.city] ?? CITY_DATA.other;

  const fullInputs: UserInputs = {
    city: shared.city,
    monthlyRent: shared.monthlyRent,
    monthlyIncome: shared.monthlyIncome,
    savings: shared.savings,
    ...localInputs,
    investmentReturn: 12,
  };

  const errors = validateCompare({
    monthlyRent: shared.monthlyRent,
    monthlyIncome: shared.monthlyIncome,
    savings: shared.savings,
    propertyPrice: localInputs.propertyPrice,
    downPayment: localInputs.downPayment,
    interestRate: localInputs.interestRate,
  });
  const blocked = hasBlockingErrors(errors);

  const result = useMemo(() => {
    if (!hasCalculated) return null;
    return calculate(fullInputs);
  }, [hasCalculated, fullInputs]);

  const handleCalculate = () => {
    setLoading(true);
    setHasCalculated(false);
    setTimeout(() => {
      setHasCalculated(true);
      setLoading(false);
      // Trigger AI insights
      const calcResult = calculate(fullInputs);
      ai.fetchInsights(calcResult, shared.city, localInputs.userProfile, shared.monthlyIncome);
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Rent vs Buy</h1>
        <p className="text-sm text-muted-foreground mt-1">30-year financial comparison</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <CitySelector value={shared.city} onChange={v => shared.updateField('city', v)} />

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <CurrencyInput label="Monthly rent" value={shared.monthlyRent} onChange={v => shared.updateField('monthlyRent', v)} />
            <FieldError error={errors.monthlyRent} />
          </div>
          <div>
            <CurrencyInput label="Monthly income" value={shared.monthlyIncome} onChange={v => shared.updateField('monthlyIncome', v)} />
            <FieldError error={errors.monthlyIncome} />
          </div>
        </div>

        <div>
          <CurrencyInput label="Property price" value={localInputs.propertyPrice} onChange={v => updateLocal('propertyPrice', v)} />
          <FieldError error={errors.propertyPrice} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <CurrencyInput label="Down payment" value={localInputs.downPayment} onChange={v => updateLocal('downPayment', v)} hint={`${localInputs.propertyPrice > 0 ? (localInputs.downPayment / localInputs.propertyPrice * 100).toFixed(0) : 0}%`} />
            <FieldError error={errors.downPayment} />
          </div>
          <div>
            <CurrencyInput label="Savings" value={shared.savings} onChange={v => shared.updateField('savings', v)} />
            <FieldError error={errors.savings} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">How long will you stay?</label>
          <div className="flex items-center gap-3">
            <Slider value={[localInputs.plannedStay]} onValueChange={([v]) => updateLocal('plannedStay', v)} min={1} max={30} step={1} className="flex-1" />
            <span className="text-sm font-mono font-semibold w-12 text-right">{localInputs.plannedStay}yr</span>
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-primary font-medium w-full py-1"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Hide' : 'Show'} advanced settings
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <PercentInput label="Loan rate" value={localInputs.interestRate} onChange={v => updateLocal('interestRate', v)} hint="~8.5%" />
                  <FieldError error={errors.interestRate} />
                </div>
                <PercentInput label="Appreciation" value={localInputs.propertyAppreciation} onChange={v => updateLocal('propertyAppreciation', v)} hint={`${cityData.avgAppreciationRange[0]}-${cityData.avgAppreciationRange[1]}%`} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                
                <PercentInput label="Rent hike/yr" value={localInputs.annualRentIncrease} onChange={v => updateLocal('annualRentIncrease', v)} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Loan tenure</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[localInputs.loanTenure]} onValueChange={([v]) => updateLocal('loanTenure', v)} min={5} max={30} step={1} className="flex-1" />
                    <span className="text-sm font-mono font-semibold w-10 text-right">{localInputs.loanTenure}yr</span>
                  </div>
                </div>
                <CurrencyInput label="Maintenance/mo" value={localInputs.monthlyMaintenance} onChange={v => updateLocal('monthlyMaintenance', v)} />
              </div>

              <div className="border-t border-border/30 pt-3 mt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location & Lifestyle</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Locality / Area</label>
                <Input type="text" placeholder="e.g. Koramangala, Bandra West..." value={localInputs.locality} onChange={(e) => updateLocal('locality', e.target.value)} className="h-10 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Profile</label>
                  <Select value={localInputs.userProfile} onValueChange={v => updateLocal('userProfile', v as UserInputs['userProfile'])}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROFILE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Property type</label>
                  <Select value={localInputs.propertyType} onValueChange={v => updateLocal('propertyType', v as UserInputs['propertyType'])}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Furnishing (if renting)</label>
                <Select value={localInputs.furnishing} onValueChange={v => updateLocal('furnishing', v as UserInputs['furnishing'])}>
                  <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Commute (one-way)</label>
                <div className="flex items-center gap-3">
                  <Slider value={[localInputs.commuteDistance]} onValueChange={([v]) => updateLocal('commuteDistance', v)} min={0} max={50} step={1} className="flex-1" />
                  <span className="text-sm font-mono font-semibold w-12 text-right">{localInputs.commuteDistance}km</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Safety priority</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[localInputs.safetyPriority]} onValueChange={([v]) => updateLocal('safetyPriority', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[localInputs.safetyPriority]}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Resale concern</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[localInputs.resaleConcern]} onValueChange={([v]) => updateLocal('resaleConcern', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[localInputs.resaleConcern]}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={handleCalculate} disabled={blocked} className="w-full h-11 rounded-xl text-sm font-semibold gap-2 disabled:opacity-50" size="lg">
          <Zap className="h-4 w-4" />
          Run 30-Year Comparison
        </Button>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Modelling 30-year scenarios...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — Story Mode */}
      {result && !loading && (
        <StoryResult
          result={result}
          profile={localInputs.userProfile}
          city={shared.city}
          monthlyIncome={shared.monthlyIncome}
          onModify={() => setHasCalculated(false)}
        />
      )}
    </div>
  );
}
