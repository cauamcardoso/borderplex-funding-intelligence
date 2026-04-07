'use client';

import { useState, useMemo } from 'react';
import { DollarSign, Filter, Search, Clock, ExternalLink, ChevronDown, Building2, Tag, Calendar, Layers } from 'lucide-react';
import funding from '@/data/funding.json';
import { formatCurrency, getSectorColor, getSourceLevelColor } from '@/lib/utils';
import type { FundingSourceLevel, Sector, FundingCycle } from '@/lib/types';

const ALL_SOURCE_LEVELS: FundingSourceLevel[] = ['Federal', 'State-TX', 'State-NM', 'Binational'];
const ALL_CYCLES: FundingCycle[] = ['Annual', 'Rolling', 'Signal-Driven', 'One-Time', 'Biennial'];
const AWARD_RANGES = [
  { label: 'Under $1M', min: 0, max: 1_000_000 },
  { label: '$1M - $10M', min: 1_000_000, max: 10_000_000 },
  { label: '$10M - $50M', min: 10_000_000, max: 50_000_000 },
  { label: '$50M+', min: 50_000_000, max: Infinity },
];

const SOURCE_COLORS: Record<string, string> = {
  Federal: '#2563EB',
  'State-TX': '#D97706',
  'State-NM': '#059669',
  Binational: '#DB2777',
};

export default function FundingPage() {
  const [sourceFilter, setSourceFilter] = useState<FundingSourceLevel | 'All'>('All');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [cycleFilter, setCycleFilter] = useState<FundingCycle | 'All'>('All');
  const [awardFilter, setAwardFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const allSectors = useMemo(() => {
    const s = new Set<string>();
    funding.forEach((f) => f.sectors.forEach((sec) => s.add(sec)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    return funding.filter((f) => {
      if (sourceFilter !== 'All' && f.sourceLevel !== sourceFilter) return false;
      if (sectorFilter !== 'All' && !f.sectors.includes(sectorFilter as Sector)) return false;
      if (cycleFilter !== 'All' && f.cycle !== cycleFilter) return false;
      if (awardFilter !== 'All') {
        const range = AWARD_RANGES.find((r) => r.label === awardFilter);
        if (range && (f.awardRangeMax < range.min || f.awardRangeMin > range.max)) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !f.name.toLowerCase().includes(q) &&
          !f.agency.toLowerCase().includes(q) &&
          !f.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [sourceFilter, sectorFilter, cycleFilter, awardFilter, searchQuery]);

  const totalAvailableFunding = useMemo(
    () => funding.reduce((sum, f) => sum + f.awardRangeMax, 0),
    []
  );

  const federalCount = funding.filter((f) => f.sourceLevel === 'Federal').length;
  const stateCount = funding.filter((f) => f.sourceLevel.startsWith('State')).length;

  const sourceBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    funding.forEach((f) => {
      if (!map[f.sourceLevel]) map[f.sourceLevel] = { count: 0, total: 0 };
      map[f.sourceLevel].count++;
      map[f.sourceLevel].total += f.awardRangeMax;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, []);

  const totalFundingAllSources = useMemo(
    () => sourceBreakdown.reduce((sum, [, v]) => sum + v.total, 0),
    [sourceBreakdown]
  );

  // Sector breakdown
  const sectorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    funding.forEach((f) => {
      f.sectors.forEach((s) => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const maxSectorCount = sectorBreakdown.length > 0 ? sectorBreakdown[0][1] : 1;

  // Cycle breakdown
  const cycleBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    funding.forEach((f) => {
      map[f.cycle] = (map[f.cycle] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const totalCycleCount = funding.length;

  const cycleColors: Record<string, string> = {
    Annual: '#2563EB',
    Rolling: '#059669',
    'Signal-Driven': '#D97706',
    'One-Time': '#DC2626',
    Biennial: '#7C3AED',
  };

  // Group filtered by source level for section display
  const groupedBySource = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    const order = ['Federal', 'State-TX', 'State-NM', 'Binational', 'Local', 'Private'];
    filtered.forEach((f) => {
      if (!groups[f.sourceLevel]) groups[f.sourceLevel] = [];
      groups[f.sourceLevel].push(f);
    });
    return order.filter((s) => groups[s] && groups[s].length > 0).map((s) => ({ source: s, programs: groups[s] }));
  }, [filtered]);

  function isDeadlineSoon(deadline?: string): boolean {
    if (!deadline) return false;
    const now = new Date();
    const dl = new Date(deadline);
    const diffMs = dl.getTime() - now.getTime();
    return diffMs > 0 && diffMs < 90 * 24 * 60 * 60 * 1000;
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <section className="border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ background: '#059669' }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#059669' }}>
              Layer 3: Funding Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#0F172A' }}>Funding Landscape</h1>
          <p className="max-w-3xl text-sm leading-relaxed mb-4" style={{ color: '#334155' }}>
            The Funding Landscape tracks federal, state, and binational programs relevant to the Borderplex region. Programs are organized by source level, sector alignment, and award scale. The goal is to identify which funding mechanisms match specific regional challenges and UTEP capabilities.
          </p>
          <div className="accent-card p-4" style={{ borderLeftColor: '#059669' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Methodology</p>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              Funding programs are sourced from SAM.gov, Grants.gov, state agency portals, and binational development banks. Each program is evaluated for sector alignment, eligibility requirements, award range, and cycle timing. The platform currently tracks {funding.length} programs across {sourceBreakdown.length} source levels.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">

        {/* TOP ROW: 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Programs', value: String(funding.length), color: '#059669', icon: Tag },
            { label: 'Total Available Funding', value: formatCurrency(totalAvailableFunding), color: '#FF8200', icon: DollarSign },
            { label: 'Federal Programs', value: String(federalCount), color: '#2563EB', icon: Building2 },
            { label: 'State Programs', value: String(stateCount), color: '#D97706', icon: Building2 },
          ].map((m) => (
            <div key={m.label} className="card p-5 fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${m.color}10` }}
                >
                  <m.icon size={18} style={{ color: m.color }} />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#64748B' }}>{m.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#0F172A' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* SECOND ROW: Stacked Proportional Bar */}
        <div className="card p-5 mb-6 fade-in-up">
          <h2 className="text-sm font-semibold mb-1" style={{ color: '#0F172A' }}>Funding by Source</h2>
          <p className="text-[11px] mb-4" style={{ color: '#64748B' }}>Proportional distribution of maximum award funding across all source levels.</p>

          {/* Stacked bar */}
          <div className="rounded-xl overflow-hidden flex h-12 mb-4" style={{ backgroundColor: '#F1F5F9' }}>
            {sourceBreakdown.map(([source, data]) => {
              const pct = (data.total / totalFundingAllSources) * 100;
              if (pct < 1) return null;
              const color = SOURCE_COLORS[source] || '#6B7280';
              return (
                <div
                  key={source}
                  className="h-full flex items-center justify-center relative group score-bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    minWidth: pct > 3 ? undefined : '24px',
                  }}
                >
                  {pct > 8 && (
                    <div className="text-center px-1">
                      <p className="text-[10px] font-bold text-white leading-tight">{source}</p>
                      <p className="text-[9px] text-white/70">{formatCurrency(data.total)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend row */}
          <div className="flex flex-wrap gap-4">
            {sourceBreakdown.map(([source, data]) => {
              const color = SOURCE_COLORS[source] || '#6B7280';
              const pct = ((data.total / totalFundingAllSources) * 100).toFixed(1);
              return (
                <div key={source} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span style={{ color: '#334155' }}>
                    <span className="font-medium">{source}</span>
                    <span style={{ color: '#64748B' }}> ({data.count} programs, {pct}%)</span>
                  </span>
                  <span className="font-semibold" style={{ color: '#0F172A' }}>{formatCurrency(data.total)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* THIRD ROW: Two panels side by side */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* LEFT: By Sector */}
          <div className="card p-5 fade-in-up">
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#0F172A' }}>By Sector</h2>
            <p className="text-[11px] mb-4" style={{ color: '#64748B' }}>Number of funding programs aligned to each sector.</p>
            <div className="space-y-3">
              {sectorBreakdown.map(([sector, count]) => {
                const pct = (count / maxSectorCount) * 100;
                const color = getSectorColor(sector as Sector);
                return (
                  <div key={sector}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="flex items-center gap-2" style={{ color: '#334155' }}>
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                        {sector}
                      </span>
                      <span className="font-semibold" style={{ color: '#0F172A' }}>{count}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                      <div
                        className="h-full rounded-full score-bar"
                        style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.75 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: By Cycle Type */}
          <div className="card p-5 fade-in-up">
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#0F172A' }}>By Cycle Type</h2>
            <p className="text-[11px] mb-4" style={{ color: '#64748B' }}>Distribution of programs by funding cycle timing.</p>

            {/* Donut-style visual using ring segments represented as cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {cycleBreakdown.map(([cycle, count]) => {
                const pct = ((count / totalCycleCount) * 100).toFixed(0);
                const color = cycleColors[cycle] || '#6B7280';
                return (
                  <div
                    key={cycle}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
                  >
                    <div className="text-2xl font-bold mb-0.5" style={{ color }}>{count}</div>
                    <div className="text-xs font-medium mb-1" style={{ color: '#0F172A' }}>{cycle}</div>
                    <div className="text-[10px]" style={{ color: '#64748B' }}>{pct}% of programs</div>
                  </div>
                );
              })}
            </div>

            {/* Proportional bar for cycle breakdown */}
            <div className="rounded-lg overflow-hidden flex h-6" style={{ backgroundColor: '#F1F5F9' }}>
              {cycleBreakdown.map(([cycle, count]) => {
                const pct = (count / totalCycleCount) * 100;
                const color = cycleColors[cycle] || '#6B7280';
                return (
                  <div
                    key={cycle}
                    className="h-full score-bar"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                    title={`${cycle}: ${count} programs`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} style={{ color: '#64748B' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Program Filters</span>
            {(sourceFilter !== 'All' || sectorFilter !== 'All' || cycleFilter !== 'All' || awardFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSourceFilter('All');
                  setSectorFilter('All');
                  setCycleFilter('All');
                  setAwardFilter('All');
                  setSearchQuery('');
                }}
                className="ml-auto text-[11px] font-medium transition-colors"
                style={{ color: '#FF8200' }}
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                }}
              />
            </div>
            {/* Source Level */}
            <div className="relative">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as FundingSourceLevel | 'All')}
                className="appearance-none rounded-lg px-3 py-2 pr-8 text-xs focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
              >
                <option value="All">All Sources</option>
                {ALL_SOURCE_LEVELS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>
            {/* Sector */}
            <div className="relative">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="appearance-none rounded-lg px-3 py-2 pr-8 text-xs focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
              >
                <option value="All">All Sectors</option>
                {allSectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>
            {/* Cycle */}
            <div className="relative">
              <select
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value as FundingCycle | 'All')}
                className="appearance-none rounded-lg px-3 py-2 pr-8 text-xs focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
              >
                <option value="All">All Cycles</option>
                {ALL_CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>
            {/* Award Size */}
            <div className="relative">
              <select
                value={awardFilter}
                onChange={(e) => setAwardFilter(e.target.value)}
                className="appearance-none rounded-lg px-3 py-2 pr-8 text-xs focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
              >
                <option value="All">All Award Sizes</option>
                {AWARD_RANGES.map((r) => (
                  <option key={r.label} value={r.label}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: '#64748B' }}>
            Showing <span className="font-semibold" style={{ color: '#0F172A' }}>{filtered.length}</span> of {funding.length} programs
          </p>
        </div>

        {/* GROUPED SECTIONS by Source Level */}
        {groupedBySource.length > 0 ? (
          <div className="space-y-6">
            {groupedBySource.map(({ source, programs }) => {
              const color = SOURCE_COLORS[source] || '#6B7280';
              return (
                <div key={source} className="fade-in-up">
                  {/* Section header */}
                  <div
                    className="rounded-t-xl px-5 py-3 flex items-center justify-between"
                    style={{ backgroundColor: color }}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-white" />
                      <span className="text-sm font-semibold text-white">{source}</span>
                    </div>
                    <span className="text-xs text-white/80">{programs.length} program{programs.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Program rows */}
                  <div className="border border-t-0 rounded-b-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                    {programs.map((f, i) => {
                      const deadlineSoon = isDeadlineSoon(f.deadline);
                      return (
                        <div
                          key={f.id}
                          className="px-5 py-4 flex items-start gap-4 transition-all hover:bg-gray-50"
                          style={{
                            borderBottom: i < programs.length - 1 ? '1px solid #F1F5F9' : 'none',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <h3 className="text-sm font-semibold leading-snug" style={{ color: '#0F172A' }}>{f.name}</h3>
                              {f.url && (
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 transition-colors"
                                  style={{ color: '#FF8200' }}
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: '#64748B' }}>
                              <span className="flex items-center gap-1">
                                <Building2 size={11} />
                                {f.agency}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={11} style={{ color: '#059669' }} />
                                <span style={{ color: '#0F172A' }} className="font-medium">
                                  {formatCurrency(f.awardRangeMin)} to {formatCurrency(f.awardRangeMax)}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={11} />
                                {f.cycle}
                              </span>
                              {f.deadline && (
                                <span
                                  className="flex items-center gap-1"
                                  style={{ color: deadlineSoon ? '#D97706' : '#64748B' }}
                                >
                                  <Clock size={11} />
                                  <span className={deadlineSoon ? 'font-semibold' : ''}>
                                    {f.deadline}{deadlineSoon ? ' (Upcoming)' : ''}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Sector tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {f.sectors.map((sec) => (
                                <span
                                  key={sec}
                                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: `${getSectorColor(sec as Sector)}10`,
                                    color: getSectorColor(sec as Sector),
                                  }}
                                >
                                  {sec}
                                </span>
                              ))}
                              {f.eligibility.slice(0, 3).map((e) => (
                                <span
                                  key={e}
                                  className="text-[10px] px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: '#F1F5F9',
                                    color: '#64748B',
                                    border: '1px solid #E2E8F0',
                                  }}
                                >
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <DollarSign size={32} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: '#334155' }}>No funding programs match the current filters.</p>
            <button
              onClick={() => {
                setSourceFilter('All');
                setSectorFilter('All');
                setCycleFilter('All');
                setAwardFilter('All');
                setSearchQuery('');
              }}
              className="text-xs mt-2 transition-colors"
              style={{ color: '#FF8200' }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
