import { SettingsNav } from './settings-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:gap-8 sm:px-10 sm:py-12">
      <aside className="w-full shrink-0 sm:w-48">
        <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Settings
        </span>
        <div className="mt-2">
          <SettingsNav />
        </div>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
