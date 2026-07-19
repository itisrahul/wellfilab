'use client';
import { SignIn } from '@clerk/nextjs';
import { useClerkAppearance } from '@/lib/clerkAppearance';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function SignInPage() {
  const appearance = useClerkAppearance();

  return (
    <AuthLayout mode="sign-in">
      <SignIn appearance={appearance} signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
    </AuthLayout>
  );
}
