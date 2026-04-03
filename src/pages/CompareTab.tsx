import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import NetWorthChart from '@/components/NetWorthChart';
import VerdictCard from '@/components/VerdictCard';
import HonestBreakdown from '@/components/HonestBreakdown';
import { calculate, UserInputs } from '@/lib/calculations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LocationInsights from '@/components/LocationInsights';
import { Input } from '@/components/ui/input';
import { GitCompareArrows, ChevronDown, ChevronUp, Zap } from 'lucide-react';

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

const DEFAULT_INPUTS: UserInputs = {
  city: 'bengaluru',
  monthlyRent: 30000,
  monthlyIncome: 150000,
  savings: 2000000,
  propertyPrice: 8000000,
  downPayment: 1600000,
  interestRate: 8.5,
  loanTenure: 20,
  monthlyMaintenance: 5000,
  plannedStay: 7,
  propertyAppreciation: 6,
  investmentReturn: 12,
  annualRentIncrease: 8,
  locality: '',
  propertyType: 'apartment',
  furnishing: 'semi_furnished',
  userProfile: 'couple',
  commuteDistance: 10,
  safetyPriority: 3,
  resaleConcern: 3,
};

export default function CompareTab() {
  const [inputs, setInputs] = useState<UserInputs>(DEFAULT_INPUTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = <K extends keyof UserInputs>(key: K, val: UserInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[inputs.city] ?? CITY_DATA.other;

  const result = useMemo(() => {
    if (!hasCalculated) return null;
    return calculate(inputs);
  }, [inputs, hasCalculated]);

  const handleCalculate = () => {
    setLoading(true);
    setHasCalculated(false);
    setTimeout(() => {
      setHasCalculated(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Rent vs Buy</h1>
        <p className="text-sm text-muted-foreground mt-1">30-year financial comparison</p>
      </div>

      {/* Inputs — simplified with progressive disclosure */}
      <div className="glass-card p-4 space-y-3">
        <CitySelector value={inputs.city} onChange={v => update('city', v)} />

        <div className="grid grid-cols-2 gap-2.5">
          <CurrencyInput label="Monthly rent" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} />
          <CurrencyInput label="Monthly income" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} />
        </div>

        <CurrencyInput label="Property price" value={inputs.propertyPrice} onChange={v => update('propertyPrice', v)} />

        <div className="grid grid-cols-2 gap-2.5">
          <CurrencyInput label="Down payment" value={inputs.downPayment} onChange={v => update('downPayment', v)} hint={`${inputs.propertyPrice > 0 ? (inputs.downPayment / inputs.propertyPrice * 100).toFixed(0) : 0}%`} />
          <CurrencyInput label="Savings" value={inputs.savings} onChange={v => update('savings', v)} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">How long will you stay?</label>
          <div className="flex items-center gap-3">
            <Slider value={[inputs.plannedStay]} onValueChange={([v]) => update('plannedStay', v)} min={1} max={30} step={1} className="flex-1" />
            <span className="text-sm font-mono font-semibold w-12 text-right">{inputs.plannedStay}yr</span>
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <PercentInput label="Loan rate" value={inputs.interestRate} onChange={v => update('interestRate', v)} hint="~8.5%" />
                <PercentInput label="Appreciation" value={inputs.propertyAppreciation} onChange={v => update('propertyAppreciation', v)} hint={`${cityData.avgAppreciationRange[0]}-${cityData.avgAppreciationRange[1]}%`} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <PercentInput label="Investment return" value={inputs.investmentReturn} onChange={v => update('investmentReturn', v)} hint="12-14%" />
                <PercentInput label="Rent hike/yr" value={inputs.annualRentIncrease} onChange={v => update('annualRentIncrease', v)} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Loan tenure</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[inputs.loanTenure]} onValueChange={([v]) => update('loanTenure', v)} min={5} max={30} step={1} className="flex-1" />
                    <span className="text-sm font-mono font-semibold w-10 text-right">{inputs.loanTenure}yr</span>
                  </div>
                </div>
                <CurrencyInput label="Maintenance/mo" value={inputs.monthlyMaintenance} onChange={v => update('monthlyMaintenance', v)} />
              </div>

              {/* Location & Lifestyle */}
              <div className="border-t border-border/30 pt-3 mt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location & Lifestyle</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Locality / Area</label>
                <Input
                  type="text"
                  placeholder="e.g. Koramangala, Bandra West..."
                  value={inputs.locality}
                  onChange={(e) => update('locality', e.target.value)}
                  className="h-10 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Profile</label>
                  <Select value={inputs.userProfile} onValueChange={v => update('userProfile', v as UserInputs['userProfile'])}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROFILE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Property type</label>
                  <Select value={inputs.propertyType} onValueChange={v => update('propertyType', v as UserInputs['propertyType'])}>
                    <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Furnishing (if renting)</label>
                <Select value={inputs.furnishing} onValueChange={v => update('furnishing', v as UserInputs['furnishing'])}>
                  <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Commute (one-way)</label>
                <div className="flex items-center gap-3">
                  <Slider value={[inputs.commuteDistance]} onValueChange={([v]) => update('commuteDistance', v)} min={0} max={50} step={1} className="flex-1" />
                  <span className="text-sm font-mono font-semibold w-12 text-right">{inputs.commuteDistance}km</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Safety priority</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[inputs.safetyPriority]} onValueChange={([v]) => update('safetyPriority', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[inputs.safetyPriority]}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Resale concern</label>
                  <div className="flex items-center gap-3">
                    <Slider value={[inputs.resaleConcern]} onValueChange={([v]) => update('resaleConcern', v)} min={1} max={5} step={1} className="flex-1" />
                    <span className="text-xs font-medium w-16 text-right text-muted-foreground">{PRIORITY_LABELS[inputs.resaleConcern]}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button onClick={handleCalculate} className="w-full h-11 rounded-xl text-sm font-semibold gap-2" size="lg">
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

      {/* Results */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <VerdictCard result={result} />
          <NetWorthChart snapshots={result.snapshots} plannedStay={inputs.plannedStay} breakEvenYear={result.breakEvenYear} />
          <LocationInsights result={result} />
          <HonestBreakdown result={result} />
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
