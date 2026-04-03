import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputForm from '@/components/InputForm';
import VerdictCard from '@/components/VerdictCard';
import NetWorthChart from '@/components/NetWorthChart';
import LocationInsights from '@/components/LocationInsights';
import ScenarioTabs from '@/components/ScenarioTabs';
import HonestBreakdown from '@/components/HonestBreakdown';
import { UserInputs, CalculationResult, calculate } from '@/lib/calculations';
import { Building2 } from 'lucide-react';

export default function Index() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = (userInputs: UserInputs) => {
    setLoading(true);
    setInputs(userInputs);

    setTimeout(() => {
      const res = calculate(userInputs);
      setResult(res);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-foreground" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">NestDecide</h1>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">India's most honest rent vs buy calculator</p>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Should you rent or buy?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Most calculators compare EMI vs rent. We model the <em>complete</em> picture —
              stamp duty, opportunity cost, rental yield, bachelor discrimination, resale risk,
              and net worth over 30 years.
            </p>
          </motion.div>
        )}

        {/* Input Form */}
        {!result && !loading && <InputForm onCalculate={handleCalculate} />}

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="terminal-card p-12 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-muted border-t-foreground animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">Modelling 30-year scenarios...</p>
              <p className="text-xs text-muted-foreground">Calculating EMI, stamp duty, opportunity cost, location intelligence & net worth trajectory</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && inputs && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <VerdictCard result={result} />

            <NetWorthChart
              snapshots={result.snapshots}
              plannedStay={inputs.plannedStay}
              breakEvenYear={result.breakEvenYear}
            />

            <LocationInsights result={result} />

            <ScenarioTabs inputs={inputs} />

            <HonestBreakdown result={result} />

            {/* Recalculate */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={() => { setResult(null); setInputs(null); }}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                ← Start a new calculation
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-8">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            NestDecide is a financial modelling tool. This is not financial advice.
            Consult a qualified financial advisor before making property decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
