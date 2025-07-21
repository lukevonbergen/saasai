import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ connected: false, email: null });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(401).json({ connected: false, email: null });
  }

  const { data: record } = await supabase
    .from("microsoft_tokens")
    .select("email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (record?.email) {
    return res.status(200).json({ connected: true, email: record.email });
  }

  return res.status(200).json({ connected: false, email: null });
}