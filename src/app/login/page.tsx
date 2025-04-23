import AuthForm from '@/components/auth/AuthForm';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Check for existing session using getUser for server-side check
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser(); // Use getUser()
  
  // If user is already logged in, redirect to home
  if (user) {
    redirect('/');
  }
  
  // Otherwise, render the login form
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
      <AuthForm />
    </div>
  );
} 
