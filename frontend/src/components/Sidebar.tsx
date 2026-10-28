"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowLeftRight,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  openAlertsCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  openAlertsCount,
  lowStockCount,
}) => {
  const [activeUser, setActiveUser] = React.useState('User');
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let isMounted = true;

    const loadActiveUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted || !data.user) return;

      const displayName = data.user.user_metadata?.full_name || data.user.email || 'User';
      setActiveUser(displayName);
    };

    loadActiveUser();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'transactions', label: 'Stock Movements', icon: ArrowLeftRight },
    { id: 'alerts', label: 'Anomaly Alerts', icon: ShieldAlert, badge: openAlertsCount > 0 ? openAlertsCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Data & Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.assign('/login');
  };

  return (
    <aside className="w-64 bg-[#332522] text-[#FFF8F2] flex flex-col shrink-0 border-r border-[#5A4036] select-none">
      {/* Brand Header with Link to Public Landing Page */}
      <Link
        href="/"
        className="h-20 px-6 flex items-center gap-3 border-b border-[#5A4036] bg-[#291C1A]/70 hover:bg-[#241816] transition-colors group"
        title="Return to Public Website"
      >
        <div className="w-9 h-9 rounded-lg bg-[#4E342E] border border-[#8D6E63]/70 flex items-center justify-center p-1 shadow-sm group-hover:border-[#D7B9A5] transition-all">
          <Image
            src="/logo-icon-light.png"
            alt="StockMind"
            width={24}
            height={24}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-[#FFFDF9] text-lg tracking-wide flex items-center gap-1.5">
            StockMind
          </h1>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          Main Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-[15px] font-medium transition-all ${
                isActive
                ? 'bg-[#A6785C] text-white font-semibold shadow-sm shadow-[#241816]/40'
                  : 'text-white hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-[18px] h-[18px] text-white" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs font-bold min-w-7 text-center px-2 py-1 rounded-full text-white shadow-sm ${item.id === 'alerts' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active User Panel */}
      <div className="p-5 border-t border-[#5A4036] bg-[#291C1A]/75 text-sm space-y-4">
        <div className="ml-1 flex items-center gap-3 text-[#E6D9D0]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A6785C] text-sm font-bold text-white">
            {activeUser.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{activeUser}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isLoggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </aside>
  );
};
