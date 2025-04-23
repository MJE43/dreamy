import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';

interface SessionProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default async function SessionProvider({
  children,
  requireAuth = false,
  redirectTo = '/login'
}: SessionProviderProps) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // If authentication is required but no user exists, redirect to login
  if (requireAuth && !user) {
    redirect(redirectTo);
  }
  
  // Render the children directly, no longer need the old AuthProvider
  return <>{children}</>;
} 
