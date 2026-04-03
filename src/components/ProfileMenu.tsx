import { User, LogIn, Bell, Shield, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-xl bg-accent/50 hover:bg-accent transition-colors">
          <User className="h-5 w-5 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl">
        <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer">
          <LogIn className="h-4 w-4" />
          <span>Sign in</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer">
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer">
          <Shield className="h-4 w-4" />
          <span>App Permissions</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 py-2.5 cursor-pointer">
          <Info className="h-4 w-4" />
          <span>About NestDecide</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
