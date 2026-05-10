import { Skeleton } from '@/components/ui/skeleton';

export default function ApplicationDetailLoading() {
  return (
    <div className="flex flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
        {/* Back link */}
        <Skeleton className="h-4 w-40 rounded" />

        {/* Header card */}
        <Skeleton className="h-[220px] w-full rounded-3xl" />

        {/* Two-column body */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Skeleton className="h-[180px] w-full rounded-2xl" />
            <Skeleton className="h-[280px] w-full rounded-2xl" />
            <Skeleton className="h-[140px] w-full rounded-2xl" />
          </div>
          <div className="flex flex-col gap-3 lg:col-span-5">
            <Skeleton className="h-3 w-32 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
