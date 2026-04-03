import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Building2, IndianRupee, TrendingUp, AlertTriangle, Clock, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface BuyState {
  city: string;
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTenure: number;
  monthlyMaintenance: number;
  propertyAppreciation: number;
  monthlyIncome: number;
}

const DEFAULT: BuyState = {
  city: 'bengaluru',
  propertyPrice: 8000000,
  downPayment: 1600000,
  interestRate: 8.5,
  loanTenure: 20,
  monthlyMaintenance: 5000,
  propertyAppreciation: 6,
  monthlyIncome: 150000,
};

function ResultRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex justify-between text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${bold ? 'font-bold' : 'font-semibold'} ${accent ?? 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function BuyTab() {
  const [s, setS] = useState<BuyState>(DEFAULT);
  const [showResults, setShowResults] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const update = <K extends keyof BuyState>(key: K, val: BuyState[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[s.city] ?? CITY_DATA.other;

  const analysis = useMemo(() => {
    const loanAmount = s.propertyPrice - s.downPayment;
    const emi = calculateEMI(loanAmount, s.interestRate, s.loanTenure);
    const totalEmiPaid = emi * s.loanTenure * 12;
    const totalInterest = totalEmiPaid - loanAmount;

    const stampDuty = s.propertyPrice * cityData.stampDutyPct / 100;
    const registration = s.propertyPrice * cityData.registrationPct / 100;
    const brokerage = s.propertyPrice * cityData.brokerageBuyPct / 100;
    const totalUpfront = s.downPayment + stampDuty + registration + brokerage;

    const emiToIncome = (emi / s.monthlyIncome) * 100;
    const affordabilityVerdict = emiToIncome <= 35 ? 'healthy' : emiToIncome <= 50 ? 'moderate' : 'stretched';

    const propertyAtEnd = s.propertyPrice * Math.pow(1 + s.propertyAppreciation / 100, s.loanTenure);
    let totalMaintenanceCost = 0;
    let m = s.monthlyMaintenance;
    for (let y = 0; y < s.loanTenure; y++) {
      totalMaintenanceCost += m * 12;
      m *= 1.05;
    }

    const totalCostOfOwnership = totalEmiPaid + totalUpfront - s.downPayment + totalMaintenanceCost;
    const totalTaxBenefit = Math.min(150000, loanAmount / s.loanTenure) * 0.3 * s.loanTenure
      + Math.min(200000, totalInterest / s.loanTenure) * 0.3 * s.loanTenure;

    return {
      loanAmount, emi, totalEmiPaid, totalInterest,
      stampDuty, registration, brokerage, totalUpfront,
      emiToIncome, affordabilityVerdict,
      propertyAtEnd, totalMaintenanceCost, totalCostOfOwnership,
      totalTaxBenefit,
      downPaymentPct: s.propertyPrice > 0 ? (s.downPayment / s.propertyPrice * 100) : 0,
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
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Buying a Home</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand the true cost of ownership</p>
      </div>

      {/* Inputs */}
      <div className="glass-card p-4 space-y-3">
        <CitySelector value={s.city} onChange={v => update('city', v)} />
        <CurrencyInput label="Property price" value={s.propertyPrice} onChange={v => update('propertyPrice', v)} />
        <div className="grid grid-cols-2 gap-2.5">
          <CurrencyInput label="Down payment" value={s.downPayment} onChange={v => update('downPayment', v)} hint={`${analysis.downPaymentPct.toFixed(0)}%`} />
          <CurrencyInput label="Monthly income" value={s.monthlyIncome} onChange={v => update('monthlyIncome', v)} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <PercentInput label="Interest rate" value={s.interestRate} onChange={v => update('interestRate', v)} hint="~8.5%" />
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

        <button
          onClick={() => setShowResults(true)}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Building2 className="h-4 w-4" /> Analyse Purchase
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* EMI summary — always visible */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" /> EMI & Affordability
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${affordColors[analysis.affordabilityVerdict]}`}>
                  {analysis.affordabilityVerdict}
                </span>
              </div>
              <div className="text-center py-3 mb-3 bg-accent/30 rounded-xl">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">Monthly EMI</p>
                <p className="text-2xl font-bold text-foreground font-['Space_Grotesk']">{formatINR(analysis.emi)}</p>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">EMI-to-income</span>
                <span className="font-semibold">{analysis.emiToIncome.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    analysis.affordabilityVerdict === 'healthy' ? 'bg-signal-buy' :
                    analysis.affordabilityVerdict === 'moderate' ? 'bg-signal-neutral' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(analysis.emiToIncome, 100)}%` }}
                />
              </div>
            </div>

            {/* Day-1 Costs */}
            <div className="glass-card overflow-hidden">
              <button onClick={() => toggleSection('upfront')} className="w-full p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Day-1 Cash Outflow
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-foreground">{formatLakhs(analysis.totalUpfront)}</span>
                  {expandedSection === 'upfront' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedSection === 'upfront' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-0.5">
                      <ResultRow label="Down payment" value={formatLakhs(s.downPayment)} />
                      <ResultRow label={`Stamp duty (${cityData.stampDutyPct}%)`} value={formatLakhs(analysis.stampDuty)} />
                      <ResultRow label={`Registration (${cityData.registrationPct}%)`} value={formatLakhs(analysis.registration)} />
                      <ResultRow label={`Brokerage (~${cityData.brokerageBuyPct}%)`} value={formatLakhs(analysis.brokerage)} />
                      <div className="border-t border-border/30 my-1" />
                      <ResultRow label="Total day-1 cash" value={formatLakhs(analysis.totalUpfront)} bold />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Long-term */}
            <div className="glass-card overflow-hidden">
              <button onClick={() => toggleSection('longterm')} className="w-full p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {s.loanTenure}-Year Outlook
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-signal-buy">{formatLakhs(analysis.propertyAtEnd)}</span>
                  {expandedSection === 'longterm' ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {expandedSection === 'longterm' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-0.5">
                      <ResultRow label="Total EMI paid" value={formatLakhs(analysis.totalEmiPaid)} />
                      <ResultRow label="Total interest" value={formatLakhs(analysis.totalInterest)} />
                      <ResultRow label="Maintenance" value={formatLakhs(analysis.totalMaintenanceCost)} />
                      <ResultRow label="Tax benefit (80C + 24B)" value={formatLakhs(analysis.totalTaxBenefit)} accent="text-signal-buy" />
                      <div className="border-t border-border/30 my-1" />
                      <ResultRow label={`Property value at yr ${s.loanTenure}`} value={formatLakhs(analysis.propertyAtEnd)} bold accent="text-signal-buy" />
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
