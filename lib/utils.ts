import type { Sector, Urgency, FundingSourceLevel } from './types';

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export function getSectorColor(sector: Sector): string {
  const colors: Record<Sector, string> = {
    'Infrastructure': '#3B82F6',
    'Water & Environment': '#06B6D4',
    'Workforce Development': '#8B5CF6',
    'Public Health': '#EC4899',
    'Public Safety': '#EF4444',
    'Economic Development': '#F59E0B',
    'Housing': '#F97316',
    'Transportation': '#10B981',
    'Technology & Innovation': '#6366F1',
    'Energy': '#14B8A6',
    'Education': '#A855F7',
    'Governance': '#6B7280',
  };
  return colors[sector] || '#6B7280';
}

export function getUrgencyColor(urgency: Urgency): string {
  const colors: Record<Urgency, string> = {
    'Critical': '#EF4444',
    'High': '#F59E0B',
    'Medium': '#3B82F6',
    'Low': '#6B7280',
  };
  return colors[urgency];
}

export function getSourceLevelColor(level: FundingSourceLevel): string {
  const colors: Record<FundingSourceLevel, string> = {
    'Federal': '#3B82F6',
    'State-TX': '#F59E0B',
    'State-NM': '#10B981',
    'Local': '#8B5CF6',
    'Binational': '#EC4899',
    'Private': '#6B7280',
  };
  return colors[level];
}

export function getScoreGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: '#10B981' };
  if (score >= 80) return { label: 'Strong', color: '#3B82F6' };
  if (score >= 70) return { label: 'Good', color: '#F59E0B' };
  return { label: 'Developing', color: '#6B7280' };
}

export function getOrgTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'utep_center': 'UTEP Center',
    'utep_institute': 'UTEP Institute',
    'national_lab': 'National Laboratory',
    'university': 'University Partner',
    'military': 'Military Installation',
    'defense_contractor': 'Defense Contractor',
    'manufacturer': 'Manufacturer',
    'aerospace': 'Aerospace',
    'economic_dev': 'Economic Development',
    'federal_agency': 'Federal Agency',
    'logistics': 'Logistics',
  };
  return labels[type] || type;
}

export function getOrgTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'utep_center': '#FF8200',
    'utep_institute': '#FF9F40',
    'national_lab': '#06B6D4',
    'university': '#8B5CF6',
    'military': '#EF4444',
    'defense_contractor': '#F43F5E',
    'manufacturer': '#10B981',
    'aerospace': '#6366F1',
    'economic_dev': '#F59E0B',
    'federal_agency': '#3B82F6',
    'logistics': '#14B8A6',
  };
  return colors[type] || '#6B7280';
}
