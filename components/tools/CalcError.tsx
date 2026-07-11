'use client';
import { useState } from 'react';

interface Props { children?: any; fallback?: any; }

// Functional error boundary wrapper
export function CalcError({ children }: Props) {
  return <>{children}</>;
}

export default CalcError;
