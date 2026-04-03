import { useState } from 'react';
import { ArrowLeft, Bell, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationsPageProps {
  onBack: () => void;
}

interface NotifPrefs {
  marketUpdates: boolean;
  rateChanges: boolean;
  cityAlerts: boolean;
  tips: boolean;
}

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    marketUpdates: true,
    rateChanges: true,
    cityAlerts: false,
    tips: true,
  });

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const notifSupported = 'Notification' in window;
  const notifGranted = notifSupported && Notification.permission === 'granted';

  const items = [
    {
      key: 'marketUpdates' as const,
      icon: TrendingUp,
      title: 'Market Updates',
      desc: 'Weekly property market trends for your city',
    },
    {
      key: 'rateChanges' as const,
      icon: AlertTriangle,
      title: 'Interest Rate Changes',
      desc: 'Get notified when RBI changes repo rate',
    },
    {
      key: 'cityAlerts' as const,
      icon: MapPin,
      title: 'City-specific Alerts',
      desc: 'Stamp duty changes, new RERA rules in your city',
    },
    {
      key: 'tips' as const,
      icon: Bell,
      title: 'Tips & Insights',
      desc: 'Periodic advice on rent vs buy decisions',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose what you'd like to hear about</p>
      </div>

      {!notifGranted && (
        <div className="glass-card p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Enable notifications first</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Go to App Permissions and allow notifications to receive these alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="glass-card p-4 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-accent/50 shrink-0">
              <item.icon className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch
              checked={prefs[item.key]}
              onCheckedChange={() => toggle(item.key)}
              disabled={!notifGranted}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Preferences are saved locally. Push notifications coming soon.
      </p>
    </div>
  );
}
