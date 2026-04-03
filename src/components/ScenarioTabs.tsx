import { useState } from 'react';
import { UserInputs, calculate, CalculationResult } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import NetWorthChart from './NetWorthChart';

interface ScenarioTabsProps {
  inputs: UserInputs;
}

export default function ScenarioTabs({ inputs }: ScenarioTabsProps) {
  const [sensitivityAppreciation, setSensitivityAppreciation] = useState(inputs.propertyAppreciation);
  const [sensitivityStay, setSensitivityStay] = useState(inputs.plannedStay);

  const scenarios = {
    pessimistic: calculate({
      ...inputs,
      propertyAppreciation: inputs.propertyAppreciation - 2,
      investmentReturn: inputs.investmentReturn + 2,
    }),
    realistic: calculate(inputs),
    optimistic: calculate({
      ...inputs,
      propertyAppreciation: inputs.propertyAppreciation + 2,
      investmentReturn: inputs.investmentReturn - 2,
    }),
  };

  const sensitivityResult = calculate({
    ...inputs,
    propertyAppreciation: sensitivityAppreciation,
    plannedStay: sensitivityStay,
  });

  const scenarioLabel = (result: CalculationResult) => {
    if (result.breakEvenYear) return `Break-even: Year ${result.breakEvenYear}`;
    return 'No break-even in 30 years';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="terminal-card p-6 md:p-8"
    >
      <h3 className="text-lg font-bold text-foreground mb-1">Scenario Sensitivity</h3>
      <p className="text-sm text-muted-foreground mb-6">See how the verdict changes under different assumptions</p>

      <Tabs defaultValue="realistic" className="mb-8">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pessimistic">Pessimistic</TabsTrigger>
          <TabsTrigger value="realistic">Realistic</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic</TabsTrigger>
        </TabsList>

        {Object.entries(scenarios).map(([key, result]) => (
          <TabsContent key={key} value={key}>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground font-medium">{scenarioLabel(result)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {key === 'pessimistic' && `Property: ${inputs.propertyAppreciation - 2}%, Investment: ${inputs.investmentReturn + 2}%`}
                {key === 'realistic' && `Property: ${inputs.propertyAppreciation}%, Investment: ${inputs.investmentReturn}%`}
                {key === 'optimistic' && `Property: ${inputs.propertyAppreciation + 2}%, Investment: ${inputs.investmentReturn - 2}%`}
              </p>
            </div>
            <NetWorthChart
              snapshots={result.snapshots}
              plannedStay={inputs.plannedStay}
              breakEvenYear={result.breakEvenYear}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Sensitivity sliders */}
      <div className="space-y-6 border-t border-border pt-6">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">What if...</h4>

        <div className="space-y-2">
          <Label className="text-sm text-foreground">
            Property appreciates at <span className="font-mono font-bold">{sensitivityAppreciation}%</span> instead?
          </Label>
          <Slider
            value={[sensitivityAppreciation]}
            onValueChange={([v]) => setSensitivityAppreciation(v)}
            min={0}
            max={15}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground">
            {sensitivityResult.breakEvenYear
              ? `Break-even moves to Year ${sensitivityResult.breakEvenYear}`
              : 'No break-even in 30 years'}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-foreground">
            You stay <span className="font-mono font-bold">{sensitivityStay} years</span> instead?
          </Label>
          <Slider
            value={[sensitivityStay]}
            onValueChange={([v]) => setSensitivityStay(v)}
            min={1}
            max={30}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Verdict: <span className="font-medium">
              {sensitivityResult.verdictAtTenure === 'BUY' ? '🟢 Buy' : sensitivityResult.verdictAtTenure === 'RENT' ? '🔴 Rent' : '🟡 Neutral'}
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
