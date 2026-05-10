import type { RoleFamily } from '@/lib/ai/schemas/profile';

/**
 * For each role family, the families a user with that target should ALSO see in
 * their feed. Conservative map — biased toward "obviously related" rather than
 * "anything tech-adjacent". User toggle for broader/narrower adjacency is Tier 2.
 *
 * Always include the user's own family + 'other' (jobs we couldn't classify
 * clearly — surface them rather than drop, in case they're a hidden fit).
 */
export const ROLE_ADJACENCY: Record<RoleFamily, RoleFamily[]> = {
  swe: ['swe', 'ai_ml_engineer', 'devops', 'qa_engineer', 'other'],
  ai_ml_engineer: ['ai_ml_engineer', 'data_ml', 'swe', 'other'],
  data_ml: ['data_ml', 'ai_ml_engineer', 'other'],
  devops: ['devops', 'swe', 'security_engineer', 'dba', 'other'],
  dba: ['dba', 'devops', 'data_ml', 'other'],
  security_engineer: ['security_engineer', 'devops', 'swe', 'other'],
  qa_engineer: ['qa_engineer', 'swe', 'other'],
  product: ['product', 'design', 'other'],
  design: ['design', 'product', 'other'],
  sales: ['sales', 'marketing', 'other'],
  marketing: ['marketing', 'sales', 'other'],
  ops: ['ops', 'consulting', 'other'],
  hr: ['hr', 'ops', 'other'],
  finance: ['finance', 'ops', 'other'],
  procurement: ['procurement', 'supply_chain', 'ops', 'other'],
  supply_chain: ['supply_chain', 'procurement', 'ops', 'other'],
  consulting: ['consulting', 'ops', 'other'],
  other: [], // empty = no filter (user picked 'other' as their target)
};

/**
 * Resolve the family list to filter the feed/scorer by. Empty = no filter.
 */
export function familiesForUser(target: RoleFamily | null | undefined): RoleFamily[] {
  if (!target || target === 'other') return [];
  return ROLE_ADJACENCY[target] ?? ['other'];
}
