import { Skeleton } from '@/components/ui/skeleton';

export default function ChatThreadLoading() {
  return (
    <div className="flex h-[calc(100dvh-3rem)] lg:h-screen">
      {/* Thread list sidebar (desktop) */}
      <aside className="hidden w-72 shrink-0 flex-col gap-2 border-r border-white/5 p-4 lg:flex">
        <Skeleton className="h-8 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </aside>

      <section className="flex flex-1 flex-col">
        {/* Thread header */}
        <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
        </header>

        {/* Message bubbles */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-6 sm:px-6">
          <Skeleton className="ml-auto h-16 w-3/4 rounded-2xl sm:w-1/2" />
          <Skeleton className="h-24 w-5/6 rounded-2xl sm:w-2/3" />
          <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl sm:w-1/3" />
          <Skeleton className="h-32 w-5/6 rounded-2xl sm:w-3/4" />
        </div>

        {/* Composer */}
        <div className="border-t border-white/5 px-4 py-4 sm:px-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
