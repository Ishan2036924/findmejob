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
  Brain,
  Database,
  ShieldCheck,
  TestTube2,
  Users,
  Calculator,
  ShoppingCart,
  Truck,
  Briefcase,
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

// 17 active role families + `other` (placeholder, blocked at form level since
// "other" cannot have a rubric). Order mirrors the zod enum grouping.
export const ROLE_FAMILIES: RoleFamilyOption[] = [
  // Tech / engineering
  {
    value: 'swe',
    label: 'Software Engineer',
    description: 'Backend, frontend, full-stack, mobile',
    icon: Code2,
    available: true,
  },
  {
    value: 'ai_ml_engineer',
    label: 'AI / ML Engineer',
    description: 'ML, deep learning, RAG, LLM agents, MLOps',
    icon: Brain,
    available: true,
  },
  {
    value: 'data_ml',
    label: 'Data / Analytics',
    description: 'Data eng, analytics, BI, science',
    icon: BarChart3,
    available: true,
  },
  {
    value: 'devops',
    label: 'DevOps / SRE / Cloud',
    description: 'Infra, platform, reliability, cloud architecture',
    icon: Server,
    available: true,
  },
  {
    value: 'dba',
    label: 'Database Administrator',
    description: 'RDBMS, NoSQL, performance, replication',
    icon: Database,
    available: true,
  },
  {
    value: 'security_engineer',
    label: 'Security Engineer',
    description: 'InfoSec, AppSec, threat modeling, compliance',
    icon: ShieldCheck,
    available: true,
  },
  {
    value: 'qa_engineer',
    label: 'QA / SDET',
    description: 'Manual, automation, performance, security testing',
    icon: TestTube2,
    available: true,
  },
  // Product & Design
  {
    value: 'product',
    label: 'Product Manager',
    description: 'PM, technical PM, growth PM',
    icon: Compass,
    available: true,
  },
  {
    value: 'design',
    label: 'Design',
    description: 'Product, UX, brand, motion, research',
    icon: Palette,
    available: true,
  },
  // Go-to-market
  {
    value: 'sales',
    label: 'Sales',
    description: 'AE, SDR, account management, sales engineering',
    icon: TrendingUp,
    available: true,
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Growth, brand, content, performance',
    icon: Megaphone,
    available: true,
  },
  // Operations / business / back-office
  {
    value: 'ops',
    label: 'Operations',
    description: 'BizOps, ops analyst, GTM ops, project mgmt',
    icon: Settings2,
    available: true,
  },
  {
    value: 'hr',
    label: 'HR / People',
    description: 'Recruiting, HRBP, L&D, People Ops, comp',
    icon: Users,
    available: true,
  },
  {
    value: 'finance',
    label: 'Finance / Accounting',
    description: 'FP&A, controller, audit, treasury, tax',
    icon: Calculator,
    available: true,
  },
  {
    value: 'procurement',
    label: 'Procurement / Sourcing',
    description: 'Strategic sourcing, vendor mgmt, category',
    icon: ShoppingCart,
    available: true,
  },
  {
    value: 'supply_chain',
    label: 'Supply Chain',
    description: 'Logistics, planning, inventory, S&OP',
    icon: Truck,
    available: true,
  },
  {
    value: 'consulting',
    label: 'Consulting',
    description: 'Strategy, ops, tech, transformation consulting',
    icon: Briefcase,
    available: true,
  },
  // Fallback
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
