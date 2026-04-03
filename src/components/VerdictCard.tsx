import { CalculationResult } from '@/lib/calculations';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, DollarSign, ArrowRightLeft, MapPin } from 'lucide-react';

interface VerdictCardProps {
  result: CalculationResult;
}

export default function VerdictCard({ result }: VerdictCardProps) {
  const {
    overallVerdict,
    financialVerdict,
    breakEvenYear,
    netWorthDiffAtTenure,
    monthlyCashFlowDiff,
    plannedStay,
    verdictReasons,
    locationInsight,
  } = result;

  const verdictConfig = {
    BUY: {
      tag: 'BUY NOW',
      tagClass: 'bg-signal-buy text-primary-foreground',
      borderClass: 'border-signal-buy/30',
      headline: `Buying makes sense at your ${plannedStay}-year horizon`,
      icon: TrendingUp,
    },
    RENT: {
      tag: 'RENT FOR NOW',
      tagClass: 'bg-signal-rent text-primary-foreground',
      borderClass: 'border-signal-rent/30',
      headline: breakEvenYear
        ? `Renting is smarter until Year ${breakEvenYear}`
        : `Renting is smarter for this tenure`,
      icon: TrendingDown,
    },
    NEUTRAL: {
      tag: 'IT DEPENDS',
      tagClass: 'bg-signal-neutral text-signal-neutral-foreground',
      borderClass: 'border-signal-neutral/30',
      headline: `It's a close call at ${plannedStay} years`,
      icon: ArrowRightLeft,
    },
  };

  const config = verdictConfig[overallVerdict];
  const Icon = config.icon;

  const explanation = overallVerdict === 'BUY'
    ? `At your planned ${plannedStay}-year tenure, buying leaves you ${formatLakhs(Math.abs(netWorthDiffAtTenure))} wealthier than renting.${breakEvenYear ? ` The break-even happens at Year ${breakEvenYear}.` : ''}`
    : overallVerdict === 'RENT'
    ? `At your planned ${plannedStay}-year tenure, renting and investing the difference leaves you ${formatLakhs(Math.abs(netWorthDiffAtTenure))} wealthier.${breakEvenYear ? ` Buying makes more sense only if you stay ${breakEvenYear}+ years.` : ''}`
    : `The numbers are very close. Your decision should factor in lifestyle preferences, job stability, and emotional value of ownership.`;

  // Show if financial and location verdicts conflict
  const hasConflict = (financialVerdict === 'BUY' && locationInsight.locationScore < 42)
    || (financialVerdict === 'RENT' && locationInsight.locationScore > 58);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`terminal-card border-2 ${config.borderClass} p-6 md:p-8`}
    >
      {/* Tags */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${config.tagClass}`}>
          {config.tag}
        </span>
        {financialVerdict !== overallVerdict && (
          <span className="px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase bg-muted text-muted-foreground">
            Numbers say {financialVerdict}
          </span>
        )}
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
        <Icon className="h-7 w-7 flex-shrink-0" />
        {config.headline}
      </h2>

      {/* 3 Key Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="data-label flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3" /> Break-even Year
          </div>
          <div className="text-2xl font-bold text-foreground">
            {breakEvenYear ? `Year ${breakEvenYear}` : 'Never (30yr)'}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="data-label flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3" /> Net Worth Difference
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatLakhs(Math.abs(netWorthDiffAtTenure))}
          </div>
          <div className="text-xs text-muted-foreground">
            {netWorthDiffAtTenure > 0 ? 'Renting wins' : 'Buying wins'} at Year {plannedStay}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="data-label flex items-center gap-1 mb-1">
            <ArrowRightLeft className="h-3 w-3" /> Monthly Cash Flow
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatINR(Math.abs(monthlyCashFlowDiff))}
          </div>
          <div className="text-xs text-muted-foreground">
            {monthlyCashFlowDiff > 0 ? 'Extra if you buy' : 'Less if you buy'} vs rent
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {explanation}
      </p>

      {/* Verdict Reasons */}
      {verdictReasons.length > 0 && (
        <div className="border-t border-border pt-3 mt-3 space-y-1">
          {verdictReasons.map((reason, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="mt-0.5">{i === 0 ? <DollarSign className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}</span>
              {reason}
            </p>
          ))}
        </div>
      )}

      {/* Conflict callout */}
      {hasConflict && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            The numbers and your lifestyle factors point in different directions. We recommend giving extra weight to whichever matters more to you — financial optimization or quality of life.
          </p>
        </div>
      )}
    </motion.div>
  );
}
