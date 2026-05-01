import type { RoleFamily } from '../../schemas/profile';
import { SWE_RUBRIC, SWE_RUBRIC_VERSION } from './swe.v1';
import { DATA_ML_RUBRIC, DATA_ML_RUBRIC_VERSION } from './data-ml.v1';
import {
  AI_ML_ENGINEER_RUBRIC,
  AI_ML_ENGINEER_RUBRIC_VERSION,
} from './ai-ml-engineer.v1';
import { DEVOPS_RUBRIC, DEVOPS_RUBRIC_VERSION } from './devops.v1';
import { DBA_RUBRIC, DBA_RUBRIC_VERSION } from './dba.v1';
import {
  SECURITY_ENGINEER_RUBRIC,
  SECURITY_ENGINEER_RUBRIC_VERSION,
} from './security-engineer.v1';
import {
  QA_ENGINEER_RUBRIC,
  QA_ENGINEER_RUBRIC_VERSION,
} from './qa-engineer.v1';
import { PRODUCT_RUBRIC, PRODUCT_RUBRIC_VERSION } from './product.v1';
import { DESIGN_RUBRIC, DESIGN_RUBRIC_VERSION } from './design.v1';
import { SALES_RUBRIC, SALES_RUBRIC_VERSION } from './sales.v1';
import { MARKETING_RUBRIC, MARKETING_RUBRIC_VERSION } from './marketing.v1';
import { OPS_RUBRIC, OPS_RUBRIC_VERSION } from './ops.v1';
import { HR_RUBRIC, HR_RUBRIC_VERSION } from './hr.v1';
import { FINANCE_RUBRIC, FINANCE_RUBRIC_VERSION } from './finance.v1';
import {
  PROCUREMENT_RUBRIC,
  PROCUREMENT_RUBRIC_VERSION,
} from './procurement.v1';
import {
  SUPPLY_CHAIN_RUBRIC,
  SUPPLY_CHAIN_RUBRIC_VERSION,
} from './supply-chain.v1';
import { CONSULTING_RUBRIC, CONSULTING_RUBRIC_VERSION } from './consulting.v1';

export {
  SWE_RUBRIC,
  SWE_RUBRIC_VERSION,
  DATA_ML_RUBRIC,
  DATA_ML_RUBRIC_VERSION,
  AI_ML_ENGINEER_RUBRIC,
  AI_ML_ENGINEER_RUBRIC_VERSION,
  DEVOPS_RUBRIC,
  DEVOPS_RUBRIC_VERSION,
  DBA_RUBRIC,
  DBA_RUBRIC_VERSION,
  SECURITY_ENGINEER_RUBRIC,
  SECURITY_ENGINEER_RUBRIC_VERSION,
  QA_ENGINEER_RUBRIC,
  QA_ENGINEER_RUBRIC_VERSION,
  PRODUCT_RUBRIC,
  PRODUCT_RUBRIC_VERSION,
  DESIGN_RUBRIC,
  DESIGN_RUBRIC_VERSION,
  SALES_RUBRIC,
  SALES_RUBRIC_VERSION,
  MARKETING_RUBRIC,
  MARKETING_RUBRIC_VERSION,
  OPS_RUBRIC,
  OPS_RUBRIC_VERSION,
  HR_RUBRIC,
  HR_RUBRIC_VERSION,
  FINANCE_RUBRIC,
  FINANCE_RUBRIC_VERSION,
  PROCUREMENT_RUBRIC,
  PROCUREMENT_RUBRIC_VERSION,
  SUPPLY_CHAIN_RUBRIC,
  SUPPLY_CHAIN_RUBRIC_VERSION,
  CONSULTING_RUBRIC,
  CONSULTING_RUBRIC_VERSION,
};

// Every concrete role family ships with a rubric. Only `other` is excluded —
// it's a fallback for "tell us what you do" and can't be scored uniformly.
export const RUBRICS: Record<
  Exclude<RoleFamily, 'other'>,
  { content: string; version: string }
> = {
  swe: { content: SWE_RUBRIC, version: SWE_RUBRIC_VERSION },
  ai_ml_engineer: {
    content: AI_ML_ENGINEER_RUBRIC,
    version: AI_ML_ENGINEER_RUBRIC_VERSION,
  },
  data_ml: { content: DATA_ML_RUBRIC, version: DATA_ML_RUBRIC_VERSION },
  devops: { content: DEVOPS_RUBRIC, version: DEVOPS_RUBRIC_VERSION },
  dba: { content: DBA_RUBRIC, version: DBA_RUBRIC_VERSION },
  security_engineer: {
    content: SECURITY_ENGINEER_RUBRIC,
    version: SECURITY_ENGINEER_RUBRIC_VERSION,
  },
  qa_engineer: {
    content: QA_ENGINEER_RUBRIC,
    version: QA_ENGINEER_RUBRIC_VERSION,
  },
  product: { content: PRODUCT_RUBRIC, version: PRODUCT_RUBRIC_VERSION },
  design: { content: DESIGN_RUBRIC, version: DESIGN_RUBRIC_VERSION },
  sales: { content: SALES_RUBRIC, version: SALES_RUBRIC_VERSION },
  marketing: { content: MARKETING_RUBRIC, version: MARKETING_RUBRIC_VERSION },
  ops: { content: OPS_RUBRIC, version: OPS_RUBRIC_VERSION },
  hr: { content: HR_RUBRIC, version: HR_RUBRIC_VERSION },
  finance: { content: FINANCE_RUBRIC, version: FINANCE_RUBRIC_VERSION },
  procurement: {
    content: PROCUREMENT_RUBRIC,
    version: PROCUREMENT_RUBRIC_VERSION,
  },
  supply_chain: {
    content: SUPPLY_CHAIN_RUBRIC,
    version: SUPPLY_CHAIN_RUBRIC_VERSION,
  },
  consulting: {
    content: CONSULTING_RUBRIC,
    version: CONSULTING_RUBRIC_VERSION,
  },
};

/**
 * Compact form of a rubric for chat / agent contexts where the full rubric
 * (with gap detection patterns + strength signals) is too long. Returns just
 * the role label + dimension list. Returns null if no rubric is available
 * (e.g., role_family = 'other').
 */
export function getRubricSummary(family: RoleFamily | null | undefined): string | null {
  if (!family || family === 'other') return null;
  const rubric = RUBRICS[family];
  if (!rubric) return null;

  // Pull the heading line and the DIMENSIONS section only.
  const lines = rubric.content.split('\n');
  const headingLine = lines.find((l) => l.startsWith('## RUBRIC:')) ?? '';
  const versionLine = lines.find((l) => l.startsWith('Version:')) ?? '';

  const dimsStart = lines.findIndex((l) => l.startsWith('### DIMENSIONS'));
  const dimsEnd = lines.findIndex(
    (l, i) => i > dimsStart && l.startsWith('### '),
  );
  const dimensionLines =
    dimsStart >= 0
      ? lines.slice(dimsStart, dimsEnd > 0 ? dimsEnd : lines.length)
      : [];

  return [headingLine, versionLine, '', ...dimensionLines]
    .join('\n')
    .trim();
}
