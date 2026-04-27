import {
  Code2,
  BarChart3,
  Compass,
  Palette,
  Server,
  TrendingUp,
  Megaphone,
  Settings2,
  CircleDashed,
  type LucideIcon,
} from 'lucide-react';
import type { RoleFamily, Seniority } from '@/lib/ai/schemas/profile';

export type RoleFamilyOption = {
  value: RoleFamily;
  label: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
};

// Slice 1 ships rubrics for swe + data_ml only. The rest are listed for visual
// completeness; selecting a non-available option is blocked at the form level.
export const ROLE_FAMILIES: RoleFamilyOption[] = [
  {
    value: 'swe',
    label: 'Software Engineer',
    description: 'Backend, frontend, full-stack, mobile',
    icon: Code2,
    available: true,
  },
  {
    value: 'data_ml',
    label: 'Data / ML',
    description: 'Data eng, ML eng, analytics, science',
    icon: BarChart3,
    available: true,
  },
  {
    value: 'product',
    label: 'Product',
    description: 'PM, technical PM, growth PM',
    icon: Compass,
    available: false,
  },
  {
    value: 'design',
    label: 'Design',
    description: 'Product, UX, brand, motion',
    icon: Palette,
    available: false,
  },
  {
    value: 'devops',
    label: 'DevOps / SRE',
    description: 'Infra, platform, reliability',
    icon: Server,
    available: false,
  },
  {
    value: 'sales',
    label: 'Sales',
    description: 'AE, SDR, account management',
    icon: TrendingUp,
    available: false,
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Growth, brand, content, perf',
    icon: Megaphone,
    available: false,
  },
  {
    value: 'ops',
    label: 'Operations',
    description: 'BizOps, ops analyst, GTM ops',
    icon: Settings2,
    available: false,
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Tell us what you do',
    icon: CircleDashed,
    available: false,
  },
];

export const SENIORITY_OPTIONS: Array<{ value: Seniority; label: string; hint: string }> = [
  { value: 'intern', label: 'Intern', hint: 'Currently studying or fresh grad' },
  { value: 'entry', label: 'Entry', hint: '0–2 years experience' },
  { value: 'mid', label: 'Mid', hint: '2–5 years' },
  { value: 'senior', label: 'Senior', hint: '5–8 years' },
  { value: 'staff', label: 'Staff+', hint: '8+ years, lead-level scope' },
];
