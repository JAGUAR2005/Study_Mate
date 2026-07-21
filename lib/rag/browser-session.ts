"use client";

import { createClient } from "@supabase/supabase-js";

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getBrowserSession() {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function createPrivateSession() {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Connect Supabase first by adding its public URL and anon key to .env.local.");
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    const detail = error?.message?.trim();
    if (error?.code === "captcha_failed" || detail?.toLowerCase().includes("captcha")) {
      throw new Error("Supabase is requiring CAPTCHA for anonymous sign-ins. Disable CAPTCHA for this local demo, or configure the CAPTCHA provider in Supabase Auth settings.");
    }
    if (error?.status === 429 || detail?.toLowerCase().includes("rate limit")) {
      throw new Error("Supabase temporarily rate-limited anonymous sign-ins. Wait a moment, then try again.");
    }
    throw new Error(detail ? `Supabase could not create the private session: ${detail}` : "Supabase did not return a private session. Confirm Anonymous sign-ins is still enabled and try again.");
  }
  return data.session;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Connect Supabase first by adding its public URL and anon key to .env.local.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(error?.message ?? "Supabase did not return a signed-in session.");
  return data.session;
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Connect Supabase first by adding its public URL and anon key to .env.local.");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error("Account created. Check your email to confirm it, then sign in.");
  return data.session;
}

export async function signOutBrowser() {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getBrowserAccessToken() {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Connect Supabase first by adding its public URL and anon key to .env.local.");
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new Error("Create a private session before adding books to your library.");
  return data.session.access_token;
}
