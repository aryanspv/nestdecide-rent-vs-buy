import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav, { TabId } from '@/components/BottomNav';
import RentTab from '@/pages/RentTab';
import BuyTab from '@/pages/BuyTab';
import CompareTab from '@/pages/CompareTab';
import { Building2 } from 'lucide-react';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('rent');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground font-['Space_Grotesk'] tracking-tight">NestDecide</h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">
            India's honest rent vs buy engine
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'rent' && <RentTab />}
            {activeTab === 'buy' && <BuyTab />}
            {activeTab === 'compare' && <CompareTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Footer - hidden behind bottom nav on mobile, visible on scroll */}
      <footer className="border-t border-border/50 py-6 mt-8 mb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            NestDecide is a financial modelling tool, not financial advice.
            Consult a qualified advisor before making property decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
