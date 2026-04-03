import { CalculationResult } from '@/lib/calculations';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, DollarSign, ArrowRightLeft } from 'lucide-react';

interface VerdictCardProps {
  result: CalculationResult;
}

export default function VerdictCard({ result }: VerdictCardProps) {
  const { verdictAtTenure, breakEvenYear, netWorthDiffAtTenure, monthlyCashFlowDiff, plannedStay } = result;

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
        ? `Renting is financially smarter until Year ${breakEvenYear}`
        : `Renting is financially smarter for this tenure`,
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

  const config = verdictConfig[verdictAtTenure];
  const Icon = config.icon;

  const explanation = verdictAtTenure === 'BUY'
    ? `At your planned ${plannedStay}-year tenure, buying leaves you ${formatLakhs(Math.abs(netWorthDiffAtTenure))} wealthier than renting.${breakEvenYear ? ` The break-even happens at Year ${breakEvenYear}.` : ''}`
    : verdictAtTenure === 'RENT'
    ? `At your planned ${plannedStay}-year tenure, renting and investing the difference leaves you ${formatLakhs(Math.abs(netWorthDiffAtTenure))} wealthier.${breakEvenYear ? ` Buying makes more sense only if you stay ${breakEvenYear}+ years.` : ''}`
    : `The numbers are very close. Your decision should factor in lifestyle preferences, job stability, and emotional value of ownership.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`terminal-card border-2 ${config.borderClass} p-6 md:p-8`}
    >
      {/* Tag */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${config.tagClass}`}>
          {config.tag}
        </span>
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
      <p className="text-sm text-muted-foreground leading-relaxed">
        {explanation}
      </p>
    </motion.div>
  );
}
