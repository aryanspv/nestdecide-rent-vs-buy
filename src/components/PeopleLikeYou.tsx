import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { getBenchmark } from '@/lib/benchmarkData';

interface PeopleLikeYouProps {
  profile: string;
  city: string;
  monthlyIncome: number;
}

export default function PeopleLikeYou({ profile, city, monthlyIncome }: PeopleLikeYouProps) {
  const benchmark = getBenchmark(profile, city, monthlyIncome);
  if (!benchmark) return null;

  const profileLabel = profile.charAt(0).toUpperCase() + profile.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="terminal-card p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
          <Users className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground">People Like You</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
          {profileLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {benchmark.insight}
      </p>
      <p className="text-xs text-muted-foreground/60 mt-3 italic">
        Based on housing trends and survey data for your profile and city.
      </p>
    </motion.div>
  );
}
