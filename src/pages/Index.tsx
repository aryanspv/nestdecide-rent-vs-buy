import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav, { TabId } from '@/components/BottomNav';
import HomeTab from '@/pages/HomeTab';
import RentTab from '@/pages/RentTab';
import BuyTab from '@/pages/BuyTab';
import CompareTab from '@/pages/CompareTab';
import AboutPage from '@/pages/AboutPage';
import AppPermissionsPage from '@/pages/AppPermissionsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfileMenu, { ProfilePage } from '@/components/ProfileMenu';
import { UserDataProvider } from '@/contexts/UserDataContext';
import { Building2 } from 'lucide-react';

type Page = 'tabs' | ProfilePage;

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [page, setPage] = useState<Page>('tabs');

  const goHome = () => {
    setPage('tabs');
    setActiveTab('home');
  };

  return (
    <UserDataProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
            <button
              onClick={goHome}
              className="flex items-center gap-2 active:scale-95 transition-transform"
            >
              <div className="p-1.5 rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground font-['Space_Grotesk'] tracking-tight">NestDecide</h1>
            </button>
            <ProfileMenu onNavigate={(p) => setPage(p)} />
          </div>
        </header>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 pt-4 safe-bottom">
          <AnimatePresence mode="wait">
            <motion.div
              key={page === 'tabs' ? activeTab : page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {page === 'tabs' && activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
              {page === 'tabs' && activeTab === 'rent' && <RentTab onNavigate={setActiveTab} />}
              {page === 'tabs' && activeTab === 'buy' && <BuyTab />}
              {page === 'tabs' && activeTab === 'compare' && <CompareTab />}
              {page === 'about' && <AboutPage onBack={goHome} />}
              {page === 'permissions' && <AppPermissionsPage onBack={goHome} />}
              {page === 'notifications' && <NotificationsPage onBack={goHome} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav — hide on profile pages */}
        {page === 'tabs' && (
          <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        )}

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 mt-8 mb-20">
          <div className="max-w-lg mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground">
              NestDecide is a financial modelling tool, not financial advice.
            </p>
          </div>
        </footer>
      </div>
    </UserDataProvider>
  );
}
