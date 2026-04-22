import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, BookOpen, Code2, Globe, FileText, LogOut, ScanSearch, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Job Tracker' },
  { to: '/ats', icon: ScanSearch, label: 'ATS Check' },
  { to: '/job-matching', icon: Target, label: 'Job Matching' },
  { to: '/learning', icon: BookOpen, label: 'Learning' },
  { to: '/dsa', icon: Code2, label: 'DSA Practice' },
  { to: '/abroad', icon: Globe, label: 'Move Abroad' },
  { to: '/documents', icon: FileText, label: 'Documents' },
];

export function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="flex flex-col w-72 bg-card border-r border-border h-screen sticky top-0">
      <div className="px-7 py-7 border-b border-border">
        <h1 className="text-2xl font-bold text-primary tracking-tight">NEXUS</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Self Development Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3.5 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-base font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-[15px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
