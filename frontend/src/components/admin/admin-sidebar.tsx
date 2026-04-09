'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  Power,
  Star
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Operators', href: '/admin/operators', icon: Users },
    { name: 'Ratings', href: '/admin/ratings', icon: Star },
    { name: 'System', href: '#', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 border-r border-slate-900 bg-slate-900/50 flex flex-col p-6 h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white">Super Admin</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Control Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon size={18} /> {item.name}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/20 rounded-xl text-sm font-bold transition-all"
      >
        <Power size={18} /> Sign Out
      </button>
    </div>
  );
}
