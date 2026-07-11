'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes';
import type { Appearance } from '@clerk/types';

/**
 * Theme-aware Clerk appearance, shared by the sign-in/sign-up pages and the
 * navbar's UserButton so all three stay visually consistent with the rest
 * of the site instead of falling back to Clerk's own auto dark-mode
 * detection (which produced a mismatched card vs. footer background).
 */
export function useClerkAppearance(): Appearance {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  return {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: '#0d9488',
      colorBackground: isDark ? '#111827' : '#ffffff',
      colorText: isDark ? '#f3f4f6' : '#111827',
      colorTextSecondary: isDark ? '#9ca3af' : '#6b7280',
      colorInputBackground: isDark ? '#1f2937' : '#ffffff',
      colorInputText: isDark ? '#f3f4f6' : '#111827',
      colorNeutral: isDark ? '#f3f4f6' : '#111827',
      borderRadius: '0.75rem',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
    },
    elements: {
      card: 'shadow-lg border border-gray-200 dark:border-gray-800',
      footer: 'bg-white dark:bg-gray-900',
      footerAction: 'bg-white dark:bg-gray-900',
      footerActionLink: 'text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300',
      formButtonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white normal-case',
      formFieldInput: 'focus:border-teal-500 focus:ring-teal-500',
      socialButtonsBlockButton: 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
      identityPreviewEditButton: 'text-teal-600 dark:text-teal-400',
      formResendCodeLink: 'text-teal-600 dark:text-teal-400',
      otpCodeFieldInput: 'focus:border-teal-500',
      userButtonPopoverCard: 'shadow-lg border border-gray-200 dark:border-gray-800',
      userButtonPopoverFooter: 'bg-white dark:bg-gray-900',
      userButtonPopoverActionButton: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      userButtonPopoverActionButtonText: 'text-gray-700 dark:text-gray-300',
      userButtonPopoverActionButtonIcon: 'text-gray-500 dark:text-gray-400',
    },
  };
}
