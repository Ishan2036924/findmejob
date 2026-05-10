import { requireAdmin } from '@/lib/admin/auth';
import { getRecentActivity } from '@/lib/admin/queries';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui-kit';

export const metadata = {
  title: 'Activity · admin · findmejob',
};

export const dynamic = 'force-dynamic';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const APPLICATION_STATUSES: StatusBadgeStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

function isApplicationStatus(s: string): s is StatusBadgeStatus {
  return (APPLICATION_STATUSES as string[]).includes(s);
}

export default async function AdminActivityPage() {
  await requireAdmin();
  const a = await getRecentActivity();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
        <h1 className="text-3xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Recent user activity. Newest first. Capped at 50 rows per section.
        </p>
      </div>

      {/* Recent chat prompts */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent chat prompts ({a.recent_chat_prompts.length})
          </span>
          <span className="text-xs text-muted-foreground">
            User-side messages, truncated to 200 chars.
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Prompt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.recent_chat_prompts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No chat prompts yet.
                </TableCell>
              </TableRow>
            ) : (
              a.recent_chat_prompts.map((p, i) => (
                <TableRow key={`${p.profile_id}-${p.created_at}-${i}`}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(p.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {p.email ?? <span className="text-muted-foreground">unknown</span>}
                  </TableCell>
                  <TableCell className="max-w-[600px] truncate text-xs text-muted-foreground">
                    {p.content || <span className="italic">[empty]</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent applications */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent applications ({a.recent_applications.length})
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Updated</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.recent_applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No applications yet.
                </TableCell>
              </TableRow>
            ) : (
              a.recent_applications.map((app, i) => (
                <TableRow key={`${app.profile_id}-${app.updated_at}-${i}`}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(app.updated_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {app.email ?? <span className="text-muted-foreground">unknown</span>}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs">{app.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {app.company}
                  </TableCell>
                  <TableCell>
                    {isApplicationStatus(app.status) ? (
                      <StatusBadge status={app.status} size="sm" />
                    ) : (
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">
                        {app.status}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent generations */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent generations ({a.recent_generations.length})
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Kind</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.recent_generations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No generations yet.
                </TableCell>
              </TableRow>
            ) : (
              a.recent_generations.map((g, i) => (
                <TableRow key={`${g.profile_id}-${g.created_at}-${i}`}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(g.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {g.email ?? <span className="text-muted-foreground">unknown</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{g.kind}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent signups */}
      <Card className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent signups ({a.recent_signups.length})
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Profile ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {a.recent_signups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No signups yet.
                </TableCell>
              </TableRow>
            ) : (
              a.recent_signups.map((s) => (
                <TableRow key={s.profile_id}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(s.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs">
                    {s.email ?? <span className="text-muted-foreground">unknown</span>}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {s.profile_id}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
