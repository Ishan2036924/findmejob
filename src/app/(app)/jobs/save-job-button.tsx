'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { saveJob } from '@/lib/applications/actions';
import { cn } from '@/lib/utils';

type Props = {
  jobId: string;
  initialApplicationId: string | null;
};

export function SaveJobButton({ jobId, initialApplicationId }: Props) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState(initialApplicationId);
  const [pending, startTransition] = useTransition();

  const isSaved = !!applicationId;

  return (
    <Button
      type="button"
      variant={isSaved ? 'secondary' : 'outline'}
      size="sm"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSaved && applicationId) {
          router.push(`/applications/${applicationId}`);
          return;
        }
        startTransition(async () => {
          const result = await saveJob(jobId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          setApplicationId(result.applicationId);
          if (!result.alreadySaved) toast.success('Saved to your applications');
        });
      }}
      className={cn('gap-1.5', isSaved && 'text-foreground')}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isSaved ? (
        <Check className="size-3.5" strokeWidth={2} />
      ) : (
        <BookmarkPlus className="size-3.5" strokeWidth={1.5} />
      )}
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}
