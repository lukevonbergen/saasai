// /pages/api/oauth/microsoft/is-connected.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { parse } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const accessToken = cookies["sb-access-token"];

    if (!accessToken) {
      return res.status(401).json({ connected: false, error: "No auth token" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return res.status(401).json({ connected: false, error: "Unauthenticated" });
    }

    const { data, error: tokenError } = await supabase
      .from("microsoft_tokens")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !data?.email) {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({ connected: true, email: data.email });
  } catch (err: unknown) {
    return res.status(500).json({ connected: false, error: (err as Error).message });
  }
}