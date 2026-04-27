import Link from 'next/link';
import { SignInForm } from '../sign-in/sign-in-form';

export const metadata = {
  title: 'Sign up · findmejob',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up to run your first candid assessment.
        </p>
      </div>

      {/* Magic-link sign-in serves both flows; Supabase creates the user on first link click. */}
      <SignInForm initialError={error} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
