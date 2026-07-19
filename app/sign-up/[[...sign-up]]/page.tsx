'use client';
import { SignUp } from '@clerk/nextjs';
import { useClerkAppearance } from '@/lib/clerkAppearance';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function SignUpPage() {
  const appearance = useClerkAppearance();

  return (
    <AuthLayout mode="sign-up">
      <SignUp appearance={appearance} signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
    </AuthLayout>
  );
}
