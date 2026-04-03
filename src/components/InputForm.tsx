import { useState } from 'react';
import { UserInputs } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, HelpCircle, Building2, Wallet, Settings2 } from 'lucide-react';

const CITIES = [
  { value: 'mumbai', label: 'Mumbai', appreciation: '5–7%' },
  { value: 'delhi', label: 'Delhi NCR', appreciation: '4–6%' },
  { value: 'bengaluru', label: 'Bengaluru', appreciation: '6–8%' },
  { value: 'hyderabad', label: 'Hyderabad', appreciation: '7–9%' },
  { value: 'pune', label: 'Pune', appreciation: '5–7%' },
  { value: 'chennai', label: 'Chennai', appreciation: '4–6%' },
  { value: 'ahmedabad', label: 'Ahmedabad', appreciation: '4–6%' },
  { value: 'other', label: 'Other', appreciation: '4–6%' },
];

const DEFAULT_INPUTS: UserInputs = {
  city: 'bengaluru',
  monthlyRent: 30000,
  monthlyIncome: 150000,
  savings: 2000000,
  propertyPrice: 8000000,
  downPayment: 1600000,
  interestRate: 8.5,
  loanTenure: 20,
  monthlyMaintenance: 5000,
  plannedStay: 7,
  propertyAppreciation: 6,
  investmentReturn: 12,
  annualRentIncrease: 8,
};

interface InputFormProps {
  onCalculate: (inputs: UserInputs) => void;
}

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function CurrencyInput({ label, value, onChange, hint, tooltip }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string; tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <InfoTip text={tooltip} />}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pl-7"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PercentInput({ label, value, onChange, hint, tooltip }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string; tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {tooltip && <InfoTip text={tooltip} />}
      </Label>
      <div className="relative">
        <Input
          type="number"
          step="0.1"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pr-7"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const STEPS = [
  { title: 'Your Situation', icon: Wallet, description: 'Income, rent & savings' },
  { title: 'The Property', icon: Building2, description: 'Price, loan & costs' },
  { title: 'Assumptions', icon: Settings2, description: 'Appreciation & returns' },
];

export default function InputForm({ onCalculate }: InputFormProps) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<UserInputs>(DEFAULT_INPUTS);

  const update = (field: keyof UserInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const selectedCity = CITIES.find(c => c.value === inputs.city);
  const downPaymentPct = inputs.propertyPrice > 0 ? ((inputs.downPayment / inputs.propertyPrice) * 100).toFixed(1) : '0';

  const handleSubmit = () => {
    onCalculate(inputs);
  };

  return (
    <div className="terminal-card p-6 md:p-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
              i === step
                ? 'bg-primary text-primary-foreground'
                : i < step
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <s.icon className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">{s.title}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">Your Situation</h2>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">City</Label>
                <Select value={inputs.city} onValueChange={(v) => update('city', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label} <span className="text-muted-foreground ml-1 text-xs">({c.appreciation} avg appreciation)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CurrencyInput label="Current monthly rent" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} />
              <CurrencyInput label="Monthly household income" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} tooltip="Your total pre-tax household income from all sources" />
              <CurrencyInput label="Current savings / investable amount" value={inputs.savings} onChange={v => update('savings', v)} tooltip="Total liquid savings you could invest or use as down payment" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">The Property</h2>
              <CurrencyInput label="Property price" value={inputs.propertyPrice} onChange={v => update('propertyPrice', v)} />
              <CurrencyInput
                label="Down payment"
                value={inputs.downPayment}
                onChange={v => update('downPayment', v)}
                hint={`${downPaymentPct}% of property value`}
              />
              <PercentInput
                label="Home loan interest rate"
                value={inputs.interestRate}
                onChange={v => update('interestRate', v)}
                hint="Current SBI rate: ~8.5%"
                tooltip="The annual interest rate on your home loan. Check your bank's latest rate."
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Loan tenure
                  <InfoTip text="Number of years to repay the home loan. Longer tenure means lower EMI but more total interest." />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.loanTenure]}
                    onValueChange={([v]) => update('loanTenure', v)}
                    min={5}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-14 text-right">{inputs.loanTenure} yrs</span>
                </div>
              </div>
              <CurrencyInput
                label="Monthly maintenance + society charges"
                value={inputs.monthlyMaintenance}
                onChange={v => update('monthlyMaintenance', v)}
                tooltip="Recurring charges for society maintenance, property tax (monthly share), and repairs."
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">Your Assumptions</h2>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  How long do you plan to stay?
                  <InfoTip text="The number of years you expect to live in this home. This is the most important variable." />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.plannedStay]}
                    onValueChange={([v]) => update('plannedStay', v)}
                    min={1}
                    max={30}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-14 text-right">{inputs.plannedStay} yrs</span>
                </div>
              </div>
              <PercentInput
                label="Expected property appreciation"
                value={inputs.propertyAppreciation}
                onChange={v => update('propertyAppreciation', v)}
                hint={selectedCity ? `${selectedCity.label} avg: ${selectedCity.appreciation}` : undefined}
                tooltip="How much you expect the property value to increase each year. Be realistic — past performance varies by micro-market."
              />
              <PercentInput
                label="Expected investment return (if you don't buy)"
                value={inputs.investmentReturn}
                onChange={v => update('investmentReturn', v)}
                hint="Nifty 50 historical avg: 12–14%"
                tooltip="If you don't buy, you'd invest your down payment and EMI savings. What annual return do you expect? Index funds have returned 12-14% historically."
              />
              <PercentInput
                label="Annual rent increase"
                value={inputs.annualRentIncrease}
                onChange={v => update('annualRentIncrease', v)}
                hint="Typical Indian metros: 7–10%"
                tooltip="How much your landlord raises rent each year. In Indian metros, 8-10% is common."
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} className="gap-1">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-1 bg-navy text-primary-foreground hover:bg-navy-light">
            Calculate <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
