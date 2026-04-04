import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { useUserData } from '@/contexts/UserDataContext';
import { validateRent, hasBlockingErrors } from '@/lib/validation';
import { Wallet, Receipt, ChevronDown, ChevronUp, ArrowRight, AlertCircle } from 'lucide-react';
import type { TabId } from '@/components/BottomNav';

interface RentTabProps {
  onNavigate: (tab: TabId) => void;
}

interface RentLocalState {
  annualRentIncrease: number;
  years: number;
}

function ResultRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>{value}</span>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  const isWarning = error.includes('Most banks');
  return (
    <p className={`text-xs flex items-center gap-1 mt-0.5 ${isWarning ? 'text-amber-500' : 'text-destructive'}`}>
      <AlertCircle className="h-3 w-3 shrink-0" /> {error}
    </p>
  );
}

export default function RentTab({ onNavigate }: RentTabProps) {
  const shared = useUserData();
  const [local, setLocal] = useState<RentLocalState>({
    annualRentIncrease: 8,
    years: 10,
  });
  const [showResults, setShowResults] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const updateShared = <K extends keyof typeof shared>(key: K, val: (typeof shared)[K]) => {
    if (key === 'city' || key === 'monthlyIncome' || key === 'monthlyRent' || key === 'savings') {
      shared.updateField(key as any, val as any);
    }
  };
  const updateLocal = <K extends keyof RentLocalState>(key: K, val: RentLocalState[K]) =>
    setLocal(prev => ({ ...prev, [key]: val }));

  const errors = validateRent({
    monthlyRent: shared.monthlyRent,
    monthlyIncome: shared.monthlyIncome,
    savings: shared.savings,
  });
  const blocked = hasBlockingErrors(errors);

  const cityData = CITY_DATA[shared.city] ?? CITY_DATA.other;

  const analysis = useMemo(() => {
    const rentToIncome = (shared.monthlyRent / shared.monthlyIncome) * 100;
    const maxAffordableRent = shared.monthlyIncome * 0.3;
    const affordabilityVerdict = rentToIncome <= 25 ? 'healthy' : rentToIncome <= 35 ? 'moderate' : 'stretched';

    let totalRent = 0;
    let currentRent = shared.monthlyRent;
    for (let y = 1; y <= local.years; y++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + local.annualRentIncrease / 100;
    }

    const securityDeposit = shared.monthlyRent * cityData.avgRentDepositMonths;
    const brokerage = shared.monthlyRent * cityData.brokerageRentMonths;
    const rentAtEnd = shared.monthlyRent * Math.pow(1 + local.annualRentIncrease / 100, local.years);

    return {
      rentToIncome, maxAffordableRent, affordabilityVerdict,
      totalRent, securityDeposit, brokerage, rentAtEnd,
    };
  }, [shared, local, cityData]);

  const affordColors = {
    healthy: 'bg-signal-buy-bg text-signal-buy-foreground',
    moderate: 'bg-signal-neutral-bg text-signal-neutral-foreground',
    stretched: 'bg-signal-rent-bg text-signal-rent-foreground',
  };

  const verdictMessages = {
    healthy: { title: 'Your rent is affordable ✅', desc: 'You have solid headroom to save each month.' },
    moderate: { title: 'Rent is manageable ⚠️', desc: 'You can sustain this, but savings may be tight in high-expense months.' },
    stretched: { title: 'Rent is stretching your budget 🔴', desc: 'Consider downsizing or negotiating. Little room for savings.' },
  };

  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Renting Smart</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand your rent costs & affordability</p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <CitySelector value={shared.city} onChange={v => updateShared('city', v)} />
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <CurrencyInput label="Monthly rent" value={shared.monthlyRent} onChange={v => updateShared('monthlyRent', v)} />
            <FieldError error={errors.monthlyRent} />
          </div>
          <div>
            <CurrencyInput label="Monthly income" value={shared.monthlyIncome} onChange={v => updateShared('monthlyIncome', v)} />
            <FieldError error={errors.monthlyIncome} />
          </div>
        </div>
        <div>
          <CurrencyInput label="Current savings" value={shared.savings} onChange={v => updateShared('savings', v)} />
          <FieldError error={errors.savings} />
        </div>
        <PercentInput label="Rent hike/yr" value={local.annualRentIncrease} onChange={v => updateLocal('annualRentIncrease', v)} hint="5-10%" />
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Time horizon</label>
          <div className="flex items-center gap-3">
            <Slider value={[local.years]} onValueChange={([v]) => updateLocal('years', v)} min={1} max={30} step={1} className="flex-1" />
            <span className="text-sm font-mono font-semibold w-12 text-right">{local.years}yr</span>
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          disabled={blocked}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          <Wallet className="h-4 w-4" /> Analyse My Rent
        </button>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Verdict Card */}
            <div className={`glass-card p-4 border ${
              analysis.affordabilityVerdict === 'healthy' ? 'border-signal-buy/30' :
              analysis.affordabilityVerdict === 'moderate' ? 'border-signal-neutral/30' : 'border-destructive/30'
            }`}>
              <h3 className="text-base font-bold text-foreground font-['Space_Grotesk'] mb-1">
                {verdictMessages[analysis.affordabilityVerdict].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {verdictMessages[analysis.affordabilityVerdict].desc}
              </p>
              <button
                onClick={() => onNavigate('compare')}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                See if buying beats renting <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Affordability */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" /> Affordability
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${affordColors[analysis.affordabilityVerdict]}`}>
                  {analysis.affordabilityVerdict}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Rent-to-income</span>
                <span className="font-semibold">{analysis.rentToIncome.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    analysis.affordabilityVerdict === 'healthy' ? 'bg-signal-buy' :
                    analysis.affordabilityVerdict === 'moderate' ? 'bg-signal-neutral' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(analysis.rentToIncome, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                30% rule max: {formatINR(analysis.maxAffordableRent)}/mo
              </p>
            </div>

            {/* Expense Breakdown */}
            <div className="glass-card overflow-hidden">
              <button onClick={() => toggleSection('expense')} className="w-full p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" /> Expense Breakdown
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-foreground">{formatLakhs(analysis.totalRent)}</span>
                  {expandedSection === 'expense' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedSection === 'expense' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-0.5">
                      <ResultRow label={`Total rent (${local.years}yr)`} value={formatLakhs(analysis.totalRent)} />
                      <ResultRow label={`Rent at year ${local.years}`} value={`${formatINR(analysis.rentAtEnd)}/mo`} />
                      <div className="border-t border-border/30 my-1" />
                      <ResultRow label="Security deposit" value={formatINR(analysis.securityDeposit)} />
                      <ResultRow label="Brokerage" value={formatINR(analysis.brokerage)} />
                      <ResultRow label="Day-1 cash needed" value={formatINR(analysis.securityDeposit + analysis.brokerage + shared.monthlyRent)} bold />
                      <p className="text-[11px] text-muted-foreground mt-2 italic">
                        Deposit: {cityData.avgRentDepositMonths}mo in {cityData.label}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
