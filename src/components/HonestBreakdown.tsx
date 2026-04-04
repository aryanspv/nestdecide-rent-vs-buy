import { CalculationResult } from '@/lib/calculations';
import { formatINR, formatLakhs } from '@/lib/formatCurrency';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface HonestBreakdownProps {
  result: CalculationResult;
}

export default function HonestBreakdown({ result }: HonestBreakdownProps) {
  const [open, setOpen] = useState(false);

  const buyItems = [
    { label: 'Total interest paid on home loan', value: formatLakhs(result.totalInterestPaid) },
    { label: 'Stamp duty (paid upfront)', value: formatLakhs(result.stampDutyCost) },
    { label: 'Registration charges (paid upfront)', value: formatLakhs(result.registrationCost) },
    { label: 'Brokerage — buy side', value: formatLakhs(result.brokerageBuyCost) },
    { label: 'Total transaction cost (day-1 hidden cost)', value: formatLakhs(result.totalTransactionCost) },
    { label: 'Total maintenance + society charges', value: formatLakhs(result.totalMaintenanceCost) },
    { label: 'Property tax (cumulative)', value: formatLakhs(result.propertyTaxTotal) },
    
    { label: 'Tax benefit (Sec 80C — principal)', value: formatLakhs(result.taxBenefit80C) },
    { label: 'Tax benefit (Sec 24B — interest)', value: formatLakhs(result.taxBenefit24B) },
    { label: 'Total estimated tax benefit', value: formatLakhs(result.totalTaxBenefit) },
    { label: 'Property value at tenure end', value: formatLakhs(result.propertyValueAtEnd) },
    { label: 'Net equity at tenure end', value: formatLakhs(result.netEquityAtEnd) },
  ];

  const rentItems = [
    { label: 'Total rent paid over tenure', value: formatLakhs(result.totalRentPaid) },
    { label: 'Security deposit locked', value: formatLakhs(result.rentalDepositLocked) },
    
    { label: 'Brokerage — rent side', value: formatINR(result.brokerageRentCost) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="terminal-card p-6 md:p-8 w-full text-left flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div>
            <h3 className="text-lg font-bold text-foreground">How we calculated this</h3>
            <p className="text-sm text-muted-foreground">Every number, transparent. No black-box scores.</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="terminal-card border-t-0 rounded-t-none px-6 md:px-8 pb-6">
            {/* Buy Side */}
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-4 mb-3">If You Buy</h4>
            <div className="divide-y divide-border">
              {buyItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground pr-4">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-foreground whitespace-nowrap">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Rent Side */}
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-6 mb-3">If You Rent</h4>
            <div className="divide-y divide-border">
              {rentItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground pr-4">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-foreground whitespace-nowrap">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Commute */}
            {result.commuteAnnualCost > 0 && (
              <>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-6 mb-3">Commute Cost (Same for Both)</h4>
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Estimated annual commute cost</span>
                  <span className="text-sm font-mono font-semibold text-foreground">{formatINR(result.commuteAnnualCost)}</span>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground mt-4 italic">
              Tax benefits calculated assuming 30% income tax bracket. Stamp duty & registration rates are state-specific averages.
              Maintenance inflated at 5%/year. Property tax at city-average rates on appreciating value.
              Actual figures may vary — consult a CA for precise tax planning.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
