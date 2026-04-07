'use client';

import { useState, useEffect, useRef } from 'react';
import jurisdictions from '@/data/jurisdictions.json';
import problems from '@/data/problems.json';
import capabilities from '@/data/capabilities.json';
import funding from '@/data/funding.json';
import alignments from '@/data/alignments.json';

/* ─── Data Counts ─── */
const COUNTS = {
  jurisdictions: jurisdictions.length,
  challenges: problems.length,
  capabilities: capabilities.length,
  funding: funding.length,
  alignments: alignments.length,
};

/* ─── Table of Contents ─── */
const TOC_SECTIONS = [
  { id: 'section-1', number: '1.0', label: 'Platform Purpose and Design Philosophy' },
  { id: 'section-1-1', number: '1.1', label: 'What This Platform Is', indent: true },
  { id: 'section-1-2', number: '1.2', label: 'Why This Exists', indent: true },
  { id: 'section-1-3', number: '1.3', label: 'The Borderplex Context', indent: true },
  { id: 'section-2', number: '2.0', label: 'The Intelligence Framework' },
  { id: 'section-2-1', number: '2.1', label: 'Regional Challenge Registry', indent: true },
  { id: 'section-2-2', number: '2.2', label: 'Capability Atlas', indent: true },
  { id: 'section-2-3', number: '2.3', label: 'Funding Landscape', indent: true },
  { id: 'section-2-4', number: '2.4', label: 'Alignment Engine', indent: true },
  { id: 'section-3', number: '3.0', label: 'Scoring Model' },
  { id: 'section-3-1', number: '3.1', label: 'Challenge Urgency and Scale', indent: true },
  { id: 'section-3-2', number: '3.2', label: 'Capability Readiness', indent: true },
  { id: 'section-3-3', number: '3.3', label: 'Funding Program Fit', indent: true },
  { id: 'section-3-4', number: '3.4', label: 'Partnership Maturity', indent: true },
  { id: 'section-3-5', number: '3.5', label: 'Score Interpretation', indent: true },
  { id: 'section-4', number: '4.0', label: 'Data Sources and Collection' },
  { id: 'section-5', number: '5.0', label: 'Governance and Jurisdiction Model' },
  { id: 'section-6', number: '6.0', label: 'Platform Roadmap' },
];

/* ─── Reusable Card Components ─── */
function NavyCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #041E42 0%, #0A2A5C 100%)',
        color: '#FFFFFF',
        borderRadius: 12,
        padding: '24px 28px',
        margin: '24px 0',
      }}
    >
      {children}
    </div>
  );
}

function AccentCard({
  color = '#FF8200',
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: '20px 24px',
        margin: '20px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #E2E8F0',
        borderLeftColor: color,
        borderLeftWidth: 4,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '24px 28px',
        margin: '24px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG Diagrams ─── */
function IntelligenceFrameworkDiagram() {
  const layers = [
    {
      number: '1',
      name: 'Regional Challenge Registry',
      desc: `${COUNTS.challenges} documented challenges from adopted plans`,
      color: '#EF4444',
      lightBg: '#FEF2F2',
      icon: (
        <g>
          <circle cx="20" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 14l2.5 3 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 28h16M14 32h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ),
    },
    {
      number: '2',
      name: 'Capability Atlas',
      desc: `${COUNTS.capabilities} institutional and partner capabilities`,
      color: '#8B5CF6',
      lightBg: '#F5F3FF',
      icon: (
        <g>
          <rect x="8" y="10" width="24" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 18h12M14 23h8M14 28h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ),
    },
    {
      number: '3',
      name: 'Funding Landscape',
      desc: `${COUNTS.funding} tracked programs across 4 source levels`,
      color: '#10B981',
      lightBg: '#F0FDF4',
      icon: (
        <g>
          <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 14v12M16 18h8M17 26h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ),
    },
    {
      number: '4',
      name: 'Alignment Engine',
      desc: `${COUNTS.alignments} scored, actionable opportunity alignments`,
      color: '#FF8200',
      lightBg: '#FFF7ED',
      icon: (
        <g>
          <path d="M10 14l10 6 10-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 20l10 6 10-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 26l10 6 10-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      ),
    },
  ];

  const boxH = 80;
  const gap = 16;
  const arrowH = 28;
  const totalH = layers.length * boxH + (layers.length - 1) * (gap + arrowH) + 40;

  return (
    <Card style={{ padding: '32px 24px', overflow: 'auto' }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 20 }}>
        4-Layer Intelligence Framework
      </p>
      <svg
        viewBox={`0 0 520 ${totalH}`}
        width="100%"
        style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label="Diagram showing the 4-layer intelligence framework: Challenge Registry, Capability Atlas, Funding Landscape, and Alignment Engine connected by downward arrows."
      >
        {layers.map((layer, i) => {
          const y = 20 + i * (boxH + gap + arrowH);
          return (
            <g key={layer.number}>
              {/* Box */}
              <rect
                x="10"
                y={y}
                width="500"
                height={boxH}
                rx="10"
                fill={layer.lightBg}
                stroke={layer.color}
                strokeWidth="2"
              />
              {/* Layer number badge */}
              <rect x="22" y={y + 12} width="56" height="56" rx="8" fill={layer.color} />
              <text x="50" y={y + 35} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="600">
                LAYER
              </text>
              <text x="50" y={y + 52} textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="700">
                {layer.number}
              </text>
              {/* Icon */}
              <g transform={`translate(${90}, ${y + 16})`} color={layer.color}>
                {layer.icon}
              </g>
              {/* Text */}
              <text x="140" y={y + 34} fill="#0F172A" fontSize="15" fontWeight="700">
                {layer.name}
              </text>
              <text x="140" y={y + 54} fill="#64748B" fontSize="12">
                {layer.desc}
              </text>
              {/* Arrow between layers */}
              {i < layers.length - 1 && (
                <g>
                  <line
                    x1="260"
                    y1={y + boxH + 4}
                    x2="260"
                    y2={y + boxH + gap + arrowH - 4}
                    stroke="#CBD5E1"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  <polygon
                    points={`254,${y + boxH + gap + arrowH - 8} 260,${y + boxH + gap + arrowH - 2} 266,${y + boxH + gap + arrowH - 8}`}
                    fill="#94A3B8"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

function ScoringModelDiagram() {
  const factors = [
    { label: 'Challenge Urgency & Scale', weight: 30, color: '#EF4444' },
    { label: 'Capability Readiness & Fit', weight: 25, color: '#8B5CF6' },
    { label: 'Funding Program Fit', weight: 25, color: '#10B981' },
    { label: 'Partnership Maturity', weight: 20, color: '#FF8200' },
  ];

  const barW = 480;
  const barH = 48;
  const barY = 40;
  let cumX = 20;

  return (
    <Card style={{ padding: '32px 24px', overflow: 'auto' }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 20 }}>
        Alignment Scoring Model (0 to 100)
      </p>
      <svg
        viewBox="0 0 520 200"
        width="100%"
        style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
        role="img"
        aria-label="Horizontal bar chart showing scoring model weights: Challenge Urgency 30%, Capability Readiness 25%, Funding Fit 25%, Partnership Maturity 20%."
      >
        {/* Bar segments */}
        {factors.map((f, i) => {
          const w = (f.weight / 100) * barW;
          const x = cumX;
          cumX += w;
          const isFirst = i === 0;
          const isLast = i === factors.length - 1;
          return (
            <g key={f.label}>
              <rect
                x={x}
                y={barY}
                width={w}
                height={barH}
                rx={isFirst ? 8 : 0}
                ry={isFirst ? 8 : 0}
                fill={f.color}
              />
              {isLast && (
                <rect
                  x={x}
                  y={barY}
                  width={w}
                  height={barH}
                  rx={0}
                  fill={f.color}
                  clipPath="url(#roundRight)"
                />
              )}
              <text
                x={x + w / 2}
                y={barY + barH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="700"
              >
                {f.weight}%
              </text>
            </g>
          );
        })}
        {/* Round ends with overlay rects */}
        <rect x="20" y={barY} width="16" height={barH} rx="8" ry="8" fill={factors[0].color} />
        <rect x={20 + barW - 16} y={barY} width="16" height={barH} rx="8" ry="8" fill={factors[factors.length - 1].color} />

        {/* Legend below */}
        {factors.map((f, i) => {
          const lx = 20 + i * 125;
          const ly = barY + barH + 32;
          return (
            <g key={`legend-${f.label}`}>
              <rect x={lx} y={ly} width="12" height="12" rx="3" fill={f.color} />
              <text x={lx + 18} y={ly + 10} fill="#334155" fontSize="10" fontWeight="500">
                {f.label}
              </text>
              <text x={lx + 18} y={ly + 24} fill="#64748B" fontSize="10">
                {f.weight}% weight
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

/* ─── Section Number ─── */
function SectionNumber({ number }: { number: string }) {
  return (
    <span style={{ color: '#FF8200', fontWeight: 700, marginRight: 10 }}>{number}</span>
  );
}

/* ─── Main Page ─── */
export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState('section-1');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-section-id]');
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute('data-section-id');
          if (id) setActiveSection(id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );
    targets.forEach((t) => observerRef.current?.observe(t));
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.querySelector(`[data-section-id="${id}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #041E42 0%, #0A2A5C 100%)',
          padding: '56px 24px 48px',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#FF8200',
              marginBottom: 12,
            }}
          >
            Borderplex Funding Intelligence Platform
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Methodology and Data Architecture
          </h1>
          <p style={{ fontSize: 15, color: '#94A3B8', marginTop: 12, maxWidth: 640, lineHeight: 1.6 }}>
            A technical reference describing how the platform organizes regional intelligence,
            scores opportunity alignments, and supports decision-making for the UTEP Research
            &amp; Innovation Office.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 24,
              flexWrap: 'wrap',
            }}
          >
            {[
              { n: COUNTS.jurisdictions, l: 'Jurisdictions' },
              { n: COUNTS.challenges, l: 'Challenges' },
              { n: COUNTS.capabilities, l: 'Capabilities' },
              { n: COUNTS.funding, l: 'Funding Programs' },
              { n: COUNTS.alignments, l: 'Alignments' },
            ].map((m) => (
              <div
                key={m.l}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '10px 18px',
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#FF8200' }}>{m.n}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Body: TOC + Content */}
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: 48,
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {/* ─── Desktop Sidebar TOC ─── */}
        <nav
          className="methodology-toc-desktop"
          style={{
            width: 240,
            flexShrink: 0,
            position: 'sticky',
            top: 96,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#64748B',
              marginBottom: 16,
              paddingLeft: 12,
            }}
          >
            Table of Contents
          </p>
          {TOC_SECTIONS.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: isActive ? '#F1F5F9' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #FF8200' : '3px solid transparent',
                  padding: '6px 12px',
                  paddingLeft: s.indent ? 24 : 12,
                  cursor: 'pointer',
                  borderRadius: '0 6px 6px 0',
                  marginBottom: 1,
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    fontSize: s.indent ? 12 : 13,
                    fontWeight: isActive ? 600 : s.indent ? 400 : 500,
                    color: isActive ? '#041E42' : s.indent ? '#64748B' : '#334155',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: '#FF8200', marginRight: 6, fontWeight: 600, fontSize: 11 }}>
                    {s.number}
                  </span>
                  {s.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ─── Mobile TOC ─── */}
        <div
          className="methodology-toc-mobile"
          style={{
            display: 'none',
            position: 'sticky',
            top: 64,
            zIndex: 20,
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 0',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {TOC_SECTIONS.filter((s) => !s.indent).map((s) => {
            const isActive = activeSection === s.id || activeSection.startsWith(s.id.replace('section-', 'section-') );
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'inline-block',
                  background: isActive ? '#041E42' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? 'none' : '1px solid #E2E8F0',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginRight: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.number} {s.label}
              </button>
            );
          })}
        </div>

        {/* ─── Main Content ─── */}
        <article
          style={{
            flex: 1,
            maxWidth: 780,
            paddingTop: 40,
            paddingBottom: 80,
            color: '#0F172A',
            lineHeight: 1.75,
            fontSize: 15,
          }}
        >
          {/* ════════════════════════════════════════════════════════
              SECTION 1.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-1" style={sectionHeadingStyle}>
            <SectionNumber number="1.0" />
            Platform Purpose and Design Philosophy
          </h2>

          {/* 1.1 */}
          <h3 data-section-id="section-1-1" style={subHeadingStyle}>
            <SectionNumber number="1.1" />
            What This Platform Is
          </h3>
          <p style={pStyle}>
            The Borderplex Funding Intelligence Platform is a decision-support system designed for the UTEP Research &amp; Innovation Office. It organizes, analyzes, and presents the information that R&amp;I leadership needs to identify, pursue, and win funded research and service opportunities across the El Paso, Las Cruces, and Ciudad Juarez corridor.
          </p>
          <p style={pStyle}>
            The platform serves a small group of senior decision-makers: the Vice President for Research, the Executive Director of the R&amp;I Office, and their direct reports. It is not a public database or a grant search engine. It is an internal intelligence tool that connects three things that are typically tracked in separate systems: what the region needs, what UTEP can deliver, and where the money is.
          </p>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              Key Definition
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              <strong style={{ color: '#FFFFFF' }}>Decision-Support System:</strong> A platform that organizes information to support human decision-making. It does not make decisions autonomously. Leadership retains full authority over which opportunities to pursue.
            </p>
          </NavyCard>

          {/* 1.2 */}
          <h3 data-section-id="section-1-2" style={subHeadingStyle}>
            <SectionNumber number="1.2" />
            Why This Exists
          </h3>
          <p style={pStyle}>
            University research offices traditionally operate on a reactive model. A federal agency publishes a funding opportunity, faculty become aware of it (often late), and the office scrambles to assemble a competitive response under tight deadlines.
          </p>
          <p style={pStyle}>
            This model has structural challenges. Timelines are compressing: many federal opportunities now require responses within 2 to 6 weeks. Opportunities are increasingly unstructured, arriving as Requests for Information (RFIs), Broad Agency Announcements (BAAs), and agency-level memos before formal Notices of Funding Opportunity (NOFOs) are released. And the most competitive proposals are those where the institution had already built relationships, assembled teams, and aligned its capabilities with the funder&apos;s priorities before the opportunity was announced.
          </p>

          <AccentCard color="#3B82F6">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 6 }}>
              The Core Insight
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              The platform addresses this by reversing the process. Instead of starting with a funding announcement and looking for a match, it starts with regional challenges, maps them to institutional capabilities, and identifies funding programs that align with those combinations. When a new opportunity is announced, the alignment already exists. The proposal development work is pre-positioned.
            </p>
          </AccentCard>

          {/* 1.3 */}
          <h3 data-section-id="section-1-3" style={subHeadingStyle}>
            <SectionNumber number="1.3" />
            The Borderplex Context
          </h3>
          <p style={pStyle}>
            The Borderplex region is a binational metropolitan area of approximately 2.5 million people spanning two U.S. states and one Mexican state. It includes the City of El Paso (pop. 682,000), Ciudad Juarez (pop. 1.5 million), Las Cruces (pop. 111,000), and 10 additional jurisdictions ranging from Horizon City (22,000) to Tornillo (1,800).
          </p>
          <p style={pStyle}>
            This geography creates a unique research positioning. No other R1 university sits at the intersection of the U.S.-Mexico border, two state systems (Texas and New Mexico), multiple federal jurisdictions, and one of the world&apos;s largest manufacturing corridors. The challenges here (water scarcity, border congestion, public health disparities, defense workforce gaps, infrastructure deficits in colonias) are nationally significant and align with multiple federal agency missions.
          </p>
          <p style={pStyle}>
            The platform is designed specifically for this geography. It does not attempt to be a general-purpose tool. Every challenge, capability, and funding program in the system is relevant to this corridor.
          </p>

          {/* ════════════════════════════════════════════════════════
              SECTION 2.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-2" style={{ ...sectionHeadingStyle, marginTop: 56 }}>
            <SectionNumber number="2.0" />
            The Intelligence Framework
          </h2>
          <p style={pStyle}>
            The platform is organized into four layers. Each layer represents a distinct category of information, and the layers build on each other sequentially.
          </p>

          <IntelligenceFrameworkDiagram />

          {/* 2.1 */}
          <h3 data-section-id="section-2-1" style={subHeadingStyle}>
            <SectionNumber number="2.1" />
            Layer 1: Regional Challenge Registry
          </h3>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              Purpose
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              Catalog what the region needs, at a level of specificity that supports federal funding alignment.
            </p>
          </NavyCard>

          <p style={pStyle}>
            The Challenge Registry is the foundation. It contains <strong>{COUNTS.challenges}</strong> documented regional challenges drawn from adopted strategic plans, community needs assessments, and stakeholder engagement. Each challenge is owned by one or more jurisdictions, belongs to a policy sector, and carries an urgency rating.
          </p>

          <AccentCard color="#EF4444">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 10 }}>
              How Challenges Are Identified
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              We conduct a systematic review of the most recent adopted strategic plan from each jurisdiction in the corridor. Adopted plans are used because they represent official, publicly documented priorities that carry political and institutional commitment. We do not invent challenges or rely on anecdotal input.
            </p>
          </AccentCard>

          <p style={pStyle}>
            <strong>How challenges are scoped:</strong> Raw plan language (for example, &quot;improve infrastructure&quot;) is too general for funding alignment. Each challenge is rewritten to a level of specificity that describes: what the problem is, where it occurs, who is affected, and at what scale. For example: &quot;47 miles of unpaved roads in unincorporated eastern El Paso County serving 12,000 residents with no current capital improvement plan.&quot;
          </p>
          <p style={pStyle}>
            <strong>How challenges are evaluated:</strong> Each challenge is assessed against five criteria: (1) population impact, (2) estimated financial scale, (3) urgency as expressed by the adopting authority, (4) number of aligned federal agencies, and (5) number of jurisdictions affected. These criteria determine the urgency rating (Critical, High, Medium, Low) and the challenge&apos;s priority in alignment scoring.
          </p>

          <AccentCard color="#F59E0B">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 6 }}>
              Why This Matters for Decision-Makers
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              The registry gives R&amp;I leadership a structured view of what the region&apos;s governments have formally identified as priorities. When a faculty member proposes a research direction, leadership can quickly assess whether it aligns with documented regional needs. When a funder asks &quot;what are the region&apos;s priorities,&quot; this is the authoritative answer.
            </p>
          </AccentCard>

          {/* 2.2 */}
          <h3 data-section-id="section-2-2" style={subHeadingStyle}>
            <SectionNumber number="2.2" />
            Layer 2: Capability Atlas
          </h3>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              Purpose
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              Map what UTEP and its partner network can actually deploy in response to regional challenges.
            </p>
          </NavyCard>

          <p style={pStyle}>
            The Capability Atlas contains <strong>{COUNTS.capabilities}</strong> institutional capability entries organized into two tiers. Tier A includes UTEP&apos;s internal research centers, institutes, and core facilities. Tier B includes the external partner network: national laboratories (Sandia, Los Alamos), universities (NMSU, UNM), military installations (Fort Bliss, White Sands Missile Range), defense contractors (Raytheon, Lockheed Martin), and manufacturers (Foxconn, Flex, BRP, Bosch in Ciudad Juarez).
          </p>
          <p style={pStyle}>
            <strong>How capabilities are cataloged:</strong> Each entry describes what the unit can deliver, not just what it is. A center listing includes: deliverable types (research, workforce training, testing and prototyping, technical assistance, policy analysis, convening, data and analytics, contract R&amp;D, or commercialization), sector alignment, and a readiness assessment.
          </p>

          <AccentCard color="#8B5CF6">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 10 }}>
              The Readiness Model
            </p>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                Capabilities are assessed on a three-tier readiness scale:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li style={{ marginBottom: 6 }}>
                  <strong>Rapid Deploy (under 30 days):</strong> The capability can be mobilized for a proposal or project within a month. Existing staff, equipment, and relationships are already in place.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Ready (30 to 90 days):</strong> The capability exists but requires some preparation, such as hiring, procurement, or partnership formalization.
                </li>
                <li>
                  <strong>Extended (90 to 180 days):</strong> The capability requires significant preparation, often involving new agreements, facility access, or security clearance processes.
                </li>
              </ul>
            </div>
          </AccentCard>

          <AccentCard color="#F59E0B">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 6 }}>
              Why This Matters for Decision-Makers
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              The Atlas answers the question &quot;what can we actually do?&quot; with specificity. When an opportunity requires additive manufacturing for defense applications, leadership can immediately see that the Keck Center has Rapid Deploy readiness with relevant MIL-SPEC testing capability. When a proposal requires a binational research component, leadership can see which partners have existing relationships and at what readiness level.
            </p>
          </AccentCard>

          {/* 2.3 */}
          <h3 data-section-id="section-2-3" style={subHeadingStyle}>
            <SectionNumber number="2.3" />
            Layer 3: Funding Landscape
          </h3>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              Purpose
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              Track the full universe of federal, state, and binational funding relevant to the Borderplex region.
            </p>
          </NavyCard>

          <p style={pStyle}>
            The Funding Landscape currently tracks <strong>{COUNTS.funding}</strong> programs across four source levels: Federal, State of Texas, State of New Mexico, and Binational.
          </p>
          <p style={pStyle}>
            <strong>Data sources:</strong> Federal programs are identified through SAM.gov, Grants.gov, and direct monitoring of agency strategic plans and budget justifications. Texas state programs are tracked through the Texas Higher Education Coordinating Board, the Governor&apos;s Office, and CPRIT. New Mexico programs are monitored through the Economic Development Department and Environment Department. Binational programs are tracked through the North American Development Bank (NADB) and the Border Environment Cooperation Commission (BECC).
          </p>
          <p style={pStyle}>
            <strong>How programs are structured:</strong> Each funding program entry includes the administering agency, source level, sector alignment, award range, eligibility requirements (who can apply and under what conditions), cycle type (annual, rolling, signal-driven, one-time, or biennial), and deadlines when applicable.
          </p>

          <AccentCard color="#10B981">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 10 }}>
              Eligibility Mapping
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              Not all jurisdictions qualify for all programs. USDA Rural Development grants require communities under 10,000 population, which means Tornillo and Fabens qualify but El Paso does not. State of Texas programs are only available to Texas-based entities, excluding NMSU from direct participation. The platform tracks these distinctions so that leadership does not pursue misaligned opportunities.
            </p>
          </AccentCard>

          <AccentCard color="#F59E0B">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 6 }}>
              Why This Matters for Decision-Makers
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              The Landscape gives a complete picture of where funding is available, at what scale, and under what conditions. It prevents the common failure mode of discovering a relevant program after its deadline has passed or pursuing a program for which the institution is not eligible.
            </p>
          </AccentCard>

          {/* 2.4 */}
          <h3 data-section-id="section-2-4" style={subHeadingStyle}>
            <SectionNumber number="2.4" />
            Layer 4: Alignment Engine
          </h3>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              Purpose
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              Connect challenges, capabilities, and funding into scored, actionable opportunity alignments.
            </p>
          </NavyCard>

          <p style={pStyle}>
            The Alignment Engine is where the other three layers converge. It produces <strong>{COUNTS.alignments}</strong> alignments, each representing a specific triad: one regional challenge + one or more institutional capabilities + one or more funding programs.
          </p>
          <p style={pStyle}>
            <strong>How alignments are generated:</strong> The engine evaluates all possible combinations of challenges, capabilities, and funding programs. Combinations that share sector alignment and meet eligibility requirements are retained. Those that do not are discarded. The retained combinations are then scored.
          </p>
          <p style={pStyle}>
            This is the section covered in detail in Section 3.0 below.
          </p>

          {/* ════════════════════════════════════════════════════════
              SECTION 3.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-3" style={{ ...sectionHeadingStyle, marginTop: 56 }}>
            <SectionNumber number="3.0" />
            Scoring Model
          </h2>
          <p style={pStyle}>
            Alignment scores range from 0 to 100 and are computed from four weighted factors.
          </p>

          <ScoringModelDiagram />

          {/* 3.1 */}
          <h3 data-section-id="section-3-1" style={subHeadingStyle}>
            <SectionNumber number="3.1" />
            Challenge Urgency and Scale (30% weight)
          </h3>
          <p style={pStyle}>
            This factor measures how pressing and significant the challenge is. Sub-criteria include: the urgency rating assigned by the adopting jurisdiction (Critical, High, Medium, Low), the population affected, the estimated financial scale of the problem, and the number of federal agencies whose missions align with this challenge.
          </p>
          <p style={pStyle}>
            Challenges rated &quot;Critical&quot; by their adopting jurisdiction and affecting populations above 100,000 receive the highest scores on this factor. Challenges rated &quot;Low&quot; affecting small populations score lowest.
          </p>

          {/* 3.2 */}
          <h3 data-section-id="section-3-2" style={subHeadingStyle}>
            <SectionNumber number="3.2" />
            Capability Readiness and Sector Fit (25% weight)
          </h3>
          <p style={pStyle}>
            This factor measures how well-positioned the proposed capability combination is to respond. Sub-criteria include: readiness tier (Rapid Deploy scores highest), the degree of sector overlap between the capability and the challenge, whether the capability has delivered on similar challenges before, and the number of deliverable types the capability can provide.
          </p>
          <p style={pStyle}>
            A Tier A UTEP center with Rapid Deploy readiness and direct sector alignment scores highest. A Tier B partner with Extended readiness and partial sector overlap scores lower.
          </p>

          {/* 3.3 */}
          <h3 data-section-id="section-3-3" style={subHeadingStyle}>
            <SectionNumber number="3.3" />
            Funding Program Fit and Award Potential (25% weight)
          </h3>
          <p style={pStyle}>
            This factor measures how well the funding program matches the challenge and capability combination. Sub-criteria include: sector alignment between the program and the challenge, award size relative to the estimated scale of the challenge, eligibility match (can the proposed lead applicant actually apply?), and cycle timing (is there a near-term deadline or rolling opportunity?).
          </p>
          <p style={pStyle}>
            Programs with direct sector match, appropriate award scale, confirmed eligibility, and near-term deadlines score highest. Programs with partial sector overlap or distant timelines score lower.
          </p>

          {/* 3.4 */}
          <h3 data-section-id="section-3-4" style={subHeadingStyle}>
            <SectionNumber number="3.4" />
            Partnership Maturity and Structural Feasibility (20% weight)
          </h3>
          <p style={pStyle}>
            This factor measures how realistic the proposed partnership is. Sub-criteria include: whether formal agreements (MOUs, MSAs) exist between the proposed partners, whether the partners have collaborated before, whether the proposed UTEP role (Lead PI, Co-PI, Convener, Technical Assistance) is appropriate for the funding mechanism, and whether identified gaps (missing data, needed agreements, clearance requirements) are addressable within the submission timeline.
          </p>
          <p style={pStyle}>
            Partnerships with existing agreements and prior collaboration history score highest. Novel partnerships with no existing relationship and significant structural barriers score lowest.
          </p>

          {/* 3.5 */}
          <h3 data-section-id="section-3-5" style={subHeadingStyle}>
            <SectionNumber number="3.5" />
            Score Interpretation
          </h3>
          <p style={pStyle}>
            Scores are interpreted on a four-tier scale:
          </p>
          <div style={{ display: 'grid', gap: 12, margin: '20px 0' }}>
            {[
              { range: '90 to 100', label: 'Excellent', color: '#10B981', desc: 'High-confidence opportunity. The challenge is urgent, the capability is ready, the funding fits, and the partnership is mature. These should be pursued immediately.' },
              { range: '80 to 89', label: 'Strong', color: '#3B82F6', desc: 'Solid opportunity with one or two factors that need attention. Typically the partnership needs formalization or the funding timeline requires acceleration.' },
              { range: '70 to 79', label: 'Good', color: '#F59E0B', desc: 'Viable opportunity that requires development work. Often the capability combination needs strengthening or the funding program fit is partial.' },
              { range: 'Below 70', label: 'Developing', color: '#6B7280', desc: 'Early-stage opportunity. The alignment exists but significant work is needed to make it competitive.' },
            ].map((tier) => (
              <div
                key={tier.label}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${tier.color}`,
                  borderRadius: 10,
                  padding: '16px 20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      background: tier.color,
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: 4,
                    }}
                  >
                    {tier.range}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{tier.label}</span>
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.6 }}>{tier.desc}</p>
              </div>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════
              SECTION 4.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-4" style={{ ...sectionHeadingStyle, marginTop: 56 }}>
            <SectionNumber number="4.0" />
            Data Sources and Collection
          </h2>

          <h3 style={subHeadingStyle}>
            4.1 Strategic Plans Reviewed
          </h3>
          <p style={pStyle}>
            The platform draws on adopted strategic plans from the following jurisdictions:
          </p>
          <AccentCard color="#3B82F6">
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>City of El Paso FY2027-2028 Strategic Plan</li>
                <li>City of Las Cruces Strategic Plan 2021-2026</li>
                <li>El Paso County Strategic Plan</li>
                <li>Dona Ana County Comprehensive Plan</li>
                <li>Remaining jurisdictions: community plans, needs assessments, or no formal published plans (in which case publicly available data and regional planning documents are used)</li>
              </ul>
            </div>
          </AccentCard>

          <h3 style={subHeadingStyle}>
            4.2 Institutional Data
          </h3>
          <p style={pStyle}>
            UTEP capability data is drawn from: the Office of Research and Sponsored Projects directory, individual center and institute websites, faculty expertise profiles maintained by colleges, and direct engagement with center directors conducted through the Office of Regional Innovation and Partnerships during FY2025.
          </p>
          <p style={pStyle}>
            Partner network data is drawn from: existing partnership agreements, engagement records from 50+ stakeholder meetings conducted in FY2025, defense contractor and manufacturer publicly available information, and national laboratory collaboration program descriptions.
          </p>

          <h3 style={subHeadingStyle}>
            4.3 Funding Data
          </h3>
          <p style={pStyle}>
            Federal funding programs are monitored through: SAM.gov (the official federal procurement and award database), Grants.gov (the federal grant announcement portal), individual agency websites (NSF, DOE, DOD, DOT, EPA, HHS, HUD, EDA, NASA, USDA), and congressional appropriations documents.
          </p>
          <p style={pStyle}>
            State funding programs are monitored through: Texas Higher Education Coordinating Board publications, the Governor&apos;s Office of Economic Development, CPRIT program announcements, the New Mexico Economic Development Department, and state legislature appropriation reports.
          </p>
          <p style={pStyle}>
            Binational funding is monitored through: the North American Development Bank (NADB) project pipeline, the Border Environment Cooperation Commission (BECC) certification process, and EPA Border 2025 program updates.
          </p>

          {/* ════════════════════════════════════════════════════════
              SECTION 5.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-5" style={{ ...sectionHeadingStyle, marginTop: 56 }}>
            <SectionNumber number="5.0" />
            Governance and Jurisdiction Model
          </h2>

          <h3 style={subHeadingStyle}>
            5.1 What Jurisdiction Ownership Means
          </h3>
          <p style={pStyle}>
            In this platform, every challenge is &quot;owned&quot; by one or more jurisdictions. Ownership means the jurisdiction has formally identified the challenge in an adopted plan, needs assessment, or official policy document. UTEP does not own challenges. UTEP provides capabilities to address challenges that jurisdictions have identified.
          </p>
          <p style={pStyle}>
            This distinction matters because it determines who leads. When UTEP proposes a project to a funder, the regional challenge provides the justification. The jurisdiction&apos;s adoption of that challenge provides the political and institutional credibility. UTEP&apos;s capability provides the research response. The funding program provides the resources.
          </p>

          <h3 style={subHeadingStyle}>
            5.2 Governance Tiers
          </h3>
          <p style={pStyle}>
            The Borderplex corridor includes four distinct governance tiers, each with different authorities, funding eligibility, and planning capacity:
          </p>

          <div style={{ display: 'grid', gap: 12, margin: '20px 0' }}>
            {[
              {
                tier: 'Tier 1',
                title: 'Incorporated Cities',
                color: '#3B82F6',
                examples: 'El Paso, Las Cruces, Socorro, Horizon City, San Elizario, Anthony TX, Anthony NM',
                desc: 'These have elected governments, adopted plans, procurement authority, and direct eligibility for most federal programs.',
              },
              {
                tier: 'Tier 2',
                title: 'Counties',
                color: '#8B5CF6',
                examples: 'El Paso County, Dona Ana County',
                desc: 'These have broader geographic scope, cover unincorporated areas, and often administer programs for communities that lack municipal capacity.',
              },
              {
                tier: 'Tier 3',
                title: 'Colonias and Census-Designated Places',
                color: '#F59E0B',
                examples: 'Tornillo, Fabens, Vado',
                desc: 'These have limited or no governance structure, no independent procurement authority, and depend on county or special district services. They qualify for specific federal programs (USDA Rural, HUD CDBG for colonias) that larger cities do not.',
              },
              {
                tier: 'Tier 4',
                title: 'Binational',
                color: '#10B981',
                examples: 'Ciudad Juarez, State of Chihuahua',
                desc: 'These operate under a completely different legal and funding framework. U.S. federal grants generally do not flow directly to Mexican entities, but binational programs (NADB, BECC, EPA Border programs) and cross-border research collaborations create legitimate pathways.',
              },
            ].map((t) => (
              <div
                key={t.tier}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${t.color}`,
                  borderRadius: 10,
                  padding: '18px 22px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      background: t.color,
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.tier}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{t.title}</span>
                </div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 8px', fontStyle: 'italic' }}>
                  {t.examples}
                </p>
                <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={subHeadingStyle}>
            5.3 Cross-Jurisdictional Challenges
          </h3>
          <p style={pStyle}>
            Many regional challenges span multiple jurisdictions. Water scarcity affects El Paso, Ciudad Juarez, and Dona Ana County simultaneously. Workforce misalignment spans the entire corridor. Transportation congestion is binational.
          </p>

          <AccentCard color="#FF8200">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#041E42', marginBottom: 6 }}>
              Strategic Value of Cross-Jurisdictional Challenges
            </p>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.7 }}>
              Cross-jurisdictional challenges are particularly valuable for funding because they demonstrate regional coordination, which is a selection criterion for programs like NSF Regional Innovation Engines and EDA Tech Hubs. The platform tracks jurisdiction overlap explicitly so that R&amp;I leadership can identify challenges with the broadest coalition potential.
            </p>
          </AccentCard>

          {/* ════════════════════════════════════════════════════════
              SECTION 6.0
             ════════════════════════════════════════════════════════ */}
          <h2 data-section-id="section-6" style={{ ...sectionHeadingStyle, marginTop: 56 }}>
            <SectionNumber number="6.0" />
            Platform Roadmap
          </h2>

          <h3 style={subHeadingStyle}>
            6.1 Current State: Intelligence Layer (Live)
          </h3>
          <p style={pStyle}>
            The current platform delivers the intelligence layer: the ability to see, filter, and analyze the full landscape of regional challenges, institutional capabilities, funding programs, and their alignments. This is a read-only analytical tool. It does not automate proposal writing, manage relationships, or track project implementation.
          </p>

          <h3 style={subHeadingStyle}>
            6.2 Next Phase: Operational Layer (Planned)
          </h3>
          <p style={pStyle}>
            The next development phase will add operational capabilities. This includes: translating alignments into structured project concepts with generated briefs; tracking those concepts through a business development pipeline (concept, internal review, partner recruitment, proposal development, submission, under review, awarded or declined); managing partner relationships and engagement history; and generating reports for leadership review.
          </p>

          <h3 style={subHeadingStyle}>
            6.3 Future Vision
          </h3>
          <p style={pStyle}>
            The long-term vision includes: live API connections to SAM.gov and Grants.gov for automated funding signal detection; integration with UTEP&apos;s Salesforce CRM for relationship tracking; AI-assisted concept brief generation from alignment data; and impact tracking that closes the loop from funded project back to regional challenge addressed.
          </p>

          <NavyCard>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FF8200', marginBottom: 8 }}>
              About This Platform
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: '#E2E8F0' }}>
              The Borderplex Funding Intelligence Platform is hosted by the UTEP Research &amp; Innovation Office (R&amp;I) and powered by AAII (UTEP Institute for Applied AI Innovation). For questions about the methodology described in this document, contact the R&amp;I Office.
            </p>
          </NavyCard>
        </article>
      </div>

      {/* ─── Responsive Styles ─── */}
      <style>{`
        .methodology-toc-desktop {
          display: block;
        }
        .methodology-toc-mobile {
          display: none !important;
        }
        @media (max-width: 900px) {
          .methodology-toc-desktop {
            display: none !important;
          }
          .methodology-toc-mobile {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Shared Styles ─── */
const sectionHeadingStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: '#0F172A',
  marginBottom: 16,
  marginTop: 40,
  paddingBottom: 12,
  borderBottom: '2px solid #E2E8F0',
  lineHeight: 1.3,
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#0F172A',
  marginTop: 32,
  marginBottom: 12,
  lineHeight: 1.4,
};

const pStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.75,
  color: '#334155',
  marginBottom: 16,
};
