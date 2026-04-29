import type { ResumeJson } from '@/lib/ai/schemas/profile';
import type { EditOp, TailorOutput } from '@/lib/ai/schemas/tailor';

/** Deep clone via structuredClone (Node 18+). Pure JS — no infra deps. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

export type ApplyResult = {
  resume: ResumeJson;
  applied: number;
  skipped: { op: EditOp; reason: string }[];
};

/**
 * Apply tailor edit_ops to a base resume_json deterministically.
 *
 * Conservative: out-of-bounds indices, unknown sections, or missing fields are
 * recorded in `skipped` with a reason rather than throwing. Caller can log
 * skipped ops for prompt iteration without breaking the flow.
 */
export function applyEditOps(base: ResumeJson, ops: EditOp[]): ApplyResult {
  const resume = clone(base);
  const skipped: { op: EditOp; reason: string }[] = [];
  let applied = 0;

  for (const op of ops) {
    try {
      switch (op.section) {
        case 'summary': {
          if (op.field === 'summary') {
            resume.summary = op.new_value;
            applied++;
          } else {
            skipped.push({ op, reason: `unsupported field on 'summary': ${op.field}` });
          }
          break;
        }

        case 'experience': {
          if (op.index === null) {
            skipped.push({ op, reason: "experience op missing 'index'" });
            break;
          }
          const item = resume.experience[op.index];
          if (!item) {
            skipped.push({ op, reason: `experience[${op.index}] out of bounds` });
            break;
          }
          if (op.field === 'title') {
            item.title = op.new_value;
            applied++;
          } else if (op.field === 'bullet') {
            if (op.bullet_index === null) {
              skipped.push({ op, reason: "experience.bullet op missing 'bullet_index'" });
              break;
            }
            if (op.bullet_index < 0 || op.bullet_index > item.bullets.length) {
              skipped.push({
                op,
                reason: `bullet_index ${op.bullet_index} out of range for experience[${op.index}]`,
              });
              break;
            }
            // Inserting at bullets.length is allowed (append)
            if (op.bullet_index === item.bullets.length) {
              item.bullets.push(op.new_value);
            } else {
              item.bullets[op.bullet_index] = op.new_value;
            }
            applied++;
          } else {
            skipped.push({ op, reason: `unsupported field on 'experience': ${op.field}` });
          }
          break;
        }

        case 'projects': {
          if (op.index === null) {
            skipped.push({ op, reason: "projects op missing 'index'" });
            break;
          }
          const item = resume.projects[op.index];
          if (!item) {
            skipped.push({ op, reason: `projects[${op.index}] out of bounds` });
            break;
          }
          if (op.field === 'title') {
            item.name = op.new_value;
            applied++;
          } else if (op.field === 'bullet') {
            if (op.bullet_index === null) {
              skipped.push({ op, reason: "projects.bullet op missing 'bullet_index'" });
              break;
            }
            if (op.bullet_index < 0 || op.bullet_index > item.bullets.length) {
              skipped.push({
                op,
                reason: `bullet_index ${op.bullet_index} out of range for projects[${op.index}]`,
              });
              break;
            }
            if (op.bullet_index === item.bullets.length) {
              item.bullets.push(op.new_value);
            } else {
              item.bullets[op.bullet_index] = op.new_value;
            }
            applied++;
          } else {
            skipped.push({ op, reason: `unsupported field on 'projects': ${op.field}` });
          }
          break;
        }

        case 'skills': {
          if (op.index === null) {
            skipped.push({ op, reason: "skills op missing 'index'" });
            break;
          }
          const group = resume.skills[op.index];
          if (!group) {
            skipped.push({ op, reason: `skills[${op.index}] out of bounds` });
            break;
          }
          if (op.field === 'category') {
            group.category = op.new_value;
            applied++;
          } else if (op.field === 'item') {
            if (op.bullet_index === null) {
              skipped.push({ op, reason: "skills.item op missing 'bullet_index'" });
              break;
            }
            if (op.bullet_index < 0 || op.bullet_index > group.items.length) {
              skipped.push({
                op,
                reason: `item index ${op.bullet_index} out of range for skills[${op.index}]`,
              });
              break;
            }
            if (op.bullet_index === group.items.length) {
              group.items.push(op.new_value);
            } else {
              group.items[op.bullet_index] = op.new_value;
            }
            applied++;
          } else {
            skipped.push({ op, reason: `unsupported field on 'skills': ${op.field}` });
          }
          break;
        }

        case 'education': {
          if (op.index === null) {
            skipped.push({ op, reason: "education op missing 'index'" });
            break;
          }
          const item = resume.education[op.index];
          if (!item) {
            skipped.push({ op, reason: `education[${op.index}] out of bounds` });
            break;
          }
          if (op.field === 'title') {
            item.degree = op.new_value;
            applied++;
          } else if (op.field === 'bullet') {
            if (op.bullet_index === null) {
              skipped.push({ op, reason: "education.bullet op missing 'bullet_index'" });
              break;
            }
            if (op.bullet_index < 0 || op.bullet_index > item.bullets.length) {
              skipped.push({
                op,
                reason: `bullet_index ${op.bullet_index} out of range for education[${op.index}]`,
              });
              break;
            }
            if (op.bullet_index === item.bullets.length) {
              item.bullets.push(op.new_value);
            } else {
              item.bullets[op.bullet_index] = op.new_value;
            }
            applied++;
          } else {
            skipped.push({ op, reason: `unsupported field on 'education': ${op.field}` });
          }
          break;
        }
      }
    } catch (err) {
      skipped.push({
        op,
        reason: `applyEditOps threw: ${err instanceof Error ? err.message : 'unknown'}`,
      });
    }
  }

  return { resume, applied, skipped };
}

/** Convenience wrapper that takes the full TailorOutput. */
export function applyTailorOutput(base: ResumeJson, output: TailorOutput): ApplyResult {
  return applyEditOps(base, output.edit_ops);
}
