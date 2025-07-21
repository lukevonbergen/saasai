// /pages/api/oauth/gmail/disconnect.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Not authenticated" });

  // Fetch access token from DB
  const { data: tokenData } = await supabase
    .from("gmail_tokens")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (tokenData?.access_token) {
    // Revoke it with Google
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: tokenData.access_token }),
    });
  }

  // Remove from DB
  await supabase
    .from("gmail_tokens")
    .delete()
    .eq("user_id", user.id);

  return res.status(200).json({ success: true });
}
