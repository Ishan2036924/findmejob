'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResumeUpload } from './resume-upload';

export function UpdateResumeDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <FileUp className="size-3.5" strokeWidth={1.5} />
            Update resume
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update your resume</DialogTitle>
          <DialogDescription>
            Replace your current resume by uploading a new PDF. The new version becomes the
            source of truth for assessments and tailoring.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ResumeUpload
            enableInlineSave
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
