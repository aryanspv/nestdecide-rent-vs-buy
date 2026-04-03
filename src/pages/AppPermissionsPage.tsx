import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Bell, Camera, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AppPermissionsPageProps {
  onBack: () => void;
}

interface PermissionState {
  location: 'granted' | 'denied' | 'prompt' | 'unsupported';
  notifications: 'granted' | 'denied' | 'default' | 'unsupported';
}

export default function AppPermissionsPage({ onBack }: AppPermissionsPageProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'prompt',
    notifications: 'default',
  });

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissions(prev => ({ ...prev, notifications: Notification.permission as PermissionState['notifications'] }));
    } else {
      setPermissions(prev => ({ ...prev, notifications: 'unsupported' }));
    }

    // Check geolocation
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' }).then(result => {
        setPermissions(prev => ({ ...prev, location: result.state as PermissionState['location'] }));
        result.onchange = () => {
          setPermissions(prev => ({ ...prev, location: result.state as PermissionState['location'] }));
        };
      }).catch(() => {
        // permissions API not supported, leave as prompt
      });
    } else {
      setPermissions(prev => ({ ...prev, location: 'unsupported' }));
    }
  }, []);

  const requestNotification = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, notifications: result as PermissionState['notifications'] }));
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setPermissions(prev => ({ ...prev, location: 'granted' })),
      () => setPermissions(prev => ({ ...prev, location: 'denied' })),
    );
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'granted': return 'Allowed';
      case 'denied': return 'Blocked';
      case 'unsupported': return 'Not supported';
      default: return 'Not set';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'text-signal-buy';
      case 'denied': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const permissionItems = [
    {
      icon: MapPin,
      title: 'Location',
      desc: 'Used to auto-detect your city for more accurate data',
      status: permissions.location,
      onRequest: requestLocation,
    },
    {
      icon: Bell,
      title: 'Notifications',
      desc: 'Get alerts when market conditions change in your city',
      status: permissions.notifications,
      onRequest: requestNotification,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Space_Grotesk']">App Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage what NestDecide can access on your device</p>
      </div>

      <div className="space-y-3">
        {permissionItems.map((item, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-accent/50 shrink-0">
              <item.icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              <p className={`text-xs font-medium mt-1 ${statusColor(item.status)}`}>
                {statusLabel(item.status)}
              </p>
            </div>
            {(item.status === 'prompt' || item.status === 'default') && (
              <button
                onClick={item.onRequest}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shrink-0"
              >
                Allow
              </button>
            )}
            {item.status === 'denied' && (
              <p className="text-[10px] text-muted-foreground text-right shrink-0 max-w-[80px]">
                Change in browser settings
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="h-4 w-4" /> Install as App
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Add NestDecide to your home screen for instant access. Tap the share button in your browser 
          and select "Add to Home Screen".
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        NestDecide only requests permissions it needs. We never sell or share your data.
      </p>
    </div>
  );
}
