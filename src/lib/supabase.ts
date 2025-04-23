import { type CookieOptions, createServerClient, createBrowserClient } from '@supabase/ssr'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
// import { Database } from '@/types/supabase' // TODO: Generate types later

// Client component client (Browser)
export function createClient() {
  // TODO: Add Database type generic <Database>
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server component client / Route Handler / Server Action client
// Now accepts the cookieStore instance as an argument
export function createSupabaseServerClient(cookieStore: ReadonlyRequestCookies) {
  // TODO: Add Database type generic <Database>
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignore errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  )
}

// Service Role Client (Still doesn't need cookies, but takes arg for consistency if needed)
export function createServiceRoleClient(_cookieStore?: ReadonlyRequestCookies) { // Prefix unused variable
  // TODO: Add Database type generic <Database>
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { // Provide dummy methods
        get: (_name: string) => undefined,
        set: (_name: string, _value: string, _options: CookieOptions) => {},
        remove: (_name: string, _options: CookieOptions) => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 
