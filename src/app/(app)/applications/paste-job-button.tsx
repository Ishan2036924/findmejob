'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, Loader2, Plus, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pasteJobFromUrl, pasteJobFromText } from '@/lib/jobs/paste-actions';
import { cn } from '@/lib/utils';

export function PasteJobButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    if (tab === 'url' && !url.trim()) return;
    if (tab === 'text' && text.trim().length < 100) {
      toast.error('Paste at least 100 characters of JD text.');
      return;
    }

    startTransition(async () => {
      const result = tab === 'url' ? await pasteJobFromUrl(url) : await pasteJobFromText(text);
      if (!result.ok) {
        toast.error(result.message ?? result.error);
        return;
      }
      toast.success('Job added to your applications');
      setOpen(false);
      setUrl('');
      setText('');
      router.push(`/applications/${result.applicationId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="lg" className="gap-2">
          <Plus className="size-4" strokeWidth={1.5} />
          Add a job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add any job to your log</DialogTitle>
          <DialogDescription>
            Paste a link to the posting, or drop in the JD text directly. We&apos;ll extract the
            structured fields and score it against your profile.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="size-3.5" strokeWidth={1.5} />
              URL
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <Type className="size-3.5" strokeWidth={1.5} />
              JD text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="flex flex-col gap-3 pt-4">
            <Label htmlFor="job-url" className="text-xs uppercase tracking-wider text-muted-foreground">
              Posting URL
            </Label>
            <Input
              id="job-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/jobs/senior-ml-engineer"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground/70">
              We fetch the page server-side, strip nav/scripts, and let mini extract the fields.
              Some sites (LinkedIn, Indeed-direct) block fetches — use the JD-text tab if so.
            </p>
          </TabsContent>

          <TabsContent value="text" className="flex flex-col gap-3 pt-4">
            <Label htmlFor="jd-text" className="text-xs uppercase tracking-wider text-muted-foreground">
              JD text
            </Label>
            <Textarea
              id="jd-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job description here — title, company, location, responsibilities, requirements…"
              disabled={pending}
              className="min-h-56 resize-y font-mono text-xs leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground/70">
              <span>{text.length} chars</span>
              <span className={cn(text.length > 0 && text.length < 100 && 'text-amber-400/80')}>
                {text.length < 100 && text.length > 0 && 'need at least 100'}
              </span>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={pending} className="gap-2">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Extracting + scoring
              </>
            ) : (
              'Add to applications'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
