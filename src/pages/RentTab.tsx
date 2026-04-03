import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Wallet, TrendingUp, PiggyBank, Receipt, IndianRupee, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';

interface RentState {
  city: string;
  monthlyRent: number;
  monthlyIncome: number;
  savings: number;
  annualRentIncrease: number;
  investmentReturn: number;
  years: number;
}

const DEFAULT: RentState = {
  city: 'bengaluru',
  monthlyRent: 30000,
  monthlyIncome: 150000,
  savings: 2000000,
  annualRentIncrease: 8,
  investmentReturn: 12,
  years: 10,
};

function ResultRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${bold ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>{value}</span>
    </div>
  );
}

export default function RentTab() {
  const [s, setS] = useState<RentState>(DEFAULT);
  const [showResults, setShowResults] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const update = <K extends keyof RentState>(key: K, val: RentState[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[s.city] ?? CITY_DATA.other;

  const analysis = useMemo(() => {
    const rentToIncome = (s.monthlyRent / s.monthlyIncome) * 100;
    const maxAffordableRent = s.monthlyIncome * 0.3;
    const affordabilityVerdict = rentToIncome <= 25 ? 'healthy' : rentToIncome <= 35 ? 'moderate' : 'stretched';

    let totalRent = 0;
    let currentRent = s.monthlyRent;
    for (let y = 1; y <= s.years; y++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + s.annualRentIncrease / 100;
    }

    const securityDeposit = s.monthlyRent * cityData.avgRentDepositMonths;
    const brokerage = s.monthlyRent * cityData.brokerageRentMonths;
    const investmentCorpus = s.savings * Math.pow(1 + s.investmentReturn / 100, s.years);
    const monthlySurplus = Math.max(0, s.monthlyIncome - s.monthlyRent - s.monthlyIncome * 0.4);

    let sipCorpus = 0;
    const monthlyReturn = s.investmentReturn / 100 / 12;
    for (let m = 1; m <= s.years * 12; m++) {
      sipCorpus = (sipCorpus + monthlySurplus) * (1 + monthlyReturn);
    }

    const totalWealth = investmentCorpus + sipCorpus;
    const rentAtEnd = s.monthlyRent * Math.pow(1 + s.annualRentIncrease / 100, s.years);

    return {
      rentToIncome, maxAffordableRent, affordabilityVerdict,
      totalRent, securityDeposit, brokerage,
      investmentCorpus, monthlySurplus, sipCorpus, totalWealth, rentAtEnd,
    };
  }, [s, cityData]);

  const affordColors = {
    healthy: 'bg-signal-buy-bg text-signal-buy-foreground',
    moderate: 'bg-signal-neutral-bg text-signal-neutral-foreground',
    stretched: 'bg-signal-rent-bg text-signal-rent-foreground',
  };

  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Renting Smart</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand your rent costs & investment potential</p>
      </div>

      {/* Compact inputs */}
      <div className="glass-card p-4 space-y-3">
        <CitySelector value={s.city} onChange={v => update('city', v)} />
        <div className="grid grid-cols-2 gap-2.5">
          <CurrencyInput label="Monthly rent" value={s.monthlyRent} onChange={v => update('monthlyRent', v)} />
          <CurrencyInput label="Monthly income" value={s.monthlyIncome} onChange={v => update('monthlyIncome', v)} />
        </div>
        <CurrencyInput label="Current savings" value={s.savings} onChange={v => update('savings', v)} />
        <div className="grid grid-cols-2 gap-2.5">
          <PercentInput label="Rent hike/yr" value={s.annualRentIncrease} onChange={v => update('annualRentIncrease', v)} hint="5-10%" />
          <PercentInput label="Investment return" value={s.investmentReturn} onChange={v => update('investmentReturn', v)} hint="12-14%" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Time horizon</label>
          <div className="flex items-center gap-3">
            <Slider value={[s.years]} onValueChange={([v]) => update('years', v)} min={1} max={30} step={1} className="flex-1" />
            <span className="text-sm font-mono font-semibold w-12 text-right">{s.years}yr</span>
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Wallet className="h-4 w-4" /> Analyse My Rent
        </button>
      </div>

      {/* Results — progressive disclosure */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Affordability — always visible as summary card */}
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

            {/* Collapsible: Expense Breakdown */}
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
                      <ResultRow label={`Total rent (${s.years}yr)`} value={formatLakhs(analysis.totalRent)} />
                      <ResultRow label={`Rent at year ${s.years}`} value={`${formatINR(analysis.rentAtEnd)}/mo`} />
                      <div className="border-t border-border/30 my-1" />
                      <ResultRow label="Security deposit" value={formatINR(analysis.securityDeposit)} />
                      <ResultRow label="Brokerage" value={formatINR(analysis.brokerage)} />
                      <ResultRow label="Day-1 cash needed" value={formatINR(analysis.securityDeposit + analysis.brokerage + s.monthlyRent)} bold />
                      <p className="text-[11px] text-muted-foreground mt-2 italic">
                        Deposit: {cityData.avgRentDepositMonths}mo in {cityData.label}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapsible: Investment Tracker */}
            <div className="glass-card overflow-hidden">
              <button onClick={() => toggleSection('invest')} className="w-full p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Rent & Invest
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-primary">{formatLakhs(analysis.totalWealth)}</span>
                  {expandedSection === 'invest' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedSection === 'invest' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-0.5">
                      <ResultRow label="Savings grow to" value={formatLakhs(analysis.investmentCorpus)} />
                      <ResultRow label="Monthly SIP surplus" value={formatINR(analysis.monthlySurplus)} />
                      <ResultRow label="SIP corpus" value={formatLakhs(analysis.sipCorpus)} />
                      <div className="border-t border-border/30 my-1" />
                      <ResultRow label="Total projected wealth" value={formatLakhs(analysis.totalWealth)} bold />
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Lump sum + SIP at {s.investmentReturn}% for {s.years}yr
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
