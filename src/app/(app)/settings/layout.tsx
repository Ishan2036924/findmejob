import { SettingsNav } from './settings-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl gap-8 px-6 py-12 sm:px-10">
      <aside className="w-48 shrink-0">
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
