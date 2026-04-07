'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Network, DollarSign, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/problems', label: 'Challenge Registry', icon: Shield },
  { href: '/capabilities', label: 'Capability Atlas', icon: Network },
  { href: '/funding', label: 'Funding Landscape', icon: DollarSign },
  { href: '/alignments', label: 'Alignment Engine', icon: Zap },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-bold text-white text-[10px] tracking-wider">
              BFI
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-navy leading-tight">Borderplex Funding Intelligence</div>
              <div className="text-[10px] text-text-muted leading-tight">UTEP Research & Innovation Office</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? 'bg-navy text-white font-medium shadow-sm'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-navy'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[10px] text-text-muted">
            <span className="px-2 py-1 rounded-md bg-surface-alt text-text-muted font-medium">Powered by AAII</span>
          </div>

          <button
            className="lg:hidden p-2 text-text-secondary hover:text-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-navy text-white font-medium'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-navy'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
