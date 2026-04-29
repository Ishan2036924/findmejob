'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  return (
    <Button
      type="button"
      size="sm"
      onClick={() => window.print()}
      className="gap-2"
    >
      <Printer className="size-3.5" strokeWidth={1.5} />
      Download PDF
    </Button>
  );
}
