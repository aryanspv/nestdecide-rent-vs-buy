import { motion } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, Lightbulb, ChevronDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { CalculationResult } from '@/lib/calculations';
import { formatLakhs, formatINR } from '@/lib/formatCurrency';
import NetWorthChart from './NetWorthChart';
import LocationInsights from './LocationInsights';
import UniqueInsights from './UniqueInsights';
import HonestBreakdown from './HonestBreakdown';
import ShareVerdict from './ShareVerdict';
import PeopleLikeYou from './PeopleLikeYou';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface StoryResultProps {
  result: CalculationResult;
  profile: string;
  city: string;
  monthlyIncome: number;
  onModify: () => void;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function getSurprise(result: CalculationResult): { title: string; text: string } | null {
  const { uniqueInsights, overallVerdict } = result;

  // Pick the single most unexpected finding
  if (uniqueInsights.stressTest.riskLevel === 'danger') {
    return {
      title: 'Your EMI burden is dangerously high',
      text: `At ${uniqueInsights.stressTest.burdenPctCurrent.toFixed(0)}% of income, even a 1% rate hike would push you to ${uniqueInsights.stressTest.burdenPctPlus1.toFixed(0)}%. Build a larger emergency fund before committing.`,
    };
  }

  if (uniqueInsights.freedomMoney.delta > 20000) {
    return {
      title: 'Renting gives you significantly more monthly freedom',
      text: `You'd have ${formatINR(uniqueInsights.freedomMoney.delta)} more per month for lifestyle spending if you rent. That's ${formatINR(uniqueInsights.freedomMoney.delta * 12)}/year — enough for a vacation or serious investing.`,
    };
  }

  if (uniqueInsights.rentTrapYear && uniqueInsights.rentTrapYear <= 3) {
    return {
      title: 'You hit the rent trap surprisingly fast',
      text: `By Year ${uniqueInsights.rentTrapYear}, your cumulative rent exceeds the total transaction cost of buying. After that, every month of rent is money that could've built equity.`,
    };
  }

  if (overallVerdict === 'NEUTRAL') {
    return {
      title: 'This is genuinely a coin-flip decision',
      text: 'The financial difference between renting and buying is negligible at your tenure. Your decision should be driven by lifestyle: do you value flexibility or stability more?',
    };
  }

  return null;
}

export default function StoryResult({ result, profile, city, monthlyIncome, onModify }: StoryResultProps) {
  const verdictRef = useRef<HTMLDivElement>(null);
  const { overallVerdict, netWorthDiffAtTenure, breakEvenYear, plannedStay, verdictReasons } = result;

  const verdictConfig = {
    BUY: {
      label: 'BUY',
      color: 'text-signal-buy-foreground bg-signal-buy-bg border-signal-buy/30',
      icon: TrendingUp,
      headline: `Buying builds more wealth over ${plannedStay} years`,
    },
    RENT: {
      label: 'RENT',
      color: 'text-signal-rent-foreground bg-signal-rent-bg border-signal-rent/30',
      icon: TrendingDown,
      headline: breakEvenYear
        ? `Renting wins until Year ${breakEvenYear}`
        : `Renting is the smarter path for this tenure`,
    },
    NEUTRAL: {
      label: 'IT DEPENDS',
      color: 'text-signal-neutral-foreground bg-signal-neutral-bg border-signal-neutral/30',
      icon: ArrowRightLeft,
      headline: `It's a close call at ${plannedStay} years`,
    },
  };

  const config = verdictConfig[overallVerdict];
  const Icon = config.icon;
  const surprise = getSurprise(result);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* 1. HERO VERDICT */}
      <motion.div
        ref={verdictRef}
        variants={fadeUp}
        className={`terminal-card border-2 ${config.color} p-6 md:p-8 text-center space-y-4`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 border border-border/50">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-bold tracking-widest uppercase">{config.label}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {config.headline}
        </h2>

        <div className="flex justify-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="data-label mb-1">Wealth difference</p>
            <AnimatedNumber
              value={Math.abs(netWorthDiffAtTenure)}
              formatter={formatLakhs}
              className="text-3xl font-bold text-foreground font-mono"
            />
            <p className="text-xs text-muted-foreground mt-0.5">
              {netWorthDiffAtTenure > 0 ? 'Renting wins' : 'Buying wins'}
            </p>
          </div>
          <div className="text-center">
            <p className="data-label mb-1">Break-even</p>
            <AnimatedNumber
              value={breakEvenYear ?? 30}
              formatter={(n) => breakEvenYear ? `Year ${n}` : 'Never'}
              className="text-3xl font-bold text-foreground font-mono"
            />
          </div>
          <div className="text-center">
            <p className="data-label mb-1">Monthly EMI</p>
            <AnimatedNumber
              value={Math.round(result.monthlyEmi)}
              formatter={(n) => formatINR(n)}
              className="text-3xl font-bold text-foreground font-mono"
            />
          </div>
        </div>
      </motion.div>

      {/* 2. HERE'S WHY — top reasons */}
      <motion.div variants={fadeUp} className="terminal-card p-5 md:p-6 space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Here's why</h3>
        <div className="space-y-2">
          {verdictReasons.slice(0, 3).map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="leading-relaxed">{reason}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3. CHART */}
      <motion.div variants={fadeUp}>
        <NetWorthChart
          snapshots={result.snapshots}
          plannedStay={plannedStay}
          breakEvenYear={breakEvenYear}
        />
      </motion.div>

      {/* 4. WHAT SURPRISED US */}
      {surprise && (
        <motion.div variants={fadeUp} className="terminal-card p-5 md:p-6 border-l-4 border-l-primary/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">What surprised us</h3>
          </div>
          <p className="text-base font-semibold text-foreground mb-1">{surprise.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{surprise.text}</p>
        </motion.div>
      )}

      {/* 5. PEOPLE LIKE YOU */}
      <motion.div variants={fadeUp}>
        <PeopleLikeYou profile={profile} city={city} monthlyIncome={monthlyIncome} />
      </motion.div>

      {/* 6. DEEP DIVE (collapsible) */}
      <motion.div variants={fadeUp}>
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="location" className="terminal-card border-none">
            <AccordionTrigger className="px-5 py-4 text-sm font-bold text-foreground hover:no-underline">
              Location & Lifestyle Intelligence
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <LocationInsights result={result} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="insights" className="terminal-card border-none">
            <AccordionTrigger className="px-5 py-4 text-sm font-bold text-foreground hover:no-underline">
              Deep Insights
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <UniqueInsights result={result} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="breakdown" className="terminal-card border-none">
            <AccordionTrigger className="px-5 py-4 text-sm font-bold text-foreground hover:no-underline">
              Honest Breakdown
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <HonestBreakdown result={result} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      {/* SHARE + MODIFY */}
      <motion.div variants={fadeUp} className="space-y-3">
        <ShareVerdict targetRef={verdictRef} title="My NestDecide Comparison" />
        <div className="text-center pt-1">
          <button
            onClick={onModify}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            ← Modify inputs
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
