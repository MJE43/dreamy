import { createSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Redirect to the home page or dashboard
  return NextResponse.redirect(new URL('/', request.url));
} 
