'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Network, DollarSign, Zap, TrendingUp, Clock, ChevronRight, ArrowRight, Search, Target, GitMerge, BarChart3, MapPin, Users, Building2 } from 'lucide-react';
import MetricCard from '@/components/layout/MetricCard';
import jurisdictions from '@/data/jurisdictions.json';
import problems from '@/data/problems.json';
import capabilities from '@/data/capabilities.json';
import funding from '@/data/funding.json';
import alignments from '@/data/alignments.json';
import { getSectorColor, getUrgencyColor, formatCurrency, getScoreGrade, getSourceLevelColor } from '@/lib/utils';
import Link from 'next/link';

const BorderplexMap = dynamic(() => import('@/components/map/BorderplexMap'), { ssr: false });

export default function OverviewPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);

  const totalPipelineValue = useMemo(() => {
    return alignments.reduce((sum, a) => {
      const match = a.estimatedValue.match(/\$(\d+)M/);
      return sum + (match ? parseInt(match[1]) * 1_000_000 : 0);
    }, 0);
  }, []);

  const topAlignments = alignments.slice(0, 5);

  const upcomingFunding = funding
    .filter((f) => f.deadline)
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 6);

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    problems.forEach((p) => { counts[p.sector] = (counts[p.sector] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const criticalCount = problems.filter(p => p.urgency === 'Critical').length;
  const highCount = problems.filter(p => p.urgency === 'High').length;

  const selectedJurData = selectedJurisdiction ? jurisdictions.find(j => j.id === selectedJurisdiction) : null;
  const selectedJurChallenges = selectedJurisdiction ? problems.filter(p => p.jurisdictionIds.includes(selectedJurisdiction)) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero: Map + Sidebar */}
      <section className="border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
          {/* Compact header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF8200] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FF8200]">Executive Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1">Borderplex Funding Intelligence Platform</h1>
            <p className="text-sm text-[#334155] max-w-3xl">
              Identifying regional challenges, mapping them to UTEP and partner capabilities, and aligning them with funding opportunities across the El Paso, Las Cruces, and Ciudad Juarez corridor.
            </p>
          </div>

          {/* Map + Right Sidebar */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-4">
            {/* Map */}
            <div className="card p-1 overflow-hidden">
              <BorderplexMap
                height="480px"
                onSelectJurisdiction={setSelectedJurisdiction}
                selectedJurisdiction={selectedJurisdiction}
              />
            </div>

            {/* Sidebar: Jurisdiction detail or summary */}
            <div className="space-y-3">
              {selectedJurData ? (
                <div className="card p-4 fade-in-up border-l-4" style={{ borderLeftColor: selectedJurData.state === 'TX' ? '#FF8200' : selectedJurData.state === 'NM' ? '#10B981' : '#EC4899' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#0F172A]">{selectedJurData.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                      backgroundColor: selectedJurData.state === 'TX' ? '#FFF7ED' : selectedJurData.state === 'NM' ? '#ECFDF5' : '#FDF2F8',
                      color: selectedJurData.state === 'TX' ? '#FF8200' : selectedJurData.state === 'NM' ? '#059669' : '#DB2777',
                    }}>{selectedJurData.state}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">{selectedJurData.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <div className="text-base font-bold text-[#0F172A]">{selectedJurData.population.toLocaleString()}</div>
                      <div className="text-[9px] text-[#64748B]">Population</div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <div className="text-base font-bold text-[#FF8200]">{selectedJurChallenges.length}</div>
                      <div className="text-[9px] text-[#64748B]">Active Challenges</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Top Challenges</div>
                  <div className="space-y-1.5">
                    {selectedJurChallenges.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-2 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getUrgencyColor(p.urgency as any) }} />
                        <span className="text-[#334155] truncate">{p.title}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSelectedJurisdiction(null)} className="text-[10px] text-[#FF8200] mt-3 font-medium hover:underline">Clear selection</button>
                </div>
              ) : (
                <>
                  <div className="card p-4">
                    <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Region at a Glance</div>
                    <p className="text-[11px] text-[#334155] leading-relaxed mb-3">
                      Click any jurisdiction on the map to see its challenges, population, and funding alignment. The map covers 13 jurisdictions across Texas, New Mexico, and Chihuahua.
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: 'Total Population', value: '2.5M+', icon: Users },
                        { label: 'Jurisdictions', value: String(jurisdictions.length), icon: MapPin },
                        { label: 'Critical Challenges', value: String(criticalCount), icon: AlertTriangle, color: '#DC2626' },
                        { label: 'High Priority', value: String(highCount), icon: AlertTriangle, color: '#D97706' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[11px] text-[#64748B]">
                            <item.icon size={12} style={{ color: item.color || '#64748B' }} />{item.label}
                          </span>
                          <span className="text-xs font-bold" style={{ color: item.color || '#0F172A' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Urgency breakdown mini-panel */}
              <div className="card p-4">
                <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Challenge Urgency</div>
                <div className="flex gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map(u => {
                    const count = problems.filter(p => p.urgency === u).length;
                    return (
                      <div key={u} className="flex-1 rounded-lg p-2 text-center" style={{ backgroundColor: `${getUrgencyColor(u)}08` }}>
                        <div className="text-sm font-bold" style={{ color: getUrgencyColor(u) }}>{count}</div>
                        <div className="text-[8px] font-medium" style={{ color: getUrgencyColor(u) }}>{u}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top sectors mini-panel */}
              <div className="card p-4">
                <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Top Sectors</div>
                <div className="space-y-1.5">
                  {sectorCounts.slice(0, 5).map(([sector, count]) => {
                    const maxCount = sectorCounts[0][1] as number;
                    const pct = ((count as number) / maxCount) * 100;
                    return (
                      <div key={sector}>
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-[#334155]">{sector}</span>
                          <span className="font-bold text-[#0F172A]">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div className="h-full rounded-full score-bar" style={{ width: `${pct}%`, backgroundColor: getSectorColor(sector as any) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Row + How It Works (compact) */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Regional Challenges" value={problems.length} subtitle={`Across ${jurisdictions.length} jurisdictions`} icon={AlertTriangle} accentColor="#DC2626" />
            <MetricCard label="Capabilities Mapped" value={capabilities.length} subtitle="UTEP + Partner Network" icon={Network} accentColor="#8B5CF6" />
            <MetricCard label="Funding Programs" value={funding.length} subtitle="Federal, State, Binational" icon={DollarSign} accentColor="#059669" />
            <MetricCard label="Pipeline Value" value={`${formatCurrency(totalPipelineValue)}+`} subtitle={`${alignments.length} alignments, avg score ${Math.round(alignments.reduce((s, a) => s + a.score, 0) / alignments.length)}`} icon={Zap} accentColor="#FF8200" />
          </div>

          {/* How It Works - horizontal compact */}
          <div className="mb-2">
            <h2 className="text-sm font-bold text-[#0F172A] mb-3">How It Works</h2>
            <div className="grid grid-cols-4 gap-3">
              {[
                { step: '01', title: 'Identify', desc: 'We review every adopted strategic plan, needs assessment, and stakeholder input from the 13 jurisdictions in the Borderplex corridor. Each challenge is documented at a level of specificity that supports federal funding alignment, including population impact, financial scale, and agency mapping.', icon: Search, color: '#DC2626' },
                { step: '02', title: 'Map', desc: 'We catalog the full spectrum of UTEP research centers, institutes, and partner organizations, describing each in terms of what they can deliver, which sectors they serve, and how quickly they can mobilize. The network includes national laboratories, universities, military installations, and manufacturers.', icon: Target, color: '#8B5CF6' },
                { step: '03', title: 'Align', desc: 'We evaluate every combination of challenge, capability, and funding program for sector fit, eligibility match, and structural feasibility. Only combinations that meet all three criteria are retained as potential alignments.', icon: GitMerge, color: '#059669' },
                { step: '04', title: 'Score', desc: 'Each alignment receives a composite score based on four weighted factors: challenge urgency (30%), capability readiness (25%), funding fit (25%), and partnership maturity (20%). Scores above 90 indicate opportunities ready for immediate pursuit.', icon: BarChart3, color: '#FF8200' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}10` }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F172A]">{s.title}</div>
                    <div className="text-[10px] text-[#64748B] leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two-column: Top Alignments + Funding Signals */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Alignments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Top Opportunity Alignments</h2>
                <p className="text-[11px] text-[#64748B]">Highest-scored challenge, capability, and funding matches</p>
              </div>
              <Link href="/alignments" className="text-xs text-[#FF8200] hover:underline flex items-center gap-1 font-medium">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2">
              {topAlignments.map((a) => {
                const problem = problems.find((p) => p.id === a.problemId);
                const grade = getScoreGrade(a.score);
                const primaryFunding = funding.find((f) => f.id === a.fundingIds[0]);
                const capNames = a.capabilityIds.slice(0, 3).map((id) => capabilities.find((c) => c.id === id)?.shortName).filter(Boolean);
                if (!problem) return null;
                return (
                  <Link href="/alignments" key={a.id} className="card p-3 hover:shadow-md transition-all group block">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: `${grade.color}10` }}>
                        <span className="text-base font-bold leading-none" style={{ color: grade.color }}>{a.score}</span>
                        <span className="text-[7px] font-semibold" style={{ color: grade.color }}>{grade.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${getSectorColor(problem.sector as any)}12`, color: getSectorColor(problem.sector as any) }}>{problem.sector}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">{a.utepRole}</span>
                        </div>
                        <h3 className="text-[12px] font-semibold text-[#0F172A] group-hover:text-[#FF8200] transition-colors truncate">{problem.title}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-[#64748B] mt-0.5">
                          <span className="flex items-center gap-1"><Network size={9} />{capNames.join(' + ')}</span>
                          <span className="flex items-center gap-1"><TrendingUp size={9} />{a.estimatedValue}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#FF8200] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Funding Signals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">Funding Signals</h2>
                <p className="text-[11px] text-[#64748B]">Upcoming deadlines</p>
              </div>
              <Link href="/funding" className="text-xs text-[#FF8200] hover:underline flex items-center gap-1 font-medium">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2">
              {upcomingFunding.map((f) => (
                <div key={f.id} className="card p-3 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-[11px] font-semibold text-[#0F172A] leading-tight flex-1">{f.name}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 font-semibold" style={{ backgroundColor: `${getSourceLevelColor(f.sourceLevel as any)}12`, color: getSourceLevelColor(f.sourceLevel as any) }}>{f.sourceLevel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                    <span><Building2 size={9} className="inline mr-0.5" />{f.agency}</span>
                    <span><Clock size={9} className="inline mr-0.5" />{f.deadline}</span>
                  </div>
                  <div className="text-[10px] font-medium text-[#059669] mt-1">
                    {formatCurrency(f.awardRangeMin)} to {formatCurrency(f.awardRangeMax)}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick nav */}
            <div className="mt-4 card p-4">
              <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">Explore</div>
              <div className="space-y-1">
                {[
                  { href: '/problems', label: 'Challenge Registry', desc: `${problems.length} documented challenges`, color: '#DC2626' },
                  { href: '/capabilities', label: 'Capability Atlas', desc: `${capabilities.length} institutions mapped`, color: '#8B5CF6' },
                  { href: '/funding', label: 'Funding Landscape', desc: `${funding.length} programs tracked`, color: '#059669' },
                  { href: '/alignments', label: 'Alignment Engine', desc: `${alignments.length} scored matches`, color: '#FF8200' },
                ].map(nav => (
                  <Link key={nav.href} href={nav.href} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-[#F1F5F9] transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: nav.color }} />
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A] group-hover:text-[#FF8200] transition-colors">{nav.label}</div>
                        <div className="text-[10px] text-[#64748B]">{nav.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#FF8200] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
