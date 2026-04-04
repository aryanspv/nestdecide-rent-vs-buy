import { CalculationResult } from '@/lib/calculations';
import { getCityData } from '@/lib/locationData';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { motion } from 'framer-motion';
import { MapPin, Shield, Users, TrendingUp, AlertTriangle, Home, Banknote, Car, Wind } from 'lucide-react';

interface LocationInsightsProps {
  result: CalculationResult;
  city?: string;
}

function ScoreBar({ score, maxScore = 10, color }: { score: number; maxScore?: number; color: string }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function InsightCard({ icon: Icon, title, children, accent }: {
  icon: React.ElementType; title: string; children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-muted rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent ?? 'text-foreground'}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export default function LocationInsights({ result, city }: LocationInsightsProps) {
  const { locationInsight: li } = result;
  const cd = getCityData(city ?? 'other');

  const scoreColor = li.locationScore >= 60
    ? 'hsl(var(--signal-buy))'
    : li.locationScore <= 40
    ? 'hsl(var(--signal-rent))'
    : 'hsl(var(--signal-neutral))';

  const verdictText: Record<string, string> = {
    strongly_favours_buy: 'Strongly favours buying',
    slightly_favours_buy: 'Slightly favours buying',
    neutral: 'Neutral',
    slightly_favours_rent: 'Slightly favours renting',
    strongly_favours_rent: 'Strongly favours renting',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="terminal-card p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-bold text-foreground">Location & Lifestyle Intelligence</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Beyond the numbers — factors that most calculators ignore</p>

      {/* Location Score Gauge */}
      <div className="bg-muted rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Location Score</span>
          <span className="text-sm font-mono font-bold" style={{ color: scoreColor }}>
            {li.locationScore}/100 — {verdictText[li.locationVerdict]}
          </span>
        </div>
        <div className="w-full h-3 bg-background rounded-full overflow-hidden relative">
          {/* Gradient bar from rent to buy */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'linear-gradient(to right, hsl(var(--signal-rent)), hsl(var(--signal-neutral)), hsl(var(--signal-buy)))',
            opacity: 0.3,
          }} />
          {/* Marker */}
          <div
            className="absolute top-0 h-full w-1 rounded-full bg-foreground transition-all"
            style={{ left: `${li.locationScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Favours Rent</span>
          <span>Favours Buy</span>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{li.locationExplanation}</p>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Rental Yield Analysis */}
        <InsightCard icon={TrendingUp} title="Rental Yield Analysis" accent={
          li.rentalYield.verdict === 'underpriced' ? 'text-green-500' : li.rentalYield.verdict === 'overpriced' ? 'text-red-500' : 'text-foreground'
        }>
          <p>{li.rentalYield.explanation}</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span>Your yield: <strong className="text-foreground">{li.rentalYield.impliedYield.toFixed(1)}%</strong></span>
            <span>City avg: <strong className="text-foreground">{li.rentalYield.cityAvgYield.toFixed(1)}%</strong></span>
          </div>
        </InsightCard>

        {/* Mobility Score */}
        <InsightCard icon={Users} title="Mobility vs Stability">
          <p>{li.mobility.explanation}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Settled</span>
              <span>Highly mobile</span>
            </div>
            <ScoreBar score={li.mobility.score} color={li.mobility.score >= 7 ? 'hsl(var(--signal-rent))' : li.mobility.score <= 3 ? 'hsl(var(--signal-buy))' : 'hsl(var(--signal-neutral))'} />
          </div>
        </InsightCard>

        {/* Bachelor Insight (conditional) */}
        {li.bachelorInsight.relevant && (
          <InsightCard icon={Home} title="Bachelor Rental Reality" accent={
            li.bachelorInsight.severity === 'severe' ? 'text-red-500' : li.bachelorInsight.severity === 'moderate' ? 'text-amber-500' : 'text-foreground'
          }>
            <p>{li.bachelorInsight.explanation}</p>
          </InsightCard>
        )}

        {/* Liquidity Risk */}
        <InsightCard icon={AlertTriangle} title="Resale Liquidity Risk" accent={
          li.liquidity.riskLevel === 'high' ? 'text-red-500' : li.liquidity.riskLevel === 'medium' ? 'text-amber-500' : 'text-green-500'
        }>
          <p>{li.liquidity.explanation}</p>
          <div className="mt-2 text-xs">
            <span>Risk: <strong className="text-foreground capitalize">{li.liquidity.riskLevel}</strong></span>
            <span className="ml-4">Quick-sale discount: <strong className="text-foreground">~{li.liquidity.discountPct}%</strong></span>
          </div>
        </InsightCard>
      </div>

      {/* Hidden Costs Comparison */}
      <div className="border-t border-border pt-5">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Banknote className="h-4 w-4" />
          Hidden Costs Most Calculators Miss
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy Side */}
          <div>
            <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> If You Buy
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stamp duty</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(li.hiddenBuyCosts.stampDuty)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registration</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(li.hiddenBuyCosts.registration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Brokerage (~1%)</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(li.hiddenBuyCosts.brokerageBuy)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-foreground font-medium">Total upfront hidden cost</span>
                <span className="font-mono font-bold text-foreground">{formatLakhs(li.hiddenBuyCosts.totalUpfront)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Property tax (over tenure)</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(result.propertyTaxTotal)}</span>
              </div>
            </div>
          </div>

          {/* Rent Side */}
          <div>
            <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Home className="h-3 w-3" /> If You Rent
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Security deposit locked</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(result.rentalDepositLocked)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit opportunity cost</span>
                <span className="font-mono font-semibold text-foreground">{formatLakhs(result.rentalDepositOpportunityCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Brokerage</span>
                <span className="font-mono font-semibold text-foreground">{formatINR(result.brokerageRentCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
