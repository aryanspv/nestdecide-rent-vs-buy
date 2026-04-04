import { motion } from 'framer-motion';
import { Home, Building2, GitCompareArrows, TrendingUp, Shield, MapPin, ArrowRight } from 'lucide-react';
import { TabId } from '@/components/BottomNav';

interface HomeTabProps {
  onNavigate: (tab: TabId) => void;
}

const features = [
  {
    id: 'rent' as TabId,
    icon: Home,
    title: 'Rent Analysis',
    description: 'Affordability check & expense breakdown',
    color: 'bg-blue-500/10 text-blue-500',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
  },
  {
    id: 'buy' as TabId,
    icon: Building2,
    title: 'Buy Analysis',
    description: 'EMI, hidden costs, tax benefits & long-term equity',
    color: 'bg-emerald-500/10 text-emerald-500',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    id: 'compare' as TabId,
    icon: GitCompareArrows,
    title: 'Rent vs Buy',
    description: '30-year financial comparison with location intelligence',
    color: 'bg-primary/10 text-primary',
    borderColor: 'border-primary/20 hover:border-primary/40',
  },
];

const highlights = [
  { icon: TrendingUp, text: '30-year financial modelling' },
  { icon: MapPin, text: '10+ Indian cities supported' },
  { icon: Shield, text: 'No signup required' },
];

export default function HomeTab({ onNavigate }: HomeTabProps) {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-6 space-y-3"
      >
        <h1 className="text-3xl font-bold text-foreground font-['Space_Grotesk'] leading-tight">
          Should you <span className="text-primary">rent</span> or <span className="text-primary">buy</span>?
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
          India's honest property decision engine. No bias, just math.
        </p>
      </motion.div>

      {/* Highlight chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {highlights.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/50 border border-border/30 text-xs text-muted-foreground"
          >
            <h.icon className="h-3 w-3" />
            {h.text}
          </div>
        ))}
      </motion.div>

      {/* Feature cards */}
      <div className="space-y-3">
        {features.map((feature, i) => (
          <motion.button
            key={feature.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            onClick={() => onNavigate(feature.id)}
            className={`w-full glass-card p-5 flex items-center gap-4 text-left border transition-all duration-200 ${feature.borderColor} active:scale-[0.98]`}
          >
            <div className={`p-3 rounded-2xl ${feature.color}`}>
              <feature.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground font-['Space_Grotesk']">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {feature.description}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Quick stat */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5 text-center space-y-2"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Did you know?</p>
        <p className="text-sm text-foreground leading-relaxed">
          In most Indian cities, renting + investing beats buying for stays under <span className="font-bold text-primary">5–7 years</span>. 
          But your city, lifestyle, and numbers matter — let's find out.
        </p>
      </motion.div>
    </div>
  );
}
