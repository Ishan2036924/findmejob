import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

export type CompanyType =
  | 'startup'
  | 'big_tech'
  | 'mnc'
  | 'agency'
  | 'consultancy'
  | 'nonprofit'
  | 'government'
  | 'other';

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  startup: 'Startup',
  big_tech: 'Big tech',
  mnc: 'MNC',
  agency: 'Agency',
  consultancy: 'Consultancy',
  nonprofit: 'Nonprofit',
  government: 'Government',
  other: 'Other',
};

const COMPANY_TYPE_VALUES = [
  'startup',
  'big_tech',
  'mnc',
  'agency',
  'consultancy',
  'nonprofit',
  'government',
  'other',
] as const;

const classificationSchema = z.object({
  company_type: z.enum(COMPANY_TYPE_VALUES),
  confidence: z.number(),
});

const SYSTEM_PROMPT = `You classify employers into one of these categories based on company name and JD context:

- startup: early-stage company (seed / Series A-C, typically <500 employees, fast-moving)
- big_tech: FAANG-tier or pure-tech firm with 10k+ employees (Google, Meta, Amazon, Microsoft, Apple, Netflix, Uber, Airbnb, Stripe at scale, etc.)
- mnc: large multinational, NOT primarily a tech company (banks, FMCG, pharma, telecom, manufacturing, retail giants — e.g. JPMorgan, Unilever, Pfizer, Reliance, Walmart)
- agency: creative/marketing/digital agency or staffing/recruitment firm
- consultancy: management or IT services consulting (McKinsey, Deloitte, Accenture, TCS, Infosys, Cognizant, Wipro)
- nonprofit: NGOs, charities, foundations
- government: federal/state agencies, public-sector bodies, defence
- other: anything that doesn't cleanly fit above (small businesses, academia, healthcare providers, etc.)

Output the type and a 0-1 confidence. If unsure pick 'other' with low confidence.`;

const MAX_DESCRIPTION_CHARS = 1500;

export async function classifyCompany({
  company,
  jobTitle,
  jobDescription,
}: {
  company: string;
  jobTitle: string;
  jobDescription: string;
}): Promise<{ companyType: CompanyType; confidence: number }> {
  try {
    const truncated = (jobDescription ?? '').slice(0, MAX_DESCRIPTION_CHARS);
    const result = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: classificationSchema,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `## COMPANY\n${company}\n\n## ROLE\n${jobTitle}\n\n## JD (truncated)\n${truncated}\n\n## TASK\nClassify the company. Return only the JSON object.`,
        },
      ],
    });

    const conf = Number.isFinite(result.object.confidence)
      ? Math.max(0, Math.min(1, result.object.confidence))
      : 0;

    return {
      companyType: result.object.company_type as CompanyType,
      confidence: conf,
    };
  } catch (err) {
    console.error('[classifyCompany] failed', { company, err });
    return { companyType: 'other', confidence: 0 };
  }
}
