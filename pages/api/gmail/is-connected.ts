// /pages/api/gmail/is-connected.ts
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ connected: false });

  const { data } = await supabase
    .from("gmail_tokens")
    .select("access_token, email")
    .eq("user_id", user.id)
    .single();

  if (!data || !data.access_token || !data.email) {
    return res.status(200).json({ connected: false });
  }

  return res.status(200).json({ connected: true, email: data.email });
}
