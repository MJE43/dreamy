'use client';

// Remove unused imports
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useAuth } from '@/context/AuthProvider';

// Import the hook from the Supabase helper library
import { useUser as useSupabaseUser } from '@supabase/auth-helpers-react';

// Removed original hook implementation that relied on old AuthProvider
// and client-side redirection (now handled server-side or via Supabase context)

// Simple re-export or wrapper around the Supabase hook
// We can rename it slightly to avoid confusion if needed, or just export it directly.
export const useUser = useSupabaseUser;

// If you needed to add custom logic later, you could wrap it:
// export function useUser() {
//   const supabaseUserContext = useSupabaseUser();
//   // Add any custom logic here if needed
//   return supabaseUserContext;
// } 
