import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ChevronDown, ArrowRight } from 'lucide-react';
import type { AiInsights } from '@/hooks/useAiInsights';

function SkeletonPulse() {
  return (
    <div className="space-y-3 animate-pulse p-5">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-primary/20" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="h-5 w-4/5 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted/50" />
      <div className="h-3 w-3/4 rounded bg-muted/50" />
    </div>
  );
}

interface AiInsightsCardProps {
  insights: AiInsights | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function AiInsightsCard({ insights, loading, error, onRetry }: AiInsightsCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/10">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse" />
        <SkeletonPulse />
        <p className="text-xs text-muted-foreground px-5 pb-4 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary animate-spin" style={{ animationDuration: '3s' }} />
          Analyzing your scenario…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs font-medium text-primary hover:underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/10"
    >
      <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

      <div className="p-5 space-y-3">
        {/* Label */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">AI Insight</span>
        </div>

        {/* Headline — always visible */}
        <h3 className="text-lg font-bold text-foreground leading-snug font-['Space_Grotesk']">
          {insights.headline}
        </h3>

        {/* One-liner takeaway — always visible */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insights.tldr}
        </p>

        {/* Risk pill — always visible if present */}
        {insights.riskCallout && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/15 px-3 py-2 text-xs text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
            <span>{insights.riskCallout}</span>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
        >
          {expanded ? 'Less' : 'What should I do?'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Expandable details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-2"
            >
              {insights.actionItems.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{action}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
