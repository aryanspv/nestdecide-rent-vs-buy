import { useState } from 'react';
import { YearlySnapshot } from '@/lib/calculations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';

interface NetWorthChartProps {
  snapshots: YearlySnapshot[];
  plannedStay: number;
  breakEvenYear: number | null;
}

export default function NetWorthChart({ snapshots, plannedStay, breakEvenYear }: NetWorthChartProps) {
  const [showReal, setShowReal] = useState(false);

  const data = snapshots.map(s => ({
    year: s.year,
    buy: Math.round((showReal ? s.buyNetWorthReal : s.buyNetWorth) / 100000),
    rent: Math.round((showReal ? s.rentNetWorthReal : s.rentNetWorth) / 100000),
  }));

  const crossover = breakEvenYear ? data.find(d => d.year === breakEvenYear) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="terminal-card p-6 md:p-8"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-bold text-foreground">Net Worth Trajectory</h3>
          <p className="text-sm text-muted-foreground mb-6">30-year comparison: buying vs renting & investing</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-muted-foreground cursor-pointer" htmlFor="real-toggle">
            Today's ₹
          </label>
          <Switch
            id="real-toggle"
            checked={showReal}
            onCheckedChange={setShowReal}
            className="scale-75"
          />
        </div>
      </div>

      {showReal && (
        <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-1.5 mb-4">
          📉 Inflation-adjusted (6%/yr). These are values in today's purchasing power — the real picture most calculators hide.
        </p>
      )}

      <div className="h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(222, 60%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(222, 60%, 55%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradRent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: 'hsl(220, 13%, 87%)' }}
              label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: 'hsl(220, 13%, 87%)' }}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-xs font-bold text-foreground mb-2">Year {label}{showReal ? ' (today\'s ₹)' : ''}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
                        {p.dataKey === 'buy' ? 'If you buy' : 'If you rent'}: ₹{p.value}L
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="buy"
              stroke="hsl(222, 60%, 55%)"
              fill="url(#gradBuy)"
              strokeWidth={2}
              name="If you buy"
            />
            <Area
              type="monotone"
              dataKey="rent"
              stroke="hsl(152, 60%, 45%)"
              fill="url(#gradRent)"
              strokeWidth={2}
              name="If you rent"
            />
            <ReferenceLine
              x={plannedStay}
              stroke="hsl(220, 10%, 46%)"
              strokeDasharray="6 4"
              label={{ value: `Your tenure (${plannedStay}yr)`, position: 'top', fontSize: 11, fill: 'hsl(220, 10%, 46%)' }}
            />
            {crossover && (
              <ReferenceDot
                x={crossover.year}
                y={crossover.buy}
                r={6}
                fill="hsl(38, 92%, 50%)"
                stroke="hsl(0, 0%, 100%)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(222, 60%, 55%)' }} />
          If you buy
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(152, 60%, 45%)' }} />
          If you rent & invest
        </div>
        {breakEvenYear && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(38, 92%, 50%)' }} />
            Break-even: Year {breakEvenYear}
          </div>
        )}
      </div>
    </motion.div>
  );
}
