import { createClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string, displayName: string) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
