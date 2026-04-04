import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import type { AiInsights } from '@/hooks/useAiInsights';

const shimmer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

function SkeletonPulse() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-primary/20" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
      <div className="h-6 w-3/4 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-5/6 rounded bg-muted/60" />
        <div className="h-3 w-2/3 rounded bg-muted/60" />
      </div>
      <div className="grid grid-cols-1 gap-2 pt-2">
        <div className="h-10 rounded-xl bg-muted/40" />
        <div className="h-10 rounded-xl bg-muted/40" />
      </div>
    </div>
  );
}

interface AiInsightsCardProps {
  insights: AiInsights | null;
  loading: boolean;
  error: string | null;
}

export default function AiInsightsCard({ insights, loading, error }: AiInsightsCardProps) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/10 p-6">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
        <SkeletonPulse />
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          AI is analyzing your financial scenario...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/10"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <div className="p-5 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Analysis</span>
        </div>

        {/* Headline */}
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-snug font-['Space_Grotesk']">
          {insights.headline}
        </h3>

        {/* Narrative */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insights.narrative}
        </p>

        {/* Surprises */}
        {insights.surprises.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Surprises</p>
            {insights.surprises.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <Zap className="h-4 w-4 text-signal-neutral-foreground mt-0.5 shrink-0" />
                <span>{s}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Items */}
        {insights.actionItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What to do next</p>
            {insights.actionItems.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className="flex items-start gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm text-foreground"
              >
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{action}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Risk Callout */}
        {insights.riskCallout && (
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/15 px-3.5 py-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-foreground">{insights.riskCallout}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
