'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, Network, DollarSign, Zap, TrendingUp, Clock, ChevronRight, ArrowRight, Search, Target, GitMerge, BarChart3 } from 'lucide-react';
import MetricCard from '@/components/layout/MetricCard';
import jurisdictions from '@/data/jurisdictions.json';
import problems from '@/data/problems.json';
import capabilities from '@/data/capabilities.json';
import funding from '@/data/funding.json';
import alignments from '@/data/alignments.json';
import { getSectorColor, getUrgencyColor, formatCurrency, getScoreGrade, getSourceLevelColor } from '@/lib/utils';
import Link from 'next/link';

export default function OverviewPage() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);

  const totalPipelineValue = useMemo(() => {
    return alignments.reduce((sum, a) => {
      const match = a.estimatedValue.match(/\$(\d+)M/);
      return sum + (match ? parseInt(match[1]) * 1_000_000 : 0);
    }, 0);
  }, []);

  const topAlignments = alignments.slice(0, 4);

  const upcomingFunding = funding
    .filter((f) => f.deadline)
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 5);

  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    problems.forEach((p) => {
      counts[p.sector] = (counts[p.sector] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section with Map */}
      <section className="relative border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8 fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF8200] animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-widest text-[#FF8200]">Executive Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">Borderplex Funding Intelligence Platform</h1>
            <p className="text-[#334155] max-w-3xl leading-relaxed">
              This platform identifies regional challenges across the Borderplex corridor, maps them to UTEP and partner capabilities, and aligns them with federal, state, and binational funding opportunities. It provides decision-makers with scored, actionable intelligence for funding capture.
            </p>
            <p className="text-xs text-[#64748B] mt-2">
              Powered by AAII (UTEP Institute for Applied AI Innovation) for the UTEP Research &amp; Innovation Office (R&amp;I)
            </p>
          </div>

          {/* Interactive Map Area */}
          <div className="navy-card p-1 mb-8 fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="relative rounded-xl overflow-hidden" style={{ height: '440px', background: 'linear-gradient(135deg, #041E42 0%, #0A2A5C 50%, #041E42 100%)' }}>
              <svg viewBox="0 0 1000 440" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#041E42" />
                    <stop offset="50%" stopColor="#0A2A5C" />
                    <stop offset="100%" stopColor="#041E42" />
                  </linearGradient>
                  <linearGradient id="borderGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF8200" stopOpacity="0.1" />
                    <stop offset="30%" stopColor="#FF8200" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#FFAA44" stopOpacity="1" />
                    <stop offset="70%" stopColor="#FF8200" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FF8200" stopOpacity="0.1" />
                  </linearGradient>
                  <radialGradient id="nodeHalo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="strongGlow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A3A5C" strokeWidth="0.3" opacity="0.4" />
                  </pattern>
                  <pattern id="topoPattern" width="120" height="120" patternUnits="userSpaceOnUse">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1A3A5C" strokeWidth="0.3" opacity="0.2" />
                    <circle cx="60" cy="60" r="35" fill="none" stroke="#1A3A5C" strokeWidth="0.2" opacity="0.15" />
                    <circle cx="60" cy="60" r="20" fill="none" stroke="#1A3A5C" strokeWidth="0.2" opacity="0.1" />
                  </pattern>
                </defs>

                {/* Base fill */}
                <rect width="1000" height="440" fill="url(#mapGrad)" />

                {/* Grid overlay */}
                <rect width="1000" height="440" fill="url(#gridPattern)" />

                {/* Topographic contour curves */}
                <rect width="1000" height="440" fill="url(#topoPattern)" />

                {/* Additional topo contours around key areas */}
                <ellipse cx="500" cy="180" rx="180" ry="100" fill="none" stroke="#1E4976" strokeWidth="0.4" opacity="0.3" />
                <ellipse cx="500" cy="180" rx="140" ry="75" fill="none" stroke="#1E4976" strokeWidth="0.3" opacity="0.25" />
                <ellipse cx="500" cy="180" rx="100" ry="50" fill="none" stroke="#1E4976" strokeWidth="0.3" opacity="0.2" />
                <ellipse cx="240" cy="120" rx="90" ry="70" fill="none" stroke="#1E4976" strokeWidth="0.3" opacity="0.2" />
                <ellipse cx="240" cy="120" rx="60" ry="45" fill="none" stroke="#1E4976" strokeWidth="0.3" opacity="0.15" />

                {/* Terrain elevation lines */}
                <path d="M 0 180 Q 100 170, 200 175 Q 300 180, 400 165 Q 500 155, 600 160 Q 700 165, 800 155 Q 900 150, 1000 145" stroke="#1A3A5C" strokeWidth="0.4" fill="none" opacity="0.2" />
                <path d="M 0 220 Q 150 210, 250 215 Q 350 220, 450 210 Q 550 205, 650 208 Q 750 212, 850 200 Q 950 195, 1000 190" stroke="#1A3A5C" strokeWidth="0.3" fill="none" opacity="0.15" />

                {/* US-Mexico border with glow effect */}
                <path d="M 0 290 Q 200 310, 400 280 Q 500 270, 600 275 Q 700 278, 800 260 Q 900 250, 1000 240" stroke="url(#borderGlow)" strokeWidth="3" fill="none" filter="url(#strongGlow)" />
                <path d="M 0 290 Q 200 310, 400 280 Q 500 270, 600 275 Q 700 278, 800 260 Q 900 250, 1000 240" stroke="#FF8200" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M 0 290 Q 200 310, 400 280 Q 500 270, 600 275 Q 700 278, 800 260 Q 900 250, 1000 240" stroke="#FFAA44" strokeWidth="0.5" fill="none" opacity="0.9" />

                {/* Border label */}
                <rect x="395" y="282" width="130" height="16" rx="3" fill="#041E42" opacity="0.8" />
                <text x="460" y="294" fill="#FF8200" fontSize="9" fontFamily="Inter, system-ui" textAnchor="middle" fontWeight="600" letterSpacing="2">US / MEXICO</text>

                {/* State boundary */}
                <path d="M 300 0 L 300 290" stroke="#2A5080" strokeWidth="1" strokeDasharray="8 4" opacity="0.5" />
                <rect x="230" y="8" width="60" height="14" rx="2" fill="#041E42" opacity="0.7" />
                <text x="260" y="19" fill="#6B98C7" fontSize="9" fontFamily="Inter, system-ui" textAnchor="middle" fontWeight="500">NEW MEXICO</text>
                <rect x="340" y="8" width="40" height="14" rx="2" fill="#041E42" opacity="0.7" />
                <text x="360" y="19" fill="#6B98C7" fontSize="9" fontFamily="Inter, system-ui" textAnchor="middle" fontWeight="500">TEXAS</text>

                {/* County regions with subtle fill */}
                <rect x="180" y="40" width="120" height="230" rx="8" fill="#0D2240" stroke="#1E4976" strokeWidth="0.8" opacity="0.6" />
                <text x="215" y="60" fill="#5A8AB5" fontSize="9" fontFamily="Inter, system-ui" fontWeight="500">Dona Ana Co.</text>
                <rect x="320" y="60" width="350" height="210" rx="8" fill="#0D2240" stroke="#1E4976" strokeWidth="0.8" opacity="0.6" />
                <text x="460" y="80" fill="#5A8AB5" fontSize="9" fontFamily="Inter, system-ui" fontWeight="500">El Paso County</text>

                {/* Ciudad Juarez zone */}
                <rect x="350" y="295" width="210" height="120" rx="8" fill="#0F1D35" stroke="#EC4899" strokeWidth="0.8" opacity="0.5" />
                <text x="406" y="350" fill="#EC4899" fontSize="12" fontFamily="Inter, system-ui" fontWeight="700">Ciudad Juarez</text>
                <text x="406" y="368" fill="#EC489988" fontSize="9" fontFamily="Inter, system-ui">1.5M pop, 330+ maquiladoras</text>

                {/* Jurisdiction nodes with pulsing halos */}
                {[
                  { id: 'las-cruces', x: 240, y: 110, r: 22, label: 'Las Cruces', pop: '111K', color: '#10B981' },
                  { id: 'anthony-nm', x: 280, y: 200, r: 8, label: 'Anthony NM', pop: '', color: '#10B981' },
                  { id: 'anthony-tx', x: 310, y: 210, r: 8, label: 'Anthony TX', pop: '', color: '#F59E0B' },
                  { id: 'vado-nm', x: 225, y: 165, r: 7, label: 'Vado', pop: '', color: '#10B981' },
                  { id: 'el-paso-city', x: 500, y: 175, r: 38, label: 'El Paso', pop: '682K', color: '#FF8200' },
                  { id: 'socorro', x: 595, y: 225, r: 14, label: 'Socorro', pop: '35K', color: '#F59E0B' },
                  { id: 'horizon', x: 655, y: 190, r: 12, label: 'Horizon', pop: '22K', color: '#F59E0B' },
                  { id: 'san-elizario', x: 625, y: 250, r: 10, label: 'San Elizario', pop: '9K', color: '#F59E0B' },
                  { id: 'fabens', x: 705, y: 220, r: 9, label: 'Fabens', pop: '8K', color: '#F59E0B' },
                  { id: 'tornillo', x: 775, y: 240, r: 7, label: 'Tornillo', pop: '2K', color: '#F59E0B' },
                ].map((j) => (
                  <g
                    key={j.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedJurisdiction(selectedJurisdiction === j.id ? null : j.id)}
                    opacity={!selectedJurisdiction || selectedJurisdiction === j.id ? 1 : 0.3}
                  >
                    {/* Gradient halo */}
                    <circle cx={j.x} cy={j.y} r={j.r + 18} fill="url(#nodeHalo)" />
                    {/* Outer pulse ring */}
                    <circle cx={j.x} cy={j.y} r={j.r + 8} fill="none" stroke={j.color} strokeWidth="0.5" opacity="0.15">
                      <animate attributeName="r" values={`${j.r + 6};${j.r + 14};${j.r + 6}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
                    </circle>
                    {/* Main node ring */}
                    <circle cx={j.x} cy={j.y} r={j.r} fill={j.color} opacity="0.12" stroke={j.color} strokeWidth="1.5" />
                    {/* Inner core */}
                    <circle cx={j.x} cy={j.y} r={j.r * 0.35} fill={j.color} opacity="0.9" filter="url(#glow)" />
                    {/* Label */}
                    <text x={j.x} y={j.y + j.r + 14} textAnchor="middle" fill="#E2E8F0" fontSize={j.r > 15 ? '11' : '9'} fontFamily="Inter, system-ui" fontWeight="600">{j.label}</text>
                    {j.pop && <text x={j.x} y={j.y + j.r + 26} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="Inter, system-ui">{j.pop}</text>}
                  </g>
                ))}

                {/* Partner pins */}
                {[
                  { x: 480, y: 105, label: 'UTEP', color: '#FF8200' },
                  { x: 430, y: 128, label: 'Fort Bliss', color: '#EF4444' },
                  { x: 700, y: 135, label: 'WSMR', color: '#EF4444' },
                  { x: 195, y: 105, label: 'NMSU', color: '#8B5CF6' },
                  { x: 145, y: 65, label: 'Spaceport', color: '#6366F1' },
                ].map((p) => (
                  <g key={p.label}>
                    <circle cx={p.x} cy={p.y} r="12" fill={p.color} opacity="0.06" />
                    <polygon points={`${p.x},${p.y - 9} ${p.x - 5},${p.y + 2} ${p.x + 5},${p.y + 2}`} fill={p.color} opacity="0.9" filter="url(#glow)" />
                    <text x={p.x} y={p.y - 14} textAnchor="middle" fill={p.color} fontSize="8" fontFamily="Inter, system-ui" fontWeight="700" letterSpacing="0.5">{p.label}</text>
                  </g>
                ))}

                {/* Connection lines between key nodes (subtle) */}
                <line x1="240" y1="110" x2="500" y2="175" stroke="#1E4976" strokeWidth="0.4" strokeDasharray="4 6" opacity="0.3" />
                <line x1="500" y1="175" x2="595" y2="225" stroke="#1E4976" strokeWidth="0.3" strokeDasharray="4 6" opacity="0.2" />
                <line x1="500" y1="175" x2="655" y2="190" stroke="#1E4976" strokeWidth="0.3" strokeDasharray="4 6" opacity="0.2" />
                <line x1="480" y1="105" x2="500" y2="175" stroke="#FF820033" strokeWidth="0.6" />
                <line x1="195" y1="105" x2="240" y2="110" stroke="#8B5CF633" strokeWidth="0.6" />

                {/* Legend */}
                <g transform="translate(20, 370)">
                  <rect x="-4" y="-8" width="140" height="65" rx="4" fill="#041E42" opacity="0.85" stroke="#1E4976" strokeWidth="0.5" />
                  <text fill="#6B98C7" fontSize="8" fontFamily="Inter, system-ui" fontWeight="700" letterSpacing="1.5">LEGEND</text>
                  <circle cx="8" cy="18" r="4" fill="#FF8200" opacity="0.6" /><text x="18" y="22" fill="#94A3B8" fontSize="8" fontFamily="Inter, system-ui">TX Jurisdiction</text>
                  <circle cx="8" cy="34" r="4" fill="#10B981" opacity="0.6" /><text x="18" y="38" fill="#94A3B8" fontSize="8" fontFamily="Inter, system-ui">NM Jurisdiction</text>
                  <polygon points="8,44 3,54 13,54" fill="#EF4444" opacity="0.8" /><text x="20" y="52" fill="#94A3B8" fontSize="8" fontFamily="Inter, system-ui">Key Partner</text>
                </g>

                {/* Coordinates overlay (decorative) */}
                <text x="930" y="430" fill="#1E4976" fontSize="7" fontFamily="monospace" textAnchor="end" opacity="0.5">31.7N 106.4W</text>
              </svg>

              {/* Selected jurisdiction detail */}
              {selectedJurisdiction && (() => {
                const j = jurisdictions.find((jur) => jur.id === selectedJurisdiction);
                const jChallenges = problems.filter((p) => p.jurisdictionIds.includes(selectedJurisdiction));
                if (!j) return null;
                return (
                  <div className="absolute top-4 right-4 w-80 bg-[#041E42]/95 backdrop-blur-sm border border-[#1E4976] rounded-xl p-4 fade-in-up shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">{j.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${j.state === 'TX' ? 'bg-[#FF8200]/10 text-[#FF8200]' : j.state === 'NM' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-pink-500/10 text-pink-400'}`}>{j.state}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2">{j.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-[#0A2A5C] rounded-lg p-2">
                        <div className="text-lg font-bold text-white">{j.population.toLocaleString()}</div>
                        <div className="text-[10px] text-[#64748B]">Population</div>
                      </div>
                      <div className="bg-[#0A2A5C] rounded-lg p-2">
                        <div className="text-lg font-bold text-[#FF8200]">{jChallenges.length}</div>
                        <div className="text-[10px] text-[#64748B]">Active Challenges</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {jChallenges.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getUrgencyColor(p.urgency as any) }} />
                          <span className="text-[#94A3B8] truncate">{p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Regional Challenges" value={problems.length} subtitle={`Across ${jurisdictions.length} jurisdictions`} icon={AlertTriangle} trend={{ value: '5 new this quarter', positive: true }} accentColor="#EF4444" />
            <MetricCard label="Capabilities Mapped" value={capabilities.length} subtitle="UTEP + Partner Network" icon={Network} trend={{ value: '8 new partnerships', positive: true }} accentColor="#8B5CF6" />
            <MetricCard label="Funding Programs" value={funding.length} subtitle="Federal, State, Binational" icon={DollarSign} trend={{ value: '6 new signals', positive: true }} accentColor="#10B981" />
            <MetricCard label="Alignment Matches" value={alignments.length} subtitle={`${formatCurrency(totalPipelineValue)}+ pipeline value`} icon={Zap} trend={{ value: `Avg score: ${Math.round(alignments.reduce((s, a) => s + a.score, 0) / alignments.length)}`, positive: true }} accentColor="#FF8200" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">How It Works</h2>
            <p className="text-sm text-[#64748B]">From regional needs to funded proposals, in four steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Identify',
                description: 'We catalog regional challenges from adopted government plans, needs assessments, and stakeholder input across all 13 Borderplex jurisdictions.',
                icon: Search,
                color: '#EF4444',
              },
              {
                step: '02',
                title: 'Map',
                description: 'We match each challenge to UTEP centers, labs, and partner organizations that have the research capacity and technical expertise to respond.',
                icon: Target,
                color: '#8B5CF6',
              },
              {
                step: '03',
                title: 'Align',
                description: 'We connect capability and challenge pairs to federal, state, and binational funding programs with matching eligibility and sector focus.',
                icon: GitMerge,
                color: '#10B981',
              },
              {
                step: '04',
                title: 'Score',
                description: 'We produce ranked alignments with composite scores, ready for proposal development by the R&I Office and faculty teams.',
                icon: BarChart3,
                color: '#FF8200',
              },
            ].map((item) => (
              <div key={item.step} className="card p-6 text-center fade-in-up group hover:shadow-md transition-shadow" style={{ animationDelay: `${parseInt(item.step) * 80}ms` }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-4" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: item.color }}>Step {item.step}</div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-column: Alignments + Funding */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">Top Opportunity Alignments</h2>
                <p className="text-xs text-[#64748B]">Highest-scored challenge, capability, and funding matches</p>
              </div>
              <Link href="/alignments" className="text-xs text-[#FF8200] hover:text-[#E57400] flex items-center gap-1 font-medium">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-3">
              {topAlignments.map((a) => {
                const problem = problems.find((p) => p.id === a.problemId);
                const grade = getScoreGrade(a.score);
                const primaryFunding = funding.find((f) => f.id === a.fundingIds[0]);
                const capNames = a.capabilityIds.slice(0, 3).map((id) => capabilities.find((c) => c.id === id)?.shortName).filter(Boolean);
                if (!problem) return null;
                return (
                  <Link href="/alignments" key={a.id} className="card p-4 hover:shadow-md transition-all group block">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center" style={{ backgroundColor: `${grade.color}10` }}>
                        <span className="text-xl font-bold" style={{ color: grade.color }}>{a.score}</span>
                        <span className="text-[8px] font-medium" style={{ color: grade.color }}>{grade.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${getSectorColor(problem.sector as any)}12`, color: getSectorColor(problem.sector as any) }}>{problem.sector}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">{a.utepRole}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-1 group-hover:text-[#FF8200] transition-colors">{problem.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1"><Network size={10} />{capNames.join(' + ')}</span>
                          <span className="flex items-center gap-1"><DollarSign size={10} />{primaryFunding?.agency}</span>
                          <span className="flex items-center gap-1"><TrendingUp size={10} />{a.estimatedValue}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#CBD5E1] group-hover:text-[#FF8200] transition-colors flex-shrink-0 mt-2" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0F172A]">Funding Signals</h2>
                <Link href="/funding" className="text-xs text-[#FF8200] hover:text-[#E57400] flex items-center gap-1 font-medium">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="space-y-2">
                {upcomingFunding.map((f) => (
                  <div key={f.id} className="card p-3 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium text-[#0F172A] leading-tight flex-1">{f.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full ml-2 flex-shrink-0 font-medium" style={{ backgroundColor: `${getSourceLevelColor(f.sourceLevel as any)}12`, color: getSourceLevelColor(f.sourceLevel as any) }}>{f.sourceLevel}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
                      <span>{f.agency}</span>
                      <span className="flex items-center gap-1"><Clock size={9} />{f.deadline}</span>
                      <span>{formatCurrency(f.awardRangeMin)} to {formatCurrency(f.awardRangeMax)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Challenge Distribution by Sector</h2>
              <div className="card p-5">
                <div className="space-y-3">
                  {sectorCounts.map(([sector, count]) => {
                    const maxCount = sectorCounts[0][1] as number;
                    const pct = ((count as number) / (maxCount as number)) * 100;
                    return (
                      <div key={sector}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#334155]">{sector}</span>
                          <span className="text-[#0F172A] font-semibold">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div className="h-full rounded-full score-bar" style={{ width: `${pct}%`, backgroundColor: getSectorColor(sector as any) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Regional Coverage</h3>
              <div className="space-y-3">
                {[
                  ['Population Served', '2.5M+'],
                  ['Jurisdictions Tracked', `${jurisdictions.length}`],
                  ['Cross-Border Partners', `${capabilities.filter(c => c.tier === 'B').length}`],
                  ['Critical Challenges', `${problems.filter(p => p.urgency === 'Critical').length}`],
                  ['States Covered', 'TX, NM, Chihuahua (MX)'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-[#64748B]">{label}</span>
                    <span className={`font-semibold ${label === 'Critical Challenges' ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
