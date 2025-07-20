import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@/lib/supabase"; // Optional if you have your own client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseClient = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data: flows, error } = await supabase
    .from("user_flows")
    .select("id, workflow_id, active, created_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching flows:", error);
    return res.status(500).json({ error: "Failed to fetch flows" });
  }

  return res.status(200).json({ flows });
}