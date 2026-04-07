'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Zap, Target, Network, DollarSign, TrendingUp, Clock, AlertTriangle,
  Shield, ChevronDown, ChevronUp, ArrowRight, Sparkles, Users, FileText,
} from 'lucide-react';
import alignments from '@/data/alignments.json';
import problems from '@/data/problems.json';
import capabilities from '@/data/capabilities.json';
import funding from '@/data/funding.json';
import jurisdictions from '@/data/jurisdictions.json';
import {
  formatCurrency, getSectorColor, getUrgencyColor, getScoreGrade,
  getSourceLevelColor, getOrgTypeColor, getOrgTypeLabel,
} from '@/lib/utils';
import type { Sector, FundingSourceLevel, Urgency } from '@/lib/types';

// ---------- Sankey-style flow visualization helpers ----------

interface FlowNode {
  id: string;
  label: string;
  group: 'challenge' | 'capability' | 'funding';
  color: string;
  sector?: string;
}

interface FlowLink {
  source: string;
  target: string;
  score: number;
  sector: string;
  alignmentId: string;
}

function buildFlowData() {
  const nodeMap = new Map<string, FlowNode>();
  const links: FlowLink[] = [];

  const sorted = [...alignments].sort((a, b) => b.score - a.score);

  sorted.forEach((a) => {
    const prob = problems.find((p) => p.id === a.problemId);
    if (!prob) return;

    if (!nodeMap.has(prob.id)) {
      nodeMap.set(prob.id, {
        id: prob.id,
        label: prob.title.length > 38 ? prob.title.slice(0, 36) + '...' : prob.title,
        group: 'challenge',
        color: getSectorColor(prob.sector as Sector),
        sector: prob.sector,
      });
    }

    a.capabilityIds.forEach((cid) => {
      const cap = capabilities.find((c) => c.id === cid);
      if (!cap) return;
      if (!nodeMap.has(cap.id)) {
        nodeMap.set(cap.id, {
          id: cap.id,
          label: cap.shortName,
          group: 'capability',
          color: getOrgTypeColor(cap.organizationType),
        });
      }
      links.push({ source: prob.id, target: cap.id, score: a.score, sector: prob.sector, alignmentId: a.id });
    });

    a.fundingIds.forEach((fid) => {
      const fund = funding.find((f) => f.id === fid);
      if (!fund) return;
      if (!nodeMap.has(fund.id)) {
        nodeMap.set(fund.id, {
          id: fund.id,
          label: fund.name.length > 32 ? fund.name.slice(0, 30) + '...' : fund.name,
          group: 'funding',
          color: getSourceLevelColor(fund.sourceLevel as FundingSourceLevel),
        });
      }
      a.capabilityIds.forEach((cid) => {
        if (nodeMap.has(cid)) {
          links.push({ source: cid, target: fund.id, score: a.score, sector: prob.sector, alignmentId: a.id });
        }
      });
    });
  });

  const nodes = Array.from(nodeMap.values());
  const challengeNodes = nodes.filter((n) => n.group === 'challenge');
  const capabilityNodes = nodes.filter((n) => n.group === 'capability');
  const fundingNodes = nodes.filter((n) => n.group === 'funding');

  return { challengeNodes, capabilityNodes, fundingNodes, links };
}

function SankeyFlow({ hoveredNode, onHover }: { hoveredNode: string | null; onHover: (id: string | null) => void }) {
  const { challengeNodes, capabilityNodes, fundingNodes, links } = useMemo(() => buildFlowData(), []);

  const colX = { challenge: 40, capability: 380, funding: 720 };
  const svgWidth = 960;
  const nodeHeight = 26;
  const nodeGap = 6;

  const getY = (index: number) => 30 + index * (nodeHeight + nodeGap);
  const totalHeight = Math.max(
    challengeNodes.length,
    capabilityNodes.length,
    fundingNodes.length
  ) * (nodeHeight + nodeGap) + 60;

  const nodeYMap = useMemo(() => {
    const map: Record<string, number> = {};
    challengeNodes.forEach((n, i) => { map[n.id] = getY(i); });
    capabilityNodes.forEach((n, i) => { map[n.id] = getY(i); });
    fundingNodes.forEach((n, i) => { map[n.id] = getY(i); });
    return map;
  }, [challengeNodes, capabilityNodes, fundingNodes]);

  const nodeXMap = useMemo(() => {
    const map: Record<string, number> = {};
    challengeNodes.forEach((n) => { map[n.id] = colX.challenge; });
    capabilityNodes.forEach((n) => { map[n.id] = colX.capability; });
    fundingNodes.forEach((n) => { map[n.id] = colX.funding; });
    return map;
  }, [challengeNodes, capabilityNodes, fundingNodes]);

  const connectedIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredNode);
    links.forEach((l) => {
      if (l.source === hoveredNode || l.target === hoveredNode) {
        ids.add(l.source);
        ids.add(l.target);
      }
    });
    return ids;
  }, [hoveredNode, links]);

  const nodeRectWidth = 200;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${totalHeight}`}
      className="w-full"
      style={{ minHeight: Math.min(totalHeight, 700) }}
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <filter id="link-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Column headers */}
      <text x={colX.challenge + 5} y={18} fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600" fontFamily="Inter" letterSpacing="0.05em">
        CHALLENGES
      </text>
      <text x={colX.capability + 5} y={18} fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600" fontFamily="Inter" letterSpacing="0.05em">
        CAPABILITIES
      </text>
      <text x={colX.funding + 5} y={18} fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="600" fontFamily="Inter" letterSpacing="0.05em">
        FUNDING
      </text>

      {/* Links */}
      {links.map((link, i) => {
        const sy = (nodeYMap[link.source] ?? 0) + nodeHeight / 2;
        const ty = (nodeYMap[link.target] ?? 0) + nodeHeight / 2;
        const sx = (nodeXMap[link.source] ?? 0) + nodeRectWidth;
        const tx = nodeXMap[link.target] ?? 0;
        const midX = (sx + tx) / 2;
        const color = getSectorColor(link.sector as Sector);
        const isHighlighted = hoveredNode ? connectedIds.has(link.source) && connectedIds.has(link.target) : true;
        const opacity = hoveredNode ? (isHighlighted ? 0.6 : 0.04) : (link.score / 100) * 0.35 + 0.05;

        return (
          <path
            key={`link-${i}`}
            d={`M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`}
            fill="none"
            stroke={color}
            strokeWidth={isHighlighted && hoveredNode ? 2.5 : 1.5}
            opacity={opacity}
            filter={isHighlighted && hoveredNode ? 'url(#link-glow)' : undefined}
          />
        );
      })}

      {/* Challenge nodes */}
      {challengeNodes.map((node, i) => {
        const y = getY(i);
        const dimmed = hoveredNode && !connectedIds.has(node.id);
        return (
          <g
            key={node.id}
            className="cursor-pointer"
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            opacity={dimmed ? 0.15 : 1}
          >
            <rect
              x={colX.challenge}
              y={y}
              width={nodeRectWidth}
              height={nodeHeight}
              rx={6}
              fill={`${node.color}18`}
              stroke={node.color}
              strokeWidth={hoveredNode === node.id ? 1.5 : 0.5}
              strokeOpacity={hoveredNode === node.id ? 1 : 0.3}
            />
            <circle cx={colX.challenge + 12} cy={y + nodeHeight / 2} r={3.5} fill={node.color} />
            <text
              x={colX.challenge + 22}
              y={y + nodeHeight / 2 + 3.5}
              fill="white"
              fontSize="8.5"
              fontFamily="Inter"
            >
              {node.label}
            </text>
          </g>
        );
      })}

      {/* Capability nodes */}
      {capabilityNodes.map((node, i) => {
        const y = getY(i);
        const dimmed = hoveredNode && !connectedIds.has(node.id);
        return (
          <g
            key={node.id}
            className="cursor-pointer"
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            opacity={dimmed ? 0.15 : 1}
          >
            <rect
              x={colX.capability}
              y={y}
              width={nodeRectWidth}
              height={nodeHeight}
              rx={6}
              fill={`${node.color}18`}
              stroke={node.color}
              strokeWidth={hoveredNode === node.id ? 1.5 : 0.5}
              strokeOpacity={hoveredNode === node.id ? 1 : 0.3}
            />
            <text
              x={colX.capability + 10}
              y={y + nodeHeight / 2 + 3.5}
              fill="white"
              fontSize="9"
              fontWeight="500"
              fontFamily="Inter"
            >
              {node.label}
            </text>
          </g>
        );
      })}

      {/* Funding nodes */}
      {fundingNodes.map((node, i) => {
        const y = getY(i);
        const dimmed = hoveredNode && !connectedIds.has(node.id);
        return (
          <g
            key={node.id}
            className="cursor-pointer"
            onMouseEnter={() => onHover(node.id)}
            onMouseLeave={() => onHover(null)}
            opacity={dimmed ? 0.15 : 1}
          >
            <rect
              x={colX.funding}
              y={y}
              width={nodeRectWidth}
              height={nodeHeight}
              rx={6}
              fill={`${node.color}18`}
              stroke={node.color}
              strokeWidth={hoveredNode === node.id ? 1.5 : 0.5}
              strokeOpacity={hoveredNode === node.id ? 1 : 0.3}
            />
            <text
              x={colX.funding + 10}
              y={y + nodeHeight / 2 + 3.5}
              fill="white"
              fontSize="8.5"
              fontFamily="Inter"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Main page ----------

export default function AlignmentsPage() {
  const [hoveredFlowNode, setHoveredFlowNode] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const sorted = useMemo(() => [...alignments].sort((a, b) => b.score - a.score), []);

  const avgScore = useMemo(
    () => Math.round(alignments.reduce((s, a) => s + a.score, 0) / alignments.length),
    []
  );

  const totalPipelineValue = useMemo(() => {
    return alignments.reduce((sum, a) => {
      const match = a.estimatedValue.match(/\$(\d+)M/);
      return sum + (match ? parseInt(match[1]) * 1_000_000 : 0);
    }, 0);
  }, []);

  const topSector = useMemo(() => {
    const counts: Record<string, number> = {};
    alignments.forEach((a) => {
      const prob = problems.find((p) => p.id === a.problemId);
      if (prob) counts[prob.sector] = (counts[prob.sector] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, []);

  const handleFlowHover = useCallback((id: string | null) => {
    setHoveredFlowNode(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#FF8200] animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-widest text-[#FF8200]">
                Layer 4: Intelligence Payoff
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">Alignment Engine</h1>
            <p className="text-[#334155] max-w-3xl leading-relaxed mb-4">
              The Alignment Engine is the intelligence core of the platform. It takes the challenges from Layer 1, the capabilities from Layer 2, and the funding programs from Layer 3, and evaluates every viable combination to produce scored opportunity alignments. Each alignment is a specific, actionable triad: one regional challenge, one or more institutional capabilities positioned to address it, and one or more funding programs that could resource the work. These are not hypothetical matches. Each alignment includes a rationale, a proposed partnership structure, an estimated value, a timeline, and identified gaps.
            </p>
            <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 max-w-3xl">
              <p className="text-xs text-[#64748B] leading-relaxed">
                <span className="font-semibold text-[#334155]">Methodology:</span> Alignment scores range from 0 to 100 and are computed from four weighted factors: challenge urgency and scale (30%), which measures how pressing and significant the challenge is; capability readiness and sector fit (25%), which measures how well positioned the proposed team is to respond; funding program fit and award potential (25%), which measures the quality of match between the program and the challenge/capability pair; and partnership maturity and structural feasibility (20%), which measures how realistic the proposed consortium is. Scores of 90 and above indicate high-confidence opportunities where the challenge is urgent, the capability is ready, the funding fits, and partnerships are in place.
              </p>
            </div>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Alignments', value: alignments.length, color: '#FF8200', icon: Zap },
              { label: 'Average Score', value: avgScore, color: getScoreGrade(avgScore).color, icon: Target },
              { label: 'Total Pipeline Value', value: formatCurrency(totalPipelineValue), color: '#10B981', icon: TrendingUp },
              { label: 'Top Sector', value: topSector, color: getSectorColor(topSector as Sector), icon: Sparkles },
            ].map((m) => (
              <div key={m.label} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                    <m.icon size={16} style={{ color: m.color }} />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">{m.label}</span>
                </div>
                <div className="text-2xl font-bold text-[#0F172A]">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Sankey Flow Visualization: navy-card container for dramatic contrast */}
          <div className="navy-card p-5 mb-2 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <Network size={14} className="text-[#FF8200]" />
              <h2 className="text-sm font-semibold text-white">Convergence Flow</h2>
              <span className="text-[10px] text-white/50 ml-2">Hover to explore connections</span>
            </div>
            <SankeyFlow hoveredNode={hoveredFlowNode} onHover={handleFlowHover} />
          </div>
        </div>
      </section>

      {/* Alignment Detail Cards */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Alignment Details</h2>
            <p className="text-xs text-[#64748B]">Sorted by alignment score, highest first</p>
          </div>
          <div className="text-xs text-[#64748B]">{sorted.length} alignments</div>
        </div>

        <div className="space-y-4">
          {sorted.map((a, idx) => {
            const problem = problems.find((p) => p.id === a.problemId);
            if (!problem) return null;
            const grade = getScoreGrade(a.score);
            const caps = a.capabilityIds.map((id) => capabilities.find((c) => c.id === id)).filter(Boolean);
            const funds = a.fundingIds.map((id) => funding.find((f) => f.id === id)).filter(Boolean);
            const jurs = problem.jurisdictionIds.map((id) => jurisdictions.find((j) => j.id === id)).filter(Boolean);
            const isExpanded = expandedCard === a.id;

            return (
              <div
                key={a.id}
                className="card overflow-hidden fade-in-up"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'backwards' }}
              >
                {/* Score accent bar at top */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${grade.color}, ${grade.color}33)` }} />

                <div className="p-5">
                  {/* Top row: Score + Challenge title + Expand */}
                  <div className="flex items-start gap-4">
                    {/* Score block */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center relative" style={{ backgroundColor: `${grade.color}12` }}>
                      <span className="text-3xl font-bold leading-none" style={{ color: grade.color }}>{a.score}</span>
                      <span className="text-[9px] font-semibold mt-1" style={{ color: grade.color }}>{grade.label}</span>
                      <div className="absolute bottom-1.5 left-2 right-2 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div className="h-full rounded-full score-bar" style={{ width: `${a.score}%`, backgroundColor: grade.color }} />
                      </div>
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${getSectorColor(problem.sector as Sector)}15`,
                            color: getSectorColor(problem.sector as Sector),
                          }}
                        >
                          {problem.sector}
                        </span>
                        <span
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${getUrgencyColor(problem.urgency as Urgency)}15`,
                            color: getUrgencyColor(problem.urgency as Urgency),
                          }}
                        >
                          {problem.urgency}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FF8200]/10 text-[#FF8200] font-semibold">
                          {a.utepRole}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{problem.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Network size={10} />
                          {caps.map((c) => c!.shortName).join(' + ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} />
                          {a.estimatedValue}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {a.timeToSubmission}
                        </span>
                      </div>
                    </div>

                    {/* Expand button */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : a.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-6 space-y-5 fade-in-up">
                      {/* Divider */}
                      <div className="h-px bg-[#E2E8F0]" />

                      {/* Three-column layout for Challenge / Capabilities / Funding */}
                      <div className="grid lg:grid-cols-3 gap-5">
                        {/* CHALLENGE */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-red-50">
                              <AlertTriangle size={12} className="text-red-500" />
                            </div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Challenge</h4>
                          </div>
                          <div className="accent-card border-l-red-500 p-4 space-y-3">
                            <h5 className="text-sm font-semibold text-[#0F172A]">{problem.title}</h5>
                            <p className="text-[11px] text-[#334155] leading-relaxed">{problem.statement}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {jurs.map((j) => (
                                <span key={j!.id} className="text-[9px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                  {j!.name}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
                              <span>Pop. affected: {problem.populationAffected.toLocaleString()}</span>
                              <span>Scale: {problem.estimatedScale}</span>
                            </div>
                          </div>
                        </div>

                        {/* CAPABILITIES */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-50">
                              <Network size={12} className="text-blue-500" />
                            </div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Capabilities</h4>
                          </div>
                          <div className="space-y-2">
                            {caps.map((cap) => {
                              if (!cap) return null;
                              return (
                                <div key={cap.id} className="accent-card border-l-blue-500 p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span
                                      className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                                      style={{
                                        backgroundColor: `${getOrgTypeColor(cap.organizationType)}15`,
                                        color: getOrgTypeColor(cap.organizationType),
                                      }}
                                    >
                                      {getOrgTypeLabel(cap.organizationType)}
                                    </span>
                                    <span className="text-[9px] text-[#64748B]">Tier {cap.tier}</span>
                                  </div>
                                  <h5 className="text-xs font-semibold text-[#0F172A] mb-1">{cap.shortName}</h5>
                                  <p className="text-[10px] text-[#334155] leading-relaxed line-clamp-2">{cap.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {cap.deliverables.slice(0, 3).map((d) => (
                                      <span key={d} className="text-[8px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">{d}</span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* FUNDING */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-green-50">
                              <DollarSign size={12} className="text-green-500" />
                            </div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Funding</h4>
                          </div>
                          <div className="space-y-2">
                            {funds.map((fund) => {
                              if (!fund) return null;
                              return (
                                <div key={fund.id} className="accent-card border-l-green-500 p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span
                                      className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                                      style={{
                                        backgroundColor: `${getSourceLevelColor(fund.sourceLevel as FundingSourceLevel)}15`,
                                        color: getSourceLevelColor(fund.sourceLevel as FundingSourceLevel),
                                      }}
                                    >
                                      {fund.sourceLevel}
                                    </span>
                                    <span className="text-[9px] text-[#64748B]">{fund.cycle}</span>
                                  </div>
                                  <h5 className="text-xs font-semibold text-[#0F172A] mb-1">{fund.name}</h5>
                                  <div className="text-[10px] text-[#64748B] mb-1">{fund.agency}</div>
                                  <div className="flex items-center gap-1 text-[10px]">
                                    <DollarSign size={9} className="text-green-500" />
                                    <span className="text-[#0F172A] font-medium">
                                      {formatCurrency(fund.awardRangeMin)} to {formatCurrency(fund.awardRangeMax)}
                                    </span>
                                  </div>
                                  {fund.deadline && (
                                    <div className="flex items-center gap-1 text-[9px] text-amber-600 mt-1">
                                      <Clock size={9} />
                                      <span>Deadline: {fund.deadline}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Bottom section: Rationale, Partnership, Gaps, CTA */}
                      <div className="h-px bg-[#E2E8F0]" />

                      <div className="grid lg:grid-cols-2 gap-5">
                        {/* Left: Rationale + Partnership */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Rationale</h4>
                            <p className="text-[11px] text-[#334155] leading-relaxed">{a.rationale}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Partnership Structure</h4>
                            <div className="flex items-start gap-2">
                              <Users size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-[11px] text-[#0F172A]">{a.partnershipStructure}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Stats + Gaps + CTA */}
                        <div className="space-y-4">
                          {/* Quick stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                              <div className="text-[9px] text-[#64748B] uppercase tracking-wider mb-1">Estimated Value</div>
                              <div className="text-sm font-bold text-green-600">{a.estimatedValue}</div>
                            </div>
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                              <div className="text-[9px] text-[#64748B] uppercase tracking-wider mb-1">Time to Submission</div>
                              <div className="text-sm font-bold text-blue-600">{a.timeToSubmission}</div>
                            </div>
                          </div>

                          {/* Gaps / Risks */}
                          {a.gaps.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Gaps and Risks</h4>
                              <div className="space-y-1.5">
                                {a.gaps.map((gap, gi) => (
                                  <div key={gi} className="flex items-start gap-2 text-[11px]">
                                    <AlertTriangle size={10} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-[#334155]">{gap}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CTA Button */}
                          <div className="relative">
                            <button
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FF8200] text-white text-xs font-semibold hover:bg-[#E57400] transition-colors cursor-default shadow-sm"
                              onMouseEnter={() => setShowTooltip(a.id)}
                              onMouseLeave={() => setShowTooltip(null)}
                            >
                              <FileText size={14} />
                              Translate to Project Concept
                              <ArrowRight size={14} />
                            </button>
                            {showTooltip === a.id && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[#0F172A] text-[10px] text-white whitespace-nowrap fade-in-up z-10">
                                Coming in Phase 2
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0F172A]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
