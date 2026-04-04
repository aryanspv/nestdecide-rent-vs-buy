import { motion } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, ChevronDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { CalculationResult } from '@/lib/calculations';
import { formatLakhs, formatINR } from '@/lib/formatCurrency';
import NetWorthChart from './NetWorthChart';
import PeopleLikeYou from './PeopleLikeYou';
import AiInsightsCard from './AiInsightsCard';
import ShareVerdict from './ShareVerdict';
import type { AiInsights } from '@/hooks/useAiInsights';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import LocationInsights from './LocationInsights';
import UniqueInsights from './UniqueInsights';
import HonestBreakdown from './HonestBreakdown';

interface StoryResultProps {
  result: CalculationResult;
  profile: string;
  city: string;
  monthlyIncome: number;
  onModify: () => void;
  aiInsights: AiInsights | null;
  aiLoading: boolean;
  aiError: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function StoryResult({
  result, profile, city, monthlyIncome, onModify,
  aiInsights, aiLoading, aiError,
}: StoryResultProps) {
  const verdictRef = useRef<HTMLDivElement>(null);
  const { overallVerdict, netWorthDiffAtTenure, breakEvenYear, plannedStay, monthlyEmi } = result;

  const verdictConfig = {
    BUY: {
      label: 'BUY',
      gradient: 'from-signal-buy/20 to-signal-buy/5',
      border: 'border-signal-buy/30',
      tagBg: 'bg-signal-buy text-primary-foreground',
      icon: TrendingUp,
      headline: `Buying builds ₹${(Math.abs(netWorthDiffAtTenure) / 1e5).toFixed(0)}L more wealth`,
    },
    RENT: {
      label: 'RENT',
      gradient: 'from-signal-rent/20 to-signal-rent/5',
      border: 'border-signal-rent/30',
      tagBg: 'bg-signal-rent text-primary-foreground',
      icon: TrendingDown,
      headline: breakEvenYear
        ? `Renting saves you money until Year ${breakEvenYear}`
        : `Renting is the smarter financial path`,
    },
    NEUTRAL: {
      label: 'TOSS-UP',
      gradient: 'from-signal-neutral/20 to-signal-neutral/5',
      border: 'border-signal-neutral/30',
      tagBg: 'bg-signal-neutral text-signal-neutral-foreground',
      icon: ArrowRightLeft,
      headline: `It's nearly a coin flip at ${plannedStay} years`,
    },
  };

  const config = verdictConfig[overallVerdict];
  const Icon = config.icon;
  const emiBurden = Math.round((monthlyEmi / monthlyIncome) * 100);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">

      {/* ── HERO VERDICT ── */}
      <motion.div
        ref={verdictRef}
        variants={fadeUp}
        className={`relative overflow-hidden rounded-2xl border-2 ${config.border} bg-gradient-to-br ${config.gradient} backdrop-blur-sm`}
      >
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative p-6 md:p-8 space-y-5">
          {/* Tag */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-[0.2em] uppercase ${config.tagBg}`}>
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{plannedStay}-year horizon</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight font-['Space_Grotesk']">
            {config.headline}
          </h2>

          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-3">
            <MetricPill label="Wealth gap" value={Math.abs(netWorthDiffAtTenure)} formatter={formatLakhs} sub={netWorthDiffAtTenure > 0 ? 'Renting wins' : 'Buying wins'} />
            <MetricPill label="Monthly EMI" value={Math.round(monthlyEmi)} formatter={v => formatINR(v, true)} sub={`${emiBurden}% of income`} alert={emiBurden > 50} />
            <MetricPill label="Break-even" value={breakEvenYear ?? 0} formatter={n => breakEvenYear ? `Yr ${n}` : '30+'} sub={breakEvenYear ? 'Buy catches up' : 'Never catches up'} />
          </div>
        </div>
      </motion.div>

      {/* ── AI INSIGHTS ── */}
      <motion.div variants={fadeUp}>
        <AiInsightsCard insights={aiInsights} loading={aiLoading} error={aiError} />
      </motion.div>

      {/* ── NET WORTH CHART ── */}
      <motion.div variants={fadeUp}>
        <NetWorthChart snapshots={result.snapshots} plannedStay={plannedStay} breakEvenYear={breakEvenYear} />
      </motion.div>

      {/* ── PEOPLE LIKE YOU ── */}
      <motion.div variants={fadeUp}>
        <PeopleLikeYou profile={profile} city={city} monthlyIncome={monthlyIncome} />
      </motion.div>

      {/* ── DEEP DIVE (collapsed) ── */}
      <motion.div variants={fadeUp}>
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="location" className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
            <AccordionTrigger className="px-5 py-3.5 text-sm font-bold text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
              Location & Lifestyle
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <LocationInsights result={result} city={city} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="insights" className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
            <AccordionTrigger className="px-5 py-3.5 text-sm font-bold text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
              Deep Insights
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <UniqueInsights result={result} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="breakdown" className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
            <AccordionTrigger className="px-5 py-3.5 text-sm font-bold text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
              Honest Breakdown
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <HonestBreakdown result={result} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      {/* ── SHARE & MODIFY ── */}
      <motion.div variants={fadeUp} className="space-y-3 pb-2">
        <ShareVerdict targetRef={verdictRef} title="My NestDecide Comparison" />
        <div className="text-center">
          <button
            onClick={onModify}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            ← Change inputs & recalculate
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Small metric pill ── */
function MetricPill({
  label, value, formatter, sub, alert = false,
}: {
  label: string;
  value: number;
  formatter: (n: number) => string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl bg-background/60 backdrop-blur-sm border border-border/30 p-3 text-center space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
      <AnimatedNumber
        value={value}
        formatter={formatter}
        className={`text-lg md:text-xl font-bold font-mono ${alert ? 'text-destructive' : 'text-foreground'}`}
      />
      <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
    </div>
  );
}
