'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth/actions';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="currentColor"
      d="M21.6 12.227c0-.682-.061-1.337-.176-1.967H12v3.722h5.382a4.6 4.6 0 0 1-1.998 3.022v2.51h3.234c1.892-1.742 2.982-4.31 2.982-7.287Z"
    />
    <path
      fill="currentColor"
      d="M12 22c2.7 0 4.964-.895 6.618-2.426l-3.234-2.51c-.896.6-2.04.957-3.384.957-2.604 0-4.808-1.76-5.594-4.123H3.064v2.59A9.997 9.997 0 0 0 12 22Z"
    />
    <path
      fill="currentColor"
      d="M6.406 13.898A6 6 0 0 1 6.094 12c0-.659.114-1.3.312-1.898V7.512H3.064A9.997 9.997 0 0 0 2 12c0 1.614.386 3.142 1.064 4.488l3.342-2.59Z"
    />
    <path
      fill="currentColor"
      d="M12 5.977c1.468 0 2.786.504 3.823 1.495l2.867-2.867C16.96 2.99 14.696 2 12 2A9.997 9.997 0 0 0 3.064 7.512l3.342 2.59C7.192 7.737 9.396 5.977 12 5.977Z"
    />
  </svg>
);

export function SignInForm({ initialError }: { initialError?: string }) {
  const [emailSent, setEmailSent] = useState(false);
  const [pendingEmail, startEmailTransition] = useTransition();
  const [pendingGoogle, startGoogleTransition] = useTransition();

  if (initialError && !emailSent) {
    toast.error(decodeURIComponent(initialError));
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pendingGoogle}
        className="w-full justify-center gap-2"
        onClick={() => {
          startGoogleTransition(async () => {
            await signInWithGoogle();
          });
        }}
      >
        {pendingGoogle ? <Loader2 className="size-4 animate-spin" /> : <GoogleLogo />}
        Continue with Google
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {emailSent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-white/10 bg-card/60 p-5 text-center backdrop-blur"
          >
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Mail className="size-4" strokeWidth={1.5} />
            </div>
            <h3 className="mt-3 text-sm font-medium">Check your inbox</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent you a magic link. Click it to finish signing in.
            </p>
            <button
              type="button"
              className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setEmailSent(false)}
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            action={(formData: FormData) => {
              startEmailTransition(async () => {
                const result = await signInWithEmail(formData);
                if (!result.ok) {
                  toast.error(result.error);
                } else {
                  setEmailSent(true);
                }
              });
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={pendingEmail}
              />
            </div>
            <Button type="submit" size="lg" disabled={pendingEmail} className="w-full">
              {pendingEmail ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending link…
                </>
              ) : (
                'Send magic link'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
