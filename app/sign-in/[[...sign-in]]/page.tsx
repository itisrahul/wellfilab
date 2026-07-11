'use client';
import { SignIn } from '@clerk/nextjs';
import { useClerkAppearance } from '@/lib/clerkAppearance';

export default function SignInPage() {
  const appearance = useClerkAppearance();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-8">
          <svg width="40" height="40" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="9" fill="#0d9488" />
            <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">WellFiLab</span>
        </div>
        <SignIn appearance={appearance} signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
