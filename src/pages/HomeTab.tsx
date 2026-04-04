import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Wallet, Target, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { TabId } from '@/components/BottomNav';
import { useUserData } from '@/contexts/UserDataContext';
import { CITY_DATA } from '@/lib/locationData';
import { CurrencyInput } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/formatCurrency';

interface HomeTabProps {
  onNavigate: (tab: TabId) => void;
}

const CITY_ICONS: Record<string, string> = {
  mumbai: '🏙️', delhi: '🕌', bengaluru: '💻', hyderabad: '🏰',
  pune: '🏫', chennai: '🛕', ahmedabad: '🏭', kolkata: '🌉',
  gurgaon: '🏢', noida: '🏗️', other: '📍',
};

const steps = [
  { icon: MapPin, title: 'Where are you?', subtitle: 'Pick your city for localized insights' },
  { icon: Wallet, title: 'Quick numbers', subtitle: 'We\'ll use these across all tabs' },
  { icon: Target, title: 'What\'s your goal?', subtitle: 'We\'ll take you to the right analysis' },
];

export default function HomeTab({ onNavigate }: HomeTabProps) {
  const shared = useUserData();
  const [step, setStep] = useState(0);

  const next = () => setStep(s => Math.min(s + 1, 2));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4 space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground font-['Space_Grotesk'] leading-tight">
          Should you <span className="text-primary">rent</span> or <span className="text-primary">buy</span>?
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          India's honest property decision engine. Let's set you up.
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 border border-border/30 text-xs text-muted-foreground mb-2">
          <span className="font-mono font-bold text-primary">{step + 1}/3</span>
          {steps[step].title}
        </div>
      </div>

      {/* Step content */}
      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait" custom={step}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground text-center">{steps[0].subtitle}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(CITY_DATA).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => {
                      shared.updateField('city', key);
                      next();
                    }}
                    className={`glass-card p-4 text-left transition-all duration-200 active:scale-[0.97] border ${
                      shared.city === key
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/30 hover:border-primary/30'
                    }`}
                  >
                    <span className="text-xl">{CITY_ICONS[key] ?? '📍'}</span>
                    <p className="text-sm font-semibold text-foreground mt-1">{data.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Yield {data.avgRentalYieldPct}% • Stamp {data.stampDutyPct}%
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">{steps[1].subtitle}</p>
              <div className="glass-card p-5 space-y-4">
                <CurrencyInput
                  label="Monthly rent"
                  value={shared.monthlyRent}
                  onChange={v => shared.updateField('monthlyRent', v)}
                />
                <CurrencyInput
                  label="Monthly income"
                  value={shared.monthlyIncome}
                  onChange={v => shared.updateField('monthlyIncome', v)}
                />
                <CurrencyInput
                  label="Current savings"
                  value={shared.savings}
                  onChange={v => shared.updateField('savings', v)}
                />
              </div>

              {/* Quick snapshot */}
              <div className="glass-card p-4 text-center space-y-1">
                <p className="text-xs text-muted-foreground">Rent-to-income ratio</p>
                <p className={`text-2xl font-bold font-mono ${
                  shared.monthlyIncome > 0 && (shared.monthlyRent / shared.monthlyIncome) > 0.3
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}>
                  {shared.monthlyIncome > 0
                    ? `${((shared.monthlyRent / shared.monthlyIncome) * 100).toFixed(0)}%`
                    : '—'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {shared.monthlyIncome > 0 && (shared.monthlyRent / shared.monthlyIncome) > 0.3
                    ? 'Above 30% — housing is eating into your savings capacity'
                    : 'Healthy — you have room for saving and investing'
                  }
                </p>
              </div>

              <Button onClick={next} className="w-full h-11 rounded-xl text-sm font-semibold gap-2" size="lg">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">{steps[2].subtitle}</p>

              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('compare')}
                  className="w-full glass-card p-5 flex items-center gap-4 text-left border border-primary/20 hover:border-primary/40 active:scale-[0.98] transition-all"
                >
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">Rent vs Buy Comparison</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Full 30-year analysis with story-mode results
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => onNavigate('rent')}
                  className="w-full glass-card p-5 flex items-center gap-4 text-left border border-blue-500/20 hover:border-blue-500/40 active:scale-[0.98] transition-all"
                >
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">Just explore renting</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rent affordability & expense breakdown
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => onNavigate('buy')}
                  className="w-full glass-card p-5 flex items-center gap-4 text-left border border-emerald-500/20 hover:border-emerald-500/40 active:scale-[0.98] transition-all"
                >
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">Analyze a property</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      EMI, hidden costs & equity building
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back button for steps 1-2 */}
      {step > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <button
            onClick={back}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        </motion.div>
      )}
    </div>
  );
}
