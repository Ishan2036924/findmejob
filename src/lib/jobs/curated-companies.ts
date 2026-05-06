// Curated company list for Slice 4 multi-source ingestion.
//
// Each entry is a (company, ATS, slug, region) tuple. The slug is the
// company's identifier on its ATS — e.g., a Greenhouse company at
// https://boards.greenhouse.io/razorpay has slug "razorpay".
//
// Slugs are best-effort and DO change. If a fetch returns 404, that entry
// silently produces 0 jobs and the ingest continues. Verify in production
// by checking ingest logs and pruning dead entries.
//
// Region is a label only — most listed roles accept applicants globally.
// Used in future Slice 3+ analytics for "top India companies vs top US"
// breakdowns.

export type AtsSource = 'greenhouse' | 'lever' | 'ashby';
export type CompanyRegion = 'india' | 'us' | 'both';

export type CuratedCompany = {
  slug: string;
  name: string;
  ats: AtsSource;
  region: CompanyRegion;
  // HQ region — used as the fallback when an ATS posting omits a location
  // string. Distinct from `region` (which is a labeling hint, may be 'both').
  hq_region: 'india' | 'us';
};

export const CURATED_COMPANIES: CuratedCompany[] = [
  // ── India tech (Greenhouse) ──
  { slug: 'razorpay', name: 'Razorpay', ats: 'greenhouse', region: 'india', hq_region: 'india' },
  { slug: 'meesho', name: 'Meesho', ats: 'greenhouse', region: 'india', hq_region: 'india' },
  { slug: 'urbancompany', name: 'Urban Company', ats: 'greenhouse', region: 'india', hq_region: 'india' },
  { slug: 'plivo', name: 'Plivo', ats: 'greenhouse', region: 'india', hq_region: 'india' },

  // ── India tech (Lever) ──
  { slug: 'cred', name: 'CRED', ats: 'lever', region: 'india', hq_region: 'india' },
  { slug: 'phonepe', name: 'PhonePe', ats: 'lever', region: 'india', hq_region: 'india' },
  { slug: 'groww', name: 'Groww', ats: 'lever', region: 'india', hq_region: 'india' },

  // ── India tech (Ashby) ──
  { slug: 'postman', name: 'Postman', ats: 'ashby', region: 'india', hq_region: 'india' },
  { slug: 'sarvam', name: 'Sarvam AI', ats: 'ashby', region: 'india', hq_region: 'india' },
  { slug: 'zluri', name: 'Zluri', ats: 'ashby', region: 'india', hq_region: 'india' },

  // ── US tech (Greenhouse) ──
  { slug: 'stripe', name: 'Stripe', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'airbnb', name: 'Airbnb', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'coinbase', name: 'Coinbase', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'plaid', name: 'Plaid', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'brex', name: 'Brex', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'notion', name: 'Notion', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'anthropic', name: 'Anthropic', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'instacart', name: 'Instacart', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'doordash', name: 'DoorDash', ats: 'greenhouse', region: 'us', hq_region: 'us' },
  { slug: 'discord', name: 'Discord', ats: 'greenhouse', region: 'us', hq_region: 'us' },

  // ── US tech (Lever) ──
  { slug: 'netflix', name: 'Netflix', ats: 'lever', region: 'us', hq_region: 'us' },
  { slug: 'shopify', name: 'Shopify', ats: 'lever', region: 'us', hq_region: 'us' },
  { slug: 'mixpanel', name: 'Mixpanel', ats: 'lever', region: 'us', hq_region: 'us' },
  { slug: 'kayak', name: 'KAYAK', ats: 'lever', region: 'us', hq_region: 'us' },
  { slug: 'patreon', name: 'Patreon', ats: 'lever', region: 'us', hq_region: 'us' },

  // ── US tech (Ashby) ──
  { slug: 'linear', name: 'Linear', ats: 'ashby', region: 'us', hq_region: 'us' },
  { slug: 'figma', name: 'Figma', ats: 'ashby', region: 'us', hq_region: 'us' },
  { slug: 'mercury', name: 'Mercury', ats: 'ashby', region: 'us', hq_region: 'us' },
  { slug: 'replit', name: 'Replit', ats: 'ashby', region: 'us', hq_region: 'us' },
  { slug: 'vercel', name: 'Vercel', ats: 'ashby', region: 'us', hq_region: 'us' },
  { slug: 'ramp', name: 'Ramp', ats: 'ashby', region: 'us', hq_region: 'us' },
];
