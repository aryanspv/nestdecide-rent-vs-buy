import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CurrencyInput, PercentInput } from '@/components/FormField';
import CitySelector from '@/components/CitySelector';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { CITY_DATA } from '@/lib/locationData';
import { Slider } from '@/components/ui/slider';
import { Wallet, TrendingUp, PiggyBank, Receipt, IndianRupee, ArrowUpRight } from 'lucide-react';

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

export default function RentTab() {
  const [s, setS] = useState<RentState>(DEFAULT);
  const update = <K extends keyof RentState>(key: K, val: RentState[K]) =>
    setS(prev => ({ ...prev, [key]: val }));

  const cityData = CITY_DATA[s.city] ?? CITY_DATA.other;

  const analysis = useMemo(() => {
    // Affordability
    const rentToIncome = (s.monthlyRent / s.monthlyIncome) * 100;
    const maxAffordableRent = s.monthlyIncome * 0.3;
    const affordabilityVerdict = rentToIncome <= 25 ? 'healthy' : rentToIncome <= 35 ? 'moderate' : 'stretched';

    // Rent expense breakdown over years
    let totalRent = 0;
    let currentRent = s.monthlyRent;
    const yearlyRents: number[] = [];
    for (let y = 1; y <= s.years; y++) {
      const annualRent = currentRent * 12;
      totalRent += annualRent;
      yearlyRents.push(annualRent);
      currentRent *= 1 + s.annualRentIncrease / 100;
    }

    const securityDeposit = s.monthlyRent * cityData.avgRentDepositMonths;
    const brokerage = s.monthlyRent * cityData.brokerageRentMonths;

    // Rent vs invest tracker
    // If renting, you invest savings at investmentReturn
    const investmentCorpus = s.savings * Math.pow(1 + s.investmentReturn / 100, s.years);
    const investmentGrowth = investmentCorpus - s.savings;

    // Monthly investable surplus (income - rent - estimated living expenses ~40% of income)
    const monthlySurplus = Math.max(0, s.monthlyIncome - s.monthlyRent - s.monthlyIncome * 0.4);
    // Compound monthly surplus invested
    let sipCorpus = 0;
    const monthlyReturn = s.investmentReturn / 100 / 12;
    for (let m = 1; m <= s.years * 12; m++) {
      sipCorpus = (sipCorpus + monthlySurplus) * (1 + monthlyReturn);
    }

    const totalWealth = investmentCorpus + sipCorpus;
    const rentAtEnd = s.monthlyRent * Math.pow(1 + s.annualRentIncrease / 100, s.years);

    return {
      rentToIncome,
      maxAffordableRent,
      affordabilityVerdict,
      totalRent,
      yearlyRents,
      securityDeposit,
      brokerage,
      investmentCorpus,
      investmentGrowth,
      monthlySurplus,
      sipCorpus,
      totalWealth,
      rentAtEnd,
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
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Renting Smart</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand your rent costs, affordability & investment potential</p>
      </div>

      {/* Inputs */}
      <div className="glass-card p-5 space-y-4">
        <CitySelector value={s.city} onChange={v => update('city', v)} />
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput label="Monthly rent" value={s.monthlyRent} onChange={v => update('monthlyRent', v)} />
          <CurrencyInput label="Monthly income" value={s.monthlyIncome} onChange={v => update('monthlyIncome', v)} />
        </div>
        <CurrencyInput label="Current savings" value={s.savings} onChange={v => update('savings', v)} tooltip="Liquid savings you could invest" />
        <div className="grid grid-cols-2 gap-3">
          <PercentInput label="Annual rent hike" value={s.annualRentIncrease} onChange={v => update('annualRentIncrease', v)} hint="Typical: 5-10%" />
          <PercentInput label="Investment return" value={s.investmentReturn} onChange={v => update('investmentReturn', v)} hint="Nifty 50: 12-14%" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Time horizon</label>
          <div className="flex items-center gap-4">
            <Slider value={[s.years]} onValueChange={([v]) => update('years', v)} min={1} max={30} step={1} className="flex-1" />
            <span className="text-sm font-mono font-semibold text-foreground w-14 text-right">{s.years} yrs</span>
          </div>
        </div>
      </div>

      {/* Affordability */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Affordability Check
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${affordColors[analysis.affordabilityVerdict]}`}>
              {analysis.affordabilityVerdict}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Rent-to-income ratio</span>
                <span className="font-semibold text-foreground">{analysis.rentToIncome.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    analysis.affordabilityVerdict === 'healthy' ? 'bg-signal-buy' :
                    analysis.affordabilityVerdict === 'moderate' ? 'bg-signal-neutral' : 'bg-destructive'
                  }`}
                  style={{ width: `${Math.min(analysis.rentToIncome, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0%</span>
                <span>25% ideal</span>
                <span>35% max</span>
              </div>
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Max affordable rent (30% rule)</span>
              <span className="font-mono font-semibold text-foreground">{formatINR(analysis.maxAffordableRent)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rent Expense Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2 mb-4">
            <Receipt className="h-4 w-4" /> Rent Expense Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard icon={IndianRupee} label={`Total rent (${s.years}yr)`} value={formatLakhs(analysis.totalRent)} />
            <StatCard icon={ArrowUpRight} label={`Rent at year ${s.years}`} value={formatINR(analysis.rentAtEnd)} sub="per month" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Security deposit</span>
              <span className="font-mono font-semibold text-foreground">{formatINR(analysis.securityDeposit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Brokerage</span>
              <span className="font-mono font-semibold text-foreground">{formatINR(analysis.brokerage)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/50 pt-2">
              <span className="text-muted-foreground">Day-1 cash needed</span>
              <span className="font-mono font-bold text-foreground">{formatINR(analysis.securityDeposit + analysis.brokerage + s.monthlyRent)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Deposit: {cityData.avgRentDepositMonths} months typical in {cityData.label}. Brokerage: {cityData.brokerageRentMonths} month(s).
          </p>
        </div>
      </motion.div>

      {/* Rent vs Invest Tracker */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-foreground font-['Space_Grotesk'] flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" /> Rent & Invest Tracker
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            If you keep renting and invest your savings + monthly surplus at {s.investmentReturn}% returns:
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              icon={PiggyBank}
              label="Savings grow to"
              value={formatLakhs(analysis.investmentCorpus)}
              sub={`From ${formatLakhs(s.savings)} in ${s.years} yrs`}
            />
            <StatCard
              icon={TrendingUp}
              label="SIP corpus"
              value={formatLakhs(analysis.sipCorpus)}
              sub={`${formatINR(analysis.monthlySurplus)}/mo invested`}
            />
          </div>
          <div className="bg-accent/50 rounded-xl p-4 border border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total projected wealth</span>
              <span className="text-xl font-bold text-foreground font-['Space_Grotesk']">{formatLakhs(analysis.totalWealth)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lump sum ({formatLakhs(s.savings)}) + monthly SIP ({formatINR(analysis.monthlySurplus)}) compounding at {s.investmentReturn}% for {s.years} years
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
