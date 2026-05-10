import { requireAdmin } from '@/lib/admin/auth';
import { getUserList } from '@/lib/admin/queries';
import { EmptyState } from '@/components/ui-kit';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';

export const metadata = {
  title: 'Users · admin · findmejob',
};

export const dynamic = 'force-dynamic';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const rows = await getUserList({ limit: 200 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Admin</span>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Most recent {rows.length} signups. Sorted by signup date desc.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" description="Signups will appear here." />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role family</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Apps</TableHead>
                <TableHead className="text-right">Assessment</TableHead>
                <TableHead className="text-right">Chat 7d</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.profile_id}>
                  <TableCell className="max-w-[260px] truncate text-xs">
                    {r.email ?? (
                      <span className="text-muted-foreground">unknown</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.target_role_family ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.target_seniority ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs">
                    {r.target_location ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(r.signup_at)}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(r.last_active_at)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {r.applications_count}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {r.assessment_score ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {r.chat_turns_7d}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
