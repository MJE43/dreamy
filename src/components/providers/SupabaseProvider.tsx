'use client';

import { useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Create the client instance only once using useState
  const [supabaseClient] = useState<SupabaseClient>(() => createClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
} 
