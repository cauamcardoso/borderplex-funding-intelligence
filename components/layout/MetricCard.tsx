'use client';

import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
}

export default function MetricCard({ label, value, subtitle, icon: Icon, trend, accentColor = '#FF8200' }: MetricCardProps) {
  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-text mb-1">{value}</p>
          {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-success' : 'text-danger'}`}>
              <span>{trend.positive ? '+' : ''}{trend.value}</span>
            </div>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
      </div>
    </div>
  );
}
