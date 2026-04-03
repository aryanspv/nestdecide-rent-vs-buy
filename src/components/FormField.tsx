import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">{text}</TooltipContent>
    </Tooltip>
  );
}

export function CurrencyInput({ label, value, onChange, hint, tooltip, placeholder }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string; tooltip?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <InfoTip text={tooltip} />}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pl-8 h-12 rounded-xl"
          placeholder={placeholder}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PercentInput({ label, value, onChange, hint, tooltip }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string; tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <InfoTip text={tooltip} />}
      </label>
      <div className="relative">
        <Input
          type="number"
          step="0.1"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pr-8 h-12 rounded-xl"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
