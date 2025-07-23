// /pages/api/oauth/microsoft/disconnect.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing token" });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(401).json({ success: false, error: "Unauthenticated" });
  }

  // Step 1: Delete Microsoft tokens
  const { error: deleteError } = await supabase
    .from("microsoft_tokens")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return res.status(500).json({ success: false, error: deleteError.message });
  }

  // Step 2: Update user_connected_services to reflect disconnection
  const { error: updateServicesError } = await supabase
    .from("user_connected_services")
    .update({ microsoft_is_connected: false })
    .eq("user_id", user.id);

  if (updateServicesError) {
    return res.status(500).json({ success: false, error: updateServicesError.message });
  }

  // Step 3: Deactivate flows
  const { error: deactivateFlowsError } = await supabase
    .from("user_flows")
    .update({ is_active: false })
    .eq("user_id", user.id);

  if (deactivateFlowsError) {
    return res.status(500).json({ success: false, error: deactivateFlowsError.message });
  }

  return res.status(200).json({ success: true });
}
