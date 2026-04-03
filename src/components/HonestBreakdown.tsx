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

  const items = [
    { label: 'Total interest paid on home loan', value: formatLakhs(result.totalInterestPaid), tooltip: 'Total interest component of EMI over the loan tenure' },
    { label: 'Total rent paid over same period', value: formatLakhs(result.totalRentPaid), tooltip: 'Sum of rent payments, increasing annually' },
    { label: 'Down payment opportunity cost', value: formatLakhs(result.downPaymentOpportunityCost), tooltip: 'What your down payment would have grown to if invested instead' },
    { label: 'Tax benefit (Section 80C — principal)', value: formatLakhs(result.taxBenefit80C), tooltip: 'Tax saved on principal repayment, max ₹1.5L/year deduction at 30% bracket' },
    { label: 'Tax benefit (Section 24B — interest)', value: formatLakhs(result.taxBenefit24B), tooltip: 'Tax saved on interest payment, max ₹2L/year deduction at 30% bracket' },
    { label: 'Total estimated tax benefit', value: formatLakhs(result.totalTaxBenefit), tooltip: 'Combined tax savings assuming 30% bracket' },
    { label: 'Total maintenance cost', value: formatLakhs(result.totalMaintenanceCost), tooltip: 'Society charges + maintenance over the period' },
    { label: 'Property value at tenure end', value: formatLakhs(result.propertyValueAtEnd), tooltip: 'Estimated property value based on your appreciation rate' },
    { label: 'Net equity at tenure end', value: formatLakhs(result.netEquityAtEnd), tooltip: 'Property value minus remaining loan outstanding' },
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
            <div className="divide-y divide-border">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground pr-4">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-foreground whitespace-nowrap">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Tax benefits calculated assuming 30% income tax bracket. Actual benefits depend on your specific tax situation. 
              Property appreciation and investment returns are estimates — actual returns may vary.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
