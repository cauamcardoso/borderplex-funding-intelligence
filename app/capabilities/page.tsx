'use client';

import { useState, useMemo } from 'react';
import { Network, MapPin, Clock, Layers, Building2, Zap, Users, ChevronRight, Search } from 'lucide-react';
import capabilities from '@/data/capabilities.json';
import { getSectorColor, getOrgTypeLabel, getOrgTypeColor } from '@/lib/utils';
import type { Sector, CapabilityTier, OrganizationType } from '@/lib/types';

const ORG_TYPES: OrganizationType[] = [
  'utep_center',
  'utep_institute',
  'national_lab',
  'university',
  'military',
  'defense_contractor',
  'manufacturer',
  'aerospace',
  'economic_dev',
];

function getReadinessColor(readiness: string): string {
  if (readiness === '0-30 days') return '#059669';
  if (readiness === '30-90 days') return '#D97706';
  return '#DC2626';
}

function getReadinessLabel(readiness: string): string {
  if (readiness === '0-30 days') return 'Rapid Deploy';
  if (readiness === '30-90 days') return 'Ready';
  return 'Extended';
}

export default function CapabilitiesPage() {
  const [tierFilter, setTierFilter] = useState<CapabilityTier | null>(null);
  const [orgTypeFilter, setOrgTypeFilter] = useState<OrganizationType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeOrgTypes = useMemo(() => {
    const set = new Set<string>();
    capabilities.forEach((c) => set.add(c.organizationType));
    return ORG_TYPES.filter((t) => set.has(t));
  }, []);

  const filteredCapabilities = useMemo(() => {
    return capabilities.filter((c) => {
      if (tierFilter && c.tier !== tierFilter) return false;
      if (orgTypeFilter && c.organizationType !== orgTypeFilter) return false;
      return true;
    });
  }, [tierFilter, orgTypeFilter]);

  const tierAFiltered = useMemo(() => filteredCapabilities.filter((c) => c.tier === 'A'), [filteredCapabilities]);
  const tierBFiltered = useMemo(() => filteredCapabilities.filter((c) => c.tier === 'B'), [filteredCapabilities]);

  const selectedCapability = useMemo(() => {
    if (!selectedId) return null;
    return capabilities.find((c) => c.id === selectedId) || null;
  }, [selectedId]);

  const summaryStats = useMemo(() => {
    const tierA = capabilities.filter((c) => c.tier === 'A');
    const tierB = capabilities.filter((c) => c.tier === 'B');
    const allSectors = new Set<string>();
    capabilities.forEach((c) => c.sectors.forEach((s) => allSectors.add(s)));
    const readinessValues = capabilities.map((c) => {
      if (c.readiness === '0-30 days') return 15;
      if (c.readiness === '30-90 days') return 60;
      return 135;
    });
    const avgReadiness = Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length);
    return {
      utepUnits: tierA.length,
      externalPartners: tierB.length,
      sectorsCovered: allSectors.size,
      avgReadiness,
    };
  }, []);

  const sectorCoverage = useMemo(() => {
    const counts: Record<string, number> = {};
    capabilities.forEach((c) => {
      c.sectors.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const maxSectorCount = sectorCoverage.length > 0 ? sectorCoverage[0][1] : 1;

  // Sector coverage for a specific capability
  const selectedSectorCoverage = useMemo(() => {
    if (!selectedCapability) return [];
    return sectorCoverage.map(([sector, totalCount]) => ({
      sector,
      totalCount,
      active: selectedCapability.sectors.includes(sector as Sector),
    }));
  }, [selectedCapability, sectorCoverage]);

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <section className="border-b" style={{ borderColor: '#E2E8F0' }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ background: '#8B5CF6' }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#8B5CF6' }}>Layer 2: Capability Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#0F172A' }}>Capability Atlas</h1>
          <p className="max-w-3xl text-sm leading-relaxed mb-4" style={{ color: '#334155' }}>
            The Capability Atlas maps the full inventory of institutional resources available across the UTEP network and its regional partners. Every entry describes deployable capacity: what a given center, institute, or partner can actually deliver against a specific type of challenge. This goes beyond organizational directories. A capability listing includes deliverable types, sector alignment, and a readiness assessment that tells leadership how quickly that resource can be activated for a proposal or project.
          </p>
          <div className="accent-card p-4" style={{ borderLeftColor: '#8B5CF6' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Methodology</p>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              Capabilities are cataloged from institutional inventories, faculty expertise profiles, and partner engagement records compiled through 50+ stakeholder meetings conducted in FY2025. Each entry describes deployable capacity rather than organizational affiliation. Readiness is assessed on a three-tier scale: Rapid Deploy (under 30 days, existing staff and equipment in place), Ready (30 to 90 days, requires preparation such as hiring or procurement), and Extended (90 to 180 days, requires significant preparation including new agreements or security clearances). The Tier A/Tier B distinction separates UTEP-internal capabilities from external partner resources.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b sticky top-0 z-30" style={{ borderColor: '#E2E8F0', background: 'rgba(248,250,252,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Network size={14} style={{ color: '#64748B' }} />
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748B' }}>Filters</span>
            {(tierFilter || orgTypeFilter) && (
              <button
                onClick={() => { setTierFilter(null); setOrgTypeFilter(null); }}
                className="text-[10px] font-medium ml-2"
                style={{ color: '#FF8200' }}
              >
                Clear all
              </button>
            )}
            <span className="ml-auto text-xs" style={{ color: '#64748B' }}>
              Showing <span className="font-semibold" style={{ color: '#0F172A' }}>{filteredCapabilities.length}</span> of {capabilities.length} capabilities
            </span>
          </div>

          {/* Tier toggles */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider mr-1" style={{ color: '#64748B' }}>Tier:</span>
            <button
              onClick={() => setTierFilter(tierFilter === 'A' ? null : 'A')}
              className="text-[11px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5"
              style={{
                borderColor: tierFilter === 'A' ? '#FF8200' : '#E2E8F0',
                backgroundColor: tierFilter === 'A' ? 'rgba(255, 130, 0, 0.08)' : '#FFFFFF',
                color: tierFilter === 'A' ? '#FF8200' : '#334155',
              }}
            >
              <Zap size={10} />
              Tier A: UTEP Core
            </button>
            <button
              onClick={() => setTierFilter(tierFilter === 'B' ? null : 'B')}
              className="text-[11px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5"
              style={{
                borderColor: tierFilter === 'B' ? '#2563EB' : '#E2E8F0',
                backgroundColor: tierFilter === 'B' ? 'rgba(37, 99, 235, 0.08)' : '#FFFFFF',
                color: tierFilter === 'B' ? '#2563EB' : '#334155',
              }}
            >
              <Network size={10} />
              Tier B: Partner Network
            </button>
          </div>

          {/* Org type filters */}
          <div className="flex flex-wrap gap-2">
            {activeOrgTypes.map((orgType) => {
              const isActive = orgTypeFilter === orgType;
              return (
                <button
                  key={orgType}
                  onClick={() => setOrgTypeFilter(isActive ? null : orgType)}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    borderColor: isActive ? getOrgTypeColor(orgType) : '#E2E8F0',
                    backgroundColor: isActive ? `${getOrgTypeColor(orgType)}10` : '#FFFFFF',
                    color: isActive ? getOrgTypeColor(orgType) : '#64748B',
                  }}
                >
                  {getOrgTypeLabel(orgType)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two-Panel Layout */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 320px)' }}>

          {/* LEFT PANEL: Scrollable sidebar */}
          <div className="w-[340px] flex-shrink-0">
            <div className="card p-0 overflow-hidden sticky top-[140px]" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>

                {/* Tier A section */}
                {tierAFiltered.length > 0 && (
                  <>
                    <div className="px-4 py-2.5 sticky top-0 z-10" style={{ background: 'rgba(255, 130, 0, 0.06)', borderBottom: '1px solid #E2E8F0' }}>
                      <div className="flex items-center gap-2">
                        <Zap size={12} style={{ color: '#FF8200' }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#FF8200' }}>
                          Tier A: UTEP Core ({tierAFiltered.length})
                        </span>
                      </div>
                    </div>
                    {tierAFiltered.map((cap) => {
                      const isSelected = selectedId === cap.id;
                      return (
                        <button
                          key={cap.id}
                          onClick={() => setSelectedId(isSelected ? null : cap.id)}
                          className="w-full text-left px-4 py-3 border-b transition-all flex items-center gap-3"
                          style={{
                            borderColor: '#F1F5F9',
                            background: isSelected ? 'rgba(255, 130, 0, 0.06)' : 'transparent',
                            borderLeft: isSelected ? '3px solid #FF8200' : '3px solid transparent',
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getOrgTypeColor(cap.organizationType) }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>{cap.shortName}</p>
                            <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{getOrgTypeLabel(cap.organizationType)}</p>
                          </div>
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{
                              backgroundColor: `${getReadinessColor(cap.readiness)}12`,
                              color: getReadinessColor(cap.readiness),
                            }}
                          >
                            {getReadinessLabel(cap.readiness)}
                          </span>
                          {isSelected && <ChevronRight size={12} style={{ color: '#FF8200' }} />}
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Tier B section */}
                {tierBFiltered.length > 0 && (
                  <>
                    <div className="px-4 py-2.5 sticky top-0 z-10" style={{ background: 'rgba(37, 99, 235, 0.06)', borderBottom: '1px solid #E2E8F0' }}>
                      <div className="flex items-center gap-2">
                        <Network size={12} style={{ color: '#2563EB' }} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#2563EB' }}>
                          Tier B: Partner Network ({tierBFiltered.length})
                        </span>
                      </div>
                    </div>
                    {tierBFiltered.map((cap) => {
                      const isSelected = selectedId === cap.id;
                      return (
                        <button
                          key={cap.id}
                          onClick={() => setSelectedId(isSelected ? null : cap.id)}
                          className="w-full text-left px-4 py-3 border-b transition-all flex items-center gap-3"
                          style={{
                            borderColor: '#F1F5F9',
                            background: isSelected ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                            borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getOrgTypeColor(cap.organizationType) }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: '#0F172A' }}>{cap.shortName}</p>
                            <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{getOrgTypeLabel(cap.organizationType)}</p>
                          </div>
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{
                              backgroundColor: `${getReadinessColor(cap.readiness)}12`,
                              color: getReadinessColor(cap.readiness),
                            }}
                          >
                            {getReadinessLabel(cap.readiness)}
                          </span>
                          {isSelected && <ChevronRight size={12} style={{ color: '#2563EB' }} />}
                        </button>
                      );
                    })}
                  </>
                )}

                {filteredCapabilities.length === 0 && (
                  <div className="p-8 text-center">
                    <Network size={24} style={{ color: '#CBD5E1' }} className="mx-auto mb-2" />
                    <p className="text-xs" style={{ color: '#64748B' }}>No capabilities match the current filters.</p>
                    <button
                      onClick={() => { setTierFilter(null); setOrgTypeFilter(null); }}
                      className="text-xs mt-2"
                      style={{ color: '#FF8200' }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Detail or summary view */}
          <div className="flex-1 min-w-0">
            {selectedCapability ? (
              /* DETAIL VIEW for selected capability */
              <div className="fade-in-up">
                {/* Header card */}
                <div className="navy-card p-6 mb-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{selectedCapability.name}</h2>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedCapability.shortName}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-3 py-1.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: selectedCapability.tier === 'A' ? 'rgba(255, 130, 0, 0.2)' : 'rgba(96, 165, 250, 0.2)',
                          color: selectedCapability.tier === 'A' ? '#FFB366' : '#93C5FD',
                        }}
                      >
                        Tier {selectedCapability.tier}
                      </span>
                      <span
                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${getReadinessColor(selectedCapability.readiness)}25`,
                          color: selectedCapability.readiness === '0-30 days' ? '#6EE7B7' : selectedCapability.readiness === '30-90 days' ? '#FCD34D' : '#FCA5A5',
                        }}
                      >
                        {getReadinessLabel(selectedCapability.readiness)} ({selectedCapability.readiness})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} />
                      {getOrgTypeLabel(selectedCapability.organizationType)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} />
                      {selectedCapability.location}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="card p-5 mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>Description</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{selectedCapability.description}</p>
                </div>

                {/* Two column: Sectors + Deliverables */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Sector Alignment</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCapability.sectors.map((sector) => (
                        <span
                          key={sector}
                          className="text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${getSectorColor(sector as Sector)}12`,
                            color: getSectorColor(sector as Sector),
                            border: `1px solid ${getSectorColor(sector as Sector)}30`,
                          }}
                        >
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Deliverable Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCapability.deliverables.map((d) => (
                        <span
                          key={d}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Core capabilities */}
                <div className="card p-5 mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Core Capabilities</h3>
                  <ul className="space-y-2">
                    {selectedCapability.capabilities.map((capability, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#334155' }}>
                        <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#FF8200' }} />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Partner connections */}
                {selectedCapability.partnerIds.length > 0 && (
                  <div className="card p-5 mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Partner Connections</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCapability.partnerIds.map((pid) => {
                        const partner = capabilities.find((c) => c.id === pid);
                        if (!partner) return null;
                        return (
                          <button
                            key={pid}
                            onClick={() => setSelectedId(pid)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:shadow-sm"
                            style={{
                              backgroundColor: `${getOrgTypeColor(partner.organizationType)}10`,
                              color: getOrgTypeColor(partner.organizationType),
                              border: `1px solid ${getOrgTypeColor(partner.organizationType)}30`,
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOrgTypeColor(partner.organizationType) }} />
                              {partner.shortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sector coverage mini-chart */}
                <div className="card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748B' }}>Sector Coverage</h3>
                  <p className="text-[11px] mb-4" style={{ color: '#64748B' }}>
                    Sectors served by this capability highlighted against the full network.
                  </p>
                  <div className="space-y-2.5">
                    {selectedSectorCoverage.map(({ sector, totalCount, active }) => {
                      const pct = (totalCount / maxSectorCount) * 100;
                      return (
                        <div key={sector}>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="flex items-center gap-2" style={{ color: active ? '#0F172A' : '#94A3B8' }}>
                              <span
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: active ? getSectorColor(sector as Sector) : '#CBD5E1' }}
                              />
                              {sector}
                            </span>
                            {active && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${getSectorColor(sector as Sector)}12`, color: getSectorColor(sector as Sector) }}>Active</span>
                            )}
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                            <div
                              className="h-full rounded-full score-bar"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: active ? getSectorColor(sector as Sector) : '#CBD5E1',
                                opacity: active ? 0.8 : 0.3,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* DEFAULT SUMMARY VIEW */
              <div className="fade-in-up">
                {/* Network Overview */}
                <div className="navy-card p-6 mb-6">
                  <h2 className="text-lg font-bold text-white mb-1">Network Overview</h2>
                  <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Select a capability from the sidebar to view its full profile. Summary statistics for the entire network are shown below.
                  </p>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'UTEP Units', value: summaryStats.utepUnits, icon: Building2, color: '#FF8200', subtitle: 'Tier A Core' },
                      { label: 'External Partners', value: summaryStats.externalPartners, icon: Users, color: '#60A5FA', subtitle: 'Tier B Network' },
                      { label: 'Sectors Covered', value: summaryStats.sectorsCovered, icon: Layers, color: '#34D399', subtitle: 'Of 12 total' },
                      { label: 'Avg Readiness', value: `${summaryStats.avgReadiness}d`, icon: Clock, color: '#FBBF24', subtitle: 'Days to deploy' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg p-4"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon size={14} style={{ color: stat.color }} />
                          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.subtitle}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector Coverage Chart */}
                <div className="card p-6">
                  <div className="mb-5">
                    <h2 className="text-base font-semibold mb-1" style={{ color: '#0F172A' }}>Network Coverage by Sector</h2>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      Number of capabilities available per sector across the entire UTEP and partner network.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {sectorCoverage.map(([sector, count]) => {
                      const pct = (count / maxSectorCount) * 100;
                      return (
                        <div key={sector}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="flex items-center gap-2" style={{ color: '#334155' }}>
                              <span
                                className="w-2.5 h-2.5 rounded-sm"
                                style={{ backgroundColor: getSectorColor(sector as Sector) }}
                              />
                              {sector}
                            </span>
                            <span className="font-semibold" style={{ color: '#0F172A' }}>{count} capabilities</span>
                          </div>
                          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                            <div
                              className="h-full rounded-full score-bar"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: getSectorColor(sector as Sector),
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
