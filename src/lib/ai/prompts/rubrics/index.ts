import type { RoleFamily } from '../../schemas/profile';
import { SWE_RUBRIC, SWE_RUBRIC_VERSION } from './swe.v1';
import { DATA_ML_RUBRIC, DATA_ML_RUBRIC_VERSION } from './data-ml.v1';

export { SWE_RUBRIC, SWE_RUBRIC_VERSION, DATA_ML_RUBRIC, DATA_ML_RUBRIC_VERSION };

// Slice 1 ships rubrics for swe + data_ml only. Other role families throw on
// runAssessment until later slices add their rubrics.
export const RUBRICS: Partial<Record<RoleFamily, { content: string; version: string }>> = {
  swe: { content: SWE_RUBRIC, version: SWE_RUBRIC_VERSION },
  data_ml: { content: DATA_ML_RUBRIC, version: DATA_ML_RUBRIC_VERSION },
};
