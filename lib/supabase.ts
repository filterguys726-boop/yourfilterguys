import {
  createBrowserClient,
  createServerClient,
  type CookieOptions
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  hasSupabaseEnv,
  hasSupabaseServiceEnv,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl
} from "@/lib/env";

export function createBrowserSupabaseClient() {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Auth routes and actions can.
        }
      }
    }
  });
}

export function createServiceSupabaseClient() {
  if (!hasSupabaseServiceEnv) {
    throw new Error("Supabase service role environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
