import { motion } from 'framer-motion';
import { formatINR } from '@/lib/formatCurrency';
import type { CalculationResult } from '@/lib/calculations';
import { Shield, AlertTriangle, Wallet, Target, Home } from 'lucide-react';

interface UniqueInsightsProps {
  result: CalculationResult;
}

function InsightCard({ icon: Icon, title, color, children }: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      <div className="text-sm text-muted-foreground space-y-1.5">
        {children}
      </div>
    </motion.div>
  );
}

function RiskBadge({ level }: { level: 'safe' | 'stretched' | 'danger' }) {
  const styles = {
    safe: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    stretched: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[level]}`}>
      {level === 'safe' ? '✓ Safe' : level === 'stretched' ? '⚠ Stretched' : '✗ Danger'}
    </span>
  );
}

export default function UniqueInsights({ result }: UniqueInsightsProps) {
  const { stressTest, rentTrapYear, freedomMoney, milestones, landlordRisk } = result.uniqueInsights;

  const reachableMilestones = milestones.filter(m => m.buyYear !== null || m.rentYear !== null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <h3 className="text-base font-bold text-foreground font-['Space_Grotesk']">Deep Insights</h3>

      {/* 1. EMI Stress Test */}
      <InsightCard icon={Shield} title="EMI Stress Test" color="bg-primary/15 text-primary">
        <div className="flex items-center justify-between">
          <span>Emergency runway</span>
          <span className="font-mono font-semibold text-foreground">
            {stressTest.emergencyRunwayMonths > 100 ? '∞' : `${stressTest.emergencyRunwayMonths} months`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>EMI burden (current)</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground">{stressTest.burdenPctCurrent.toFixed(0)}%</span>
            <RiskBadge level={stressTest.riskLevel} />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>If rates ↑ 1%</span>
          <span className="font-mono text-amber-400">+{formatINR(stressTest.emiDeltaPlus1)}/mo ({stressTest.burdenPctPlus1.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>If rates ↑ 2%</span>
          <span className="font-mono text-red-400">+{formatINR(stressTest.emiDeltaPlus2)}/mo ({stressTest.burdenPctPlus2.toFixed(0)}%)</span>
        </div>
      </InsightCard>

      {/* 2. Rent Trap Detector */}
      <InsightCard icon={AlertTriangle} title="Rent Trap Detector" color="bg-amber-500/15 text-amber-400">
        {rentTrapYear ? (
          <p>
            By <span className="font-semibold text-foreground">Year {rentTrapYear}</span>, your total rent will exceed the entire transaction cost of buying 
            (stamp duty + registration + brokerage = {formatINR(result.totalTransactionCost)}). After this, every month of rent is money that could've gone to equity.
          </p>
        ) : (
          <p>Your transaction costs are high enough that cumulative rent won't exceed them within 30 years — renting retains its cost advantage.</p>
        )}
      </InsightCard>

      {/* 4. Lifestyle Freedom Money */}
      <InsightCard icon={Wallet} title="Lifestyle Freedom Money" color="bg-emerald-500/15 text-emerald-400">
        <p className="text-xs">Monthly cash left after all housing costs — for travel, dining, hobbies.</p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">If you buy</p>
            <p className={`text-lg font-bold font-mono ${freedomMoney.buyer < 0 ? 'text-red-400' : 'text-foreground'}`}>
              {formatINR(freedomMoney.buyer)}
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">If you rent</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatINR(freedomMoney.renter)}
            </p>
          </div>
        </div>
        {freedomMoney.delta > 0 && (
          <p className="text-xs">
            Renting gives you <span className="font-semibold text-emerald-400">{formatINR(freedomMoney.delta)}/mo more</span> for lifestyle spending.
          </p>
        )}
      </InsightCard>

      {/* 5. Wealth Milestones (buy path only) */}
      {reachableMilestones.length > 0 && (
        <InsightCard icon={Target} title="Wealth Milestone Tracker" color="bg-purple-500/15 text-purple-400">
          <p className="text-xs">When your property equity hits these milestones:</p>
          <div className="space-y-2 pt-1">
            {reachableMilestones.filter(m => m.buyYear !== null).map(m => (
              <div key={m.label} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{m.label}</span>
                <span className="text-primary font-bold">Year {m.buyYear}</span>
              </div>
            ))}
          </div>
        </InsightCard>
      )}

      {/* 6. Landlord Risk Score */}
      <InsightCard icon={Home} title="Landlord Risk Score" color="bg-orange-500/15 text-orange-400">
        <div className="flex items-center justify-between">
          <span>Tenant protection</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            landlordRisk.protectionLevel === 'strong' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            landlordRisk.protectionLevel === 'moderate' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
            'bg-red-500/15 text-red-400 border-red-500/30'
          }`}>
            {landlordRisk.protectionLevel.charAt(0).toUpperCase() + landlordRisk.protectionLevel.slice(1)} ({landlordRisk.score}/5)
          </span>
        </div>
        <p>{landlordRisk.explanation}</p>
      </InsightCard>

    </motion.div>
  );
}
