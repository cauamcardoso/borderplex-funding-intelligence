'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Filter, Users, MapPin, Building2, ChevronDown, ChevronUp, ChevronRight, BookOpen } from 'lucide-react';
import problems from '@/data/problems.json';
import jurisdictions from '@/data/jurisdictions.json';
import { getSectorColor, getUrgencyColor, formatNumber } from '@/lib/utils';
import type { Sector, Urgency } from '@/lib/types';

const ALL_SECTORS: Sector[] = [
  'Infrastructure',
  'Water & Environment',
  'Workforce Development',
  'Public Health',
  'Public Safety',
  'Economic Development',
  'Housing',
  'Transportation',
  'Technology & Innovation',
  'Energy',
  'Education',
  'Governance',
];

const ALL_URGENCIES: Urgency[] = ['Critical', 'High', 'Medium', 'Low'];

type SortField = 'title' | 'sector' | 'urgency' | 'jurisdictions' | 'population' | 'scale' | 'federal';
type SortDir = 'asc' | 'desc';

const URGENCY_ORDER: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function ChallengesPage() {
  const [sectorFilter, setSectorFilter] = useState<Sector | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | null>(null);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string | null>(null);
  const [showJurisdictionDropdown, setShowJurisdictionDropdown] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('urgency');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const jurisdictionMap = useMemo(() => {
    const map: Record<string, string> = {};
    jurisdictions.forEach((j) => {
      map[j.id] = j.name;
    });
    return map;
  }, []);

  const activeSectors = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => set.add(p.sector));
    return ALL_SECTORS.filter((s) => set.has(s));
  }, []);

  const filteredProblems = useMemo(() => {
    let result = problems.filter((p) => {
      if (sectorFilter && p.sector !== sectorFilter) return false;
      if (urgencyFilter && p.urgency !== urgencyFilter) return false;
      if (jurisdictionFilter && !p.jurisdictionIds.includes(jurisdictionFilter)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'sector':
          cmp = a.sector.localeCompare(b.sector);
          break;
        case 'urgency':
          cmp = (URGENCY_ORDER[a.urgency] ?? 4) - (URGENCY_ORDER[b.urgency] ?? 4);
          break;
        case 'jurisdictions':
          cmp = b.jurisdictionIds.length - a.jurisdictionIds.length;
          break;
        case 'population':
          cmp = b.populationAffected - a.populationAffected;
          break;
        case 'scale':
          cmp = a.estimatedScale.localeCompare(b.estimatedScale);
          break;
        case 'federal':
          cmp = b.federalAlignment.length - a.federalAlignment.length;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [sectorFilter, urgencyFilter, jurisdictionFilter, sortField, sortDir]);

  const crossJurisdictionalData = useMemo(() => {
    const sectorJurisdictions: Record<string, Set<string>> = {};
    problems.forEach((p) => {
      if (!sectorJurisdictions[p.sector]) {
        sectorJurisdictions[p.sector] = new Set();
      }
      p.jurisdictionIds.forEach((jId) => sectorJurisdictions[p.sector].add(jId));
    });
    return Object.entries(sectorJurisdictions)
      .map(([sector, jSet]) => ({ sector, count: jSet.size }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const maxJurisdictionSpan = Math.max(...crossJurisdictionalData.map((d) => d.count), 1);

  const activeFilterCount = [sectorFilter, urgencyFilter, jurisdictionFilter].filter(Boolean).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={10} className="text-[#CBD5E1] ml-1 inline" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-[#FF8200] ml-1 inline" />
      : <ChevronDown size={10} className="text-[#FF8200] ml-1 inline" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest text-[#EF4444]">Layer 1: Challenge Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">Regional Challenge Registry</h1>
          <p className="text-[#334155] max-w-3xl leading-relaxed mb-6">
            Every challenge listed here comes from an adopted strategic plan, community needs assessment, or stakeholder engagement. Each one has been scoped to a level of specificity that supports federal funding alignment. Challenges are organized by the jurisdictions that own them and the policy sectors they belong to.
          </p>

          {/* Methodology */}
          <div className="accent-card p-5" style={{ borderLeftColor: '#3B82F6' }}>
            <div className="flex items-start gap-3">
              <BookOpen size={18} className="text-[#3B82F6] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Methodology</h3>
                <p className="text-xs text-[#334155] leading-relaxed">
                  Challenges are identified through a systematic review of adopted strategic plans from all 13 jurisdictions in the Borderplex corridor. Each challenge is evaluated against five criteria: population impact, estimated financial scale, urgency as expressed by the adopting authority, federal agency alignment breadth, and cross-jurisdictional scope.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-[#E2E8F0] sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-[#64748B]" />
            <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Filters</span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setSectorFilter(null); setUrgencyFilter(null); setJurisdictionFilter(null); }}
                className="text-[10px] text-[#FF8200] hover:text-[#E57400] ml-2 font-medium"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Sector filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            {activeSectors.map((sector) => {
              const isActive = sectorFilter === sector;
              return (
                <button
                  key={sector}
                  onClick={() => setSectorFilter(isActive ? null : sector)}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    borderColor: isActive ? getSectorColor(sector) : '#E2E8F0',
                    backgroundColor: isActive ? `${getSectorColor(sector)}12` : '#FFFFFF',
                    color: isActive ? getSectorColor(sector) : '#64748B',
                  }}
                >
                  {sector}
                </button>
              );
            })}
          </div>

          {/* Urgency and Jurisdiction filters */}
          <div className="flex flex-wrap items-center gap-2">
            {ALL_URGENCIES.map((urg) => {
              const isActive = urgencyFilter === urg;
              return (
                <button
                  key={urg}
                  onClick={() => setUrgencyFilter(isActive ? null : urg)}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5"
                  style={{
                    borderColor: isActive ? getUrgencyColor(urg) : '#E2E8F0',
                    backgroundColor: isActive ? `${getUrgencyColor(urg)}12` : '#FFFFFF',
                    color: isActive ? getUrgencyColor(urg) : '#64748B',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getUrgencyColor(urg) }} />
                  {urg}
                </button>
              );
            })}

            <div className="relative ml-2">
              <button
                onClick={() => setShowJurisdictionDropdown(!showJurisdictionDropdown)}
                className="text-[11px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 hover:border-[#CBD5E1]"
                style={{
                  borderColor: jurisdictionFilter ? '#FF8200' : '#E2E8F0',
                  backgroundColor: jurisdictionFilter ? 'rgba(255, 130, 0, 0.08)' : '#FFFFFF',
                  color: jurisdictionFilter ? '#FF8200' : '#64748B',
                }}
              >
                <MapPin size={11} />
                {jurisdictionFilter ? jurisdictionMap[jurisdictionFilter] : 'Jurisdiction'}
                <ChevronDown size={11} />
              </button>
              {showJurisdictionDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2 z-40 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setJurisdictionFilter(null); setShowJurisdictionDropdown(false); }}
                    className="w-full text-left text-[11px] px-3 py-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                  >
                    All Jurisdictions
                  </button>
                  {jurisdictions.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => { setJurisdictionFilter(j.id); setShowJurisdictionDropdown(false); }}
                      className="w-full text-left text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center justify-between hover:bg-[#F1F5F9]"
                      style={{
                        color: jurisdictionFilter === j.id ? '#FF8200' : '#334155',
                        backgroundColor: jurisdictionFilter === j.id ? 'rgba(255, 130, 0, 0.06)' : undefined,
                      }}
                    >
                      <span>{j.name}</span>
                      <span className="text-[10px] text-[#94A3B8]">{j.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results count */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 pt-6 pb-3">
        <p className="text-xs text-[#64748B]">
          Showing <span className="text-[#0F172A] font-semibold">{filteredProblems.length}</span> of {problems.length} challenges
        </p>
      </section>

      {/* Challenge Table */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 pb-8">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] w-[30%]">
                    <button onClick={() => handleSort('title')} className="flex items-center hover:text-[#0F172A] transition-colors">
                      Challenge <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <button onClick={() => handleSort('sector')} className="flex items-center hover:text-[#0F172A] transition-colors">
                      Sector <SortIcon field="sector" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <button onClick={() => handleSort('urgency')} className="flex items-center hover:text-[#0F172A] transition-colors">
                      Urgency <SortIcon field="urgency" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] hidden lg:table-cell">
                    <button onClick={() => handleSort('jurisdictions')} className="flex items-center hover:text-[#0F172A] transition-colors">
                      Jurisdictions <SortIcon field="jurisdictions" />
                    </button>
                  </th>
                  <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] hidden md:table-cell">
                    <button onClick={() => handleSort('population')} className="flex items-center justify-end hover:text-[#0F172A] transition-colors">
                      Pop. Affected <SortIcon field="population" />
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] hidden xl:table-cell">
                    <button onClick={() => handleSort('scale')} className="flex items-center hover:text-[#0F172A] transition-colors">
                      Scale <SortIcon field="scale" />
                    </button>
                  </th>
                  <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] hidden xl:table-cell">
                    <button onClick={() => handleSort('federal')} className="flex items-center justify-end hover:text-[#0F172A] transition-colors">
                      Federal Alignment <SortIcon field="federal" />
                    </button>
                  </th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((challenge, idx) => {
                  const isExpanded = expandedRow === challenge.id;
                  return (
                    <tr key={challenge.id} className="group" style={{ animationDelay: `${idx * 20}ms` }}>
                      <td colSpan={8} className="p-0">
                        <div
                          className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                          style={{ borderLeft: `3px solid ${getSectorColor(challenge.sector as Sector)}` }}
                          onClick={() => setExpandedRow(isExpanded ? null : challenge.id)}
                        >
                          {/* Main row */}
                          <div className="flex items-center">
                            <div className="flex-1 px-4 py-3 min-w-0" style={{ width: '30%' }}>
                              <span className="text-sm font-medium text-[#0F172A] group-hover:text-[#FF8200] transition-colors leading-snug block truncate">
                                {challenge.title}
                              </span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0">
                              <span
                                className="text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                                style={{
                                  backgroundColor: `${getSectorColor(challenge.sector as Sector)}10`,
                                  color: getSectorColor(challenge.sector as Sector),
                                }}
                              >
                                {challenge.sector}
                              </span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getUrgencyColor(challenge.urgency as Urgency) }} />
                                <span className="text-xs font-medium" style={{ color: getUrgencyColor(challenge.urgency as Urgency) }}>{challenge.urgency}</span>
                              </span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0 hidden lg:block">
                              <span className="text-xs text-[#334155]">{challenge.jurisdictionIds.length} {challenge.jurisdictionIds.length === 1 ? 'jurisdiction' : 'jurisdictions'}</span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0 text-right hidden md:block">
                              <span className="text-xs font-medium text-[#0F172A]">{formatNumber(challenge.populationAffected)}</span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0 hidden xl:block">
                              <span className="text-[11px] text-[#334155]">{challenge.estimatedScale}</span>
                            </div>
                            <div className="px-3 py-3 flex-shrink-0 text-right hidden xl:block">
                              <span className="text-xs text-[#334155]">{challenge.federalAlignment.length} {challenge.federalAlignment.length === 1 ? 'agency' : 'agencies'}</span>
                            </div>
                            <div className="w-8 px-2 py-3 flex-shrink-0">
                              <ChevronRight size={14} className={`text-[#CBD5E1] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="px-5 pb-4 pt-0 fade-in-up border-t border-[#F1F5F9]">
                              <div className="bg-[#F8FAFC] rounded-lg p-4 mt-2">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Full Challenge Statement</h4>
                                    <p className="text-xs text-[#334155] leading-relaxed">{challenge.statement}</p>
                                    <div className="mt-3">
                                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Source</h4>
                                      <p className="text-xs text-[#64748B] italic">{challenge.planSource}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Jurisdictions</h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {challenge.jurisdictionIds.map((jId) => (
                                          <span key={jId} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#334155] flex items-center gap-1">
                                            <MapPin size={8} className="text-[#94A3B8]" />
                                            {jurisdictionMap[jId] || jId}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Federal Agency Alignment</h4>
                                      <div className="flex flex-wrap gap-1.5">
                                        {challenge.federalAlignment.map((agency) => (
                                          <span key={agency} className="text-[9px] px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#334155]">
                                            {agency}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                      <div className="bg-white rounded-lg p-2 border border-[#E2E8F0]">
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mb-0.5">
                                          <Users size={10} />
                                          Population Affected
                                        </div>
                                        <div className="text-sm font-bold text-[#0F172A]">{formatNumber(challenge.populationAffected)}</div>
                                      </div>
                                      <div className="bg-white rounded-lg p-2 border border-[#E2E8F0]">
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mb-0.5">
                                          <Building2 size={10} />
                                          Estimated Scale
                                        </div>
                                        <div className="text-xs font-semibold text-[#0F172A]">{challenge.estimatedScale}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProblems.length === 0 && (
            <div className="p-12 text-center">
              <AlertTriangle size={32} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">No challenges match your current filters.</p>
              <button
                onClick={() => { setSectorFilter(null); setUrgencyFilter(null); setJurisdictionFilter(null); }}
                className="text-xs text-[#FF8200] hover:text-[#E57400] mt-2 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cross-Jurisdictional Overlap */}
      <section className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-1">Cross-Jurisdictional Overlap</h2>
            <p className="text-xs text-[#64748B]">
              Number of distinct jurisdictions affected per sector, indicating the breadth of coordination needed.
            </p>
          </div>
          <div className="card p-6">
            <div className="space-y-4">
              {crossJurisdictionalData.map((item) => {
                const pct = (item.count / maxJurisdictionSpan) * 100;
                return (
                  <div key={item.sector}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#334155] flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: getSectorColor(item.sector as Sector) }}
                        />
                        {item.sector}
                      </span>
                      <span className="text-[#0F172A] font-semibold">{item.count} jurisdictions</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div
                        className="h-full rounded-full score-bar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: getSectorColor(item.sector as Sector),
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
