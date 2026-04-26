import { createClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase env is not configured");
  }
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase env is not configured");
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createClient();
  if (!supabase) {
    return { error: null };
  }
  return supabase.auth.signOut();
}
