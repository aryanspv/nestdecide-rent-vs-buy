import { useState } from 'react';
import { UserInputs } from '@/lib/calculations';
import { CITY_DATA } from '@/lib/locationData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, HelpCircle, Building2, Wallet, Settings2, MapPin } from 'lucide-react';

const CITIES = Object.entries(CITY_DATA).map(([value, data]) => ({
  value,
  label: data.label,
  appreciation: `${data.avgAppreciationRange[0]}–${data.avgAppreciationRange[1]}%`,
}));

type FormInputs = Omit<UserInputs, 'investmentReturn'>;

const DEFAULT_INPUTS: FormInputs = {
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
  annualRentIncrease: 8,
  locality: '',
  propertyType: 'apartment',
  furnishing: 'semi_furnished',
  userProfile: 'couple',
  commuteDistance: 10,
  safetyPriority: 3,
  resaleConcern: 3,
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

const PROFILE_OPTIONS = [
  { value: 'bachelor', label: 'Bachelor', desc: 'Single, high mobility' },
  { value: 'couple', label: 'Couple', desc: 'Dual income, moderate mobility' },
  { value: 'family', label: 'Family with kids', desc: 'School stability matters' },
  { value: 'retired', label: 'Retired / Settled', desc: 'Low mobility, settled' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'independent_house', label: 'Independent House' },
  { value: 'villa', label: 'Villa / Gated Community' },
];

const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-furnished' },
  { value: 'fully_furnished', label: 'Fully furnished' },
];

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Not important',
  2: 'Slightly',
  3: 'Moderate',
  4: 'Important',
  5: 'Critical',
};

const STEPS = [
  { title: 'Your Situation', icon: Wallet, description: 'Income, rent & savings' },
  { title: 'The Property', icon: Building2, description: 'Price, loan & costs' },
  { title: 'Location & You', icon: MapPin, description: 'Area, lifestyle & profile' },
  { title: 'Assumptions', icon: Settings2, description: 'Appreciation & rent growth' },
];

export default function InputForm({ onCalculate }: InputFormProps) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<FormInputs>(DEFAULT_INPUTS);

  const update = (field: keyof FormInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const selectedCity = CITIES.find(c => c.value === inputs.city);
  const cityData = CITY_DATA[inputs.city] ?? CITY_DATA.other;
  const downPaymentPct = inputs.propertyPrice > 0 ? ((inputs.downPayment / inputs.propertyPrice) * 100).toFixed(1) : '0';
  const stampDutyHint = `Stamp duty: ${cityData.stampDutyPct}% + Registration: ${cityData.registrationPct}% = ₹${((inputs.propertyPrice * (cityData.stampDutyPct + cityData.registrationPct)) / 100 / 100000).toFixed(1)}L extra`;

  const handleSubmit = () => {
    onCalculate({ ...inputs, investmentReturn: 12 });
  };

  const lastStep = STEPS.length - 1;

  return (
    <div className="terminal-card p-6 md:p-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8 gap-1">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-all text-sm ${
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
          {/* Step 0: Situation */}
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
                        {c.label} <span className="text-muted-foreground ml-1 text-xs">({c.appreciation} avg)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CurrencyInput label="Current monthly rent" value={inputs.monthlyRent} onChange={v => update('monthlyRent', v)} />
              <CurrencyInput label="Monthly household income" value={inputs.monthlyIncome} onChange={v => update('monthlyIncome', v)} tooltip="Your total pre-tax household income from all sources" />
              <CurrencyInput label="Current savings" value={inputs.savings} onChange={v => update('savings', v)} tooltip="Total liquid savings you could use as down payment or keep as emergency fund" />
            </div>
          )}

          {/* Step 1: Property */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">The Property</h2>
              <CurrencyInput label="Property price" value={inputs.propertyPrice} onChange={v => update('propertyPrice', v)} hint={stampDutyHint} />
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
                tooltip="Recurring charges for society maintenance, property tax (monthly share), and repairs. We inflate this at 5%/year."
              />
            </div>
          )}

          {/* Step 2: Location & Lifestyle (NEW) */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-foreground">Location & You</h2>
              <p className="text-sm text-muted-foreground -mt-3">These factors shape our recommendation beyond just the numbers.</p>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Locality / Area
                  <InfoTip text="The specific neighborhood or area. This helps us contextualize pricing, safety, and rental market conditions." />
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Koramangala, Whitefield, Bandra West..."
                  value={inputs.locality}
                  onChange={(e) => update('locality', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Your profile</Label>
                <Select value={inputs.userProfile} onValueChange={(v) => update('userProfile', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROFILE_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label} <span className="text-muted-foreground ml-1 text-xs">— {p.desc}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inputs.userProfile === 'bachelor' && cityData.bachelorFriendliness < 3 && (
                  <p className="text-xs text-amber-500">Heads up: this city has significant bachelor rental discrimination.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Property type</Label>
                <Select value={inputs.propertyType} onValueChange={(v) => update('propertyType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPE_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Furnishing (if renting)</Label>
                <Select value={inputs.furnishing} onValueChange={(v) => update('furnishing', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FURNISHING_OPTIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Commute to work (one-way)
                  <InfoTip text="Distance to your workplace. We estimate commute costs at ₹{cityData.avgCommutePerKmMonthly}/km/month for this city." />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.commuteDistance]}
                    onValueChange={([v]) => update('commuteDistance', v)}
                    min={0}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-14 text-right">{inputs.commuteDistance} km</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  How important is neighbourhood safety?
                  <InfoTip text="High safety priority in lower-safety areas favours gated communities / owned property." />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.safetyPriority]}
                    onValueChange={([v]) => update('safetyPriority', v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-20 text-right">{PRIORITY_LABELS[inputs.safetyPriority]}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  How concerned are you about resale?
                  <InfoTip text="If you might need to sell quickly (job transfer, emergency), high concern means we factor in liquidity risk and potential price discount." />
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[inputs.resaleConcern]}
                    onValueChange={([v]) => update('resaleConcern', v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-20 text-right">{PRIORITY_LABELS[inputs.resaleConcern]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assumptions */}
          {step === 3 && (
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

        {step < lastStep ? (
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
