'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
  // Session is optional here as it might not be passed down initially
  // depending on how you fetch it in the layout (if needed server-side).
  // For basic client-side usage, SessionProvider handles fetching.
  session?: Session | null; 
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
} 
