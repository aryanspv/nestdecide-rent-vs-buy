import { CITY_DATA } from '@/lib/locationData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const CITIES = Object.entries(CITY_DATA).map(([value, data]) => ({
  value,
  label: data.label,
  appreciation: `${data.avgAppreciationRange[0]}–${data.avgAppreciationRange[1]}%`,
}));

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        City
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CITIES.map(c => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
              <span className="text-muted-foreground ml-2 text-xs">({c.appreciation})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
