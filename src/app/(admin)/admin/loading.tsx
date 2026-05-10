import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-10 sm:py-12">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-3 w-80 rounded" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-2xl" />
        ))}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur sm:p-6">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </div>
    </main>
  );
}
