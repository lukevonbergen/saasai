// pages/api/oauth/microsoft/is-connected.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Attempt to extract the Supabase token
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies["sb-access-token"];

    if (!token) {
      return res.status(401).json({ connected: false, error: "No auth token" });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ connected: false, error: "Unauthenticated" });
    }

    const { data, error: dbError } = await supabase
      .from("microsoft_tokens")
      .select("email")
      .eq("user_id", user.id)
      .maybeSingle(); // <- doesn't throw on no match

    if (dbError) {
      console.error("DB error:", dbError);
      return res.status(500).json({ connected: false, error: dbError.message });
    }

    if (!data) {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({ connected: true, email: data.email });
  } catch (err: any) {
    console.error("Unexpected error in is-connected:", err);
    return res.status(500).json({ connected: false, error: "Unexpected server error" });
  }
}