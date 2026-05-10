import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { FeedbackRow } from './feedback-row';

export const metadata = {
  title: 'Feedback · admin · findmejob',
};

export const dynamic = 'force-dynamic';

type FeedbackStatus = 'new' | 'triaged' | 'resolved' | 'wontfix';

type FeedbackItem = {
  id: string;
  body: string;
  page_url: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  attachment_id: string | null;
  profile_id: string;
};

type EnrichedFeedback = FeedbackItem & {
  email: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
};

async function loadFeedback(): Promise<EnrichedFeedback[]> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from('feedback')
    .select(
      'id, body, page_url, status, admin_notes, created_at, attachment_id, profile_id',
    )
    .order('created_at', { ascending: false })
    .limit(500);
  if (error || !rows) return [];

  const profileIds = Array.from(new Set(rows.map((r) => r.profile_id as string)));
  const attachmentIds = rows
    .map((r) => r.attachment_id as string | null)
    .filter((id): id is string => !!id);

  const usersResult = await admin.auth.admin.listUsers({ perPage: 1000 });

  const emailByProfile = new Map<string, string>();
  const allUsers = usersResult.data?.users ?? [];
  for (const u of allUsers) {
    if (profileIds.includes(u.id) && u.email) {
      emailByProfile.set(u.id, u.email);
    }
  }

  let attachmentRows: { id: string; file_path: string; file_name: string }[] = [];
  if (attachmentIds.length > 0) {
    const { data: attData } = await admin
      .from('chat_attachments')
      .select('id, file_path, file_name')
      .in('id', attachmentIds);
    attachmentRows =
      (attData as { id: string; file_path: string; file_name: string }[] | null) ?? [];
  }
  const attachmentById = new Map<string, { signedUrl: string | null; name: string }>();
  await Promise.all(
    attachmentRows.map(async (a) => {
      const { data: signed } = await admin.storage
        .from('chat-attachments')
        .createSignedUrl(a.file_path, 60 * 60);
      attachmentById.set(a.id, {
        signedUrl: signed?.signedUrl ?? null,
        name: a.file_name,
      });
    }),
  );

  return (rows as FeedbackItem[]).map((r) => {
    const att = r.attachment_id ? attachmentById.get(r.attachment_id) : null;
    return {
      ...r,
      email: emailByProfile.get(r.profile_id) ?? null,
      attachment_url: att?.signedUrl ?? null,
      attachment_name: att?.name ?? null,
    };
  });
}

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const items = await loadFeedback();

  const counts = items.reduce<Record<FeedbackStatus, number>>(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    { new: 0, triaged: 0, resolved: 0, wontfix: 0 },
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Admin
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          User-submitted bug reports and feedback. Newest first.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Pill label={`new ${counts.new}`} tone="amber" />
          <Pill label={`triaged ${counts.triaged}`} tone="blue" />
          <Pill label={`resolved ${counts.resolved}`} tone="emerald" />
          <Pill label={`wontfix ${counts.wontfix}`} tone="muted" />
          <Pill label={`total ${items.length}`} tone="muted" />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40">
        <div className="grid grid-cols-[160px_minmax(0,1fr)_minmax(0,2fr)_120px] gap-3 border-b border-white/5 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Created</span>
          <span>User</span>
          <span>Body</span>
          <span>Status</span>
        </div>
        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No feedback yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((item) => (
              <FeedbackRow
                key={item.id}
                id={item.id}
                createdAt={item.created_at}
                email={item.email}
                body={item.body}
                pageUrl={item.page_url}
                status={item.status}
                adminNotes={item.admin_notes}
                attachmentUrl={item.attachment_url}
                attachmentName={item.attachment_name}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          ← Back to app
        </Link>
      </div>
    </div>
  );
}

function Pill({
  label,
  tone,
}: {
  label: string;
  tone: 'amber' | 'blue' | 'emerald' | 'muted';
}) {
  const tones = {
    amber: 'border-amber-500/30 bg-amber-500/[0.08] text-amber-200/90',
    blue: 'border-sky-500/30 bg-sky-500/[0.08] text-sky-200/90',
    emerald: 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200/90',
    muted: 'border-white/10 bg-white/[0.04] text-muted-foreground',
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
