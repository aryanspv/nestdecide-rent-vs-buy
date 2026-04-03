import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Building2, IndianRupee, Percent, Clock, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

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

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${accent ?? 'bg-accent'}`}>
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground font-['Space_Grotesk']">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
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

    // Property value at end of tenure
    const propertyAtEnd = s.propertyPrice * Math.pow(1 + s.propertyAppreciation / 100, s.loanTenure);
    const totalMaintenanceCost = (() => {
      let total = 0;
      let m = s.monthlyMaintenance;
      for (let y = 0; y < s.loanTenure; y++) {
        total += m * 12;
        m *= 1.05;
      }
      return total;
    })();

    const totalCostOfOwnership = totalEmiPaid + totalUpfront - s.downPayment + totalMaintenanceCost;
    const netEquity = propertyAtEnd; // fully paid off

    // Tax benefits (approximate)
    const totalTaxBenefit = Math.min(150000, loanAmount / s.loanTenure) * 0.3 * s.loanTenure
      + Math.min(200000, totalInterest / s.loanTenure) * 0.3 * s.loanTenure;

    return {
      loanAmount,
      emi,
      totalEmiPaid,
      totalInterest,
      stampDuty,
      registration,
      brokerage,
      totalUpfront,
      emiToIncome,
      affordabilityVerdict,
      propertyAtEnd,
      totalMaintenanceCost,
      totalCostOfOwnership,
      netEquity,
      totalTaxBenefit,
      downPaymentPct: s.propertyPrice > 0 ? (s.downPayment / s.propertyPrice * 100) : 0,
    };
  }, [s, cityData]);

  const affordColors = {
    healthy: 'bg-signal-buy-bg text-signal-buy-foreground',
    moderate: 'bg-signal-neutral-bg text-signal-neutral-foreground',
    stretched: 'bg-signal-rent-bg text-signal-rent-foreground',
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Buying a Home</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand the true cost of property ownership</p>
      </div>

      {/* Inputs */}
      <div className="glass-card p-5 space-y-4">
        <CitySelector value={s.city} onChange={v => update('city', v)} />
        <CurrencyInput
          label="Property price"
          value={s.propertyPrice}
          onChange={v => update('propertyPrice', v)}
          hint={`Stamp duty: ${cityData.stampDutyPct}% + Reg: ${cityData.registrationPct}% = ${formatLakhs(s.propertyPrice * (cityData.stampDutyPct + cityData.registrationPct) / 100)} extra`}
        />
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput label="Down payment" value={s.downPayment} onChange={v => update('downPayment', v)} hint={`${analysis.downPaymentPct.toFixed(0)}% of price`} />
          <CurrencyInput label="Monthly income" value={s.monthlyIncome} onChange={v => update('monthlyIncome', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PercentInput label="Interest rate" value={s.interestRate} onChange={v => update('interestRate', v)} hint="SBI: ~8.5%" />
          <PercentInput label="Appreciation" value={s.propertyAppreciation} onChange={v => update('propertyAppreciation', v)} hint={`${cityData.label}: ${cityData.avgAppreciationRange[0]}-${cityData.avgAppreciationRange[1]}%`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Loan tenure</label>
            <div className="flex items-center gap-3">
              <Slider value={[s.loanTenure]} onValueChange={([v]) => update('loanTenure', v)} min={5} max={30} step={1} className="flex-1" />
              <span className="text-sm font-mono font-semibold w-12 text-right">{s.loanTenure}yr</span>
            </div>
          </div>
          <CurrencyInput label="Maintenance/mo" value={s.monthlyMaintenance} onChange={v => update('monthlyMaintenance', v)} />
        </div>
      </div>

      {/* EMI & Affordability */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> EMI & Affordability
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${affordColors[analysis.affordabilityVerdict]}`}>
              {analysis.affordabilityVerdict}
            </span>
          </div>

          <div className="text-center py-4 mb-4 bg-accent/30 rounded-xl">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly EMI</p>
            <p className="text-3xl font-bold text-foreground font-['Space_Grotesk']">{formatINR(analysis.emi)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">EMI-to-income ratio</span>
              <span className="font-semibold">{analysis.emiToIncome.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  analysis.affordabilityVerdict === 'healthy' ? 'bg-signal-buy' :
                  analysis.affordabilityVerdict === 'moderate' ? 'bg-signal-neutral' : 'bg-destructive'
                }`}
                style={{ width: `${Math.min(analysis.emiToIncome, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>35% ideal</span>
              <span>50% max</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Numbers */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={IndianRupee} label="Total EMI paid" value={formatLakhs(analysis.totalEmiPaid)} sub={`Over ${s.loanTenure} years`} />
          <StatCard icon={Percent} label="Total interest" value={formatLakhs(analysis.totalInterest)} sub={`${(analysis.totalInterest / analysis.loanAmount * 100).toFixed(0)}% of loan`} />
          <StatCard icon={TrendingUp} label={`Property at yr ${s.loanTenure}`} value={formatLakhs(analysis.propertyAtEnd)} sub={`From ${formatLakhs(s.propertyPrice)}`} />
          <StatCard icon={Shield} label="Tax benefit" value={formatLakhs(analysis.totalTaxBenefit)} sub="80C + 24B estimated" />
        </div>
      </motion.div>

      {/* Hidden Costs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4" /> Day-1 Cash Outflow
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Down payment</span>
              <span className="font-mono font-semibold">{formatLakhs(s.downPayment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stamp duty ({cityData.stampDutyPct}%)</span>
              <span className="font-mono font-semibold">{formatLakhs(analysis.stampDuty)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Registration ({cityData.registrationPct}%)</span>
              <span className="font-mono font-semibold">{formatLakhs(analysis.registration)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Brokerage (~{cityData.brokerageBuyPct}%)</span>
              <span className="font-mono font-semibold">{formatLakhs(analysis.brokerage)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/50 pt-2">
              <span className="font-medium text-foreground">Total day-1 cash needed</span>
              <span className="font-mono font-bold text-foreground">{formatLakhs(analysis.totalUpfront)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Maintenance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4" /> Long-term Costs
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total maintenance ({s.loanTenure}yr, 5% inflation)</span>
              <span className="font-mono font-semibold">{formatLakhs(analysis.totalMaintenanceCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total cost of ownership</span>
              <span className="font-mono font-semibold">{formatLakhs(analysis.totalCostOfOwnership)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/50 pt-2">
              <span className="font-medium text-foreground">Net equity after {s.loanTenure}yr</span>
              <span className="font-mono font-bold text-signal-buy">{formatLakhs(analysis.netEquity)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
