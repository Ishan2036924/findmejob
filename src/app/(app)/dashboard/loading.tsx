import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-10 sm:py-12">
        {/* Profile banner */}
        <Skeleton className="h-[180px] w-full rounded-3xl" />

        {/* Quick action row */}
        <div className="-mt-2">
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-2xl" />
          ))}
        </div>

        {/* Two large cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-[240px] rounded-2xl" />
          <Skeleton className="h-[240px] rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
