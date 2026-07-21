import { createClient } from "@supabase/supabase-js";

function environment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured. Add it to .env.local before using the PDF library.`);
  return value;
}

export function createSupabaseAdmin() {
  return createClient(environment("NEXT_PUBLIC_SUPABASE_URL"), environment("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function userIdFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) throw new Error("Sign in before uploading or searching a personal library.");
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Your session has expired. Please sign in again.");
  return data.user.id;
}
