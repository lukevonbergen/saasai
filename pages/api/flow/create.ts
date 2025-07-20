import type { NextApiRequest, NextApiResponse } from "next";
import { createWorkflow } from "@/lib/n8nClient";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@/lib/supabase"; // Optional if you already have this import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
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

  try {
    // 1. Clone the base flow from n8n
    const workflowId = await createWorkflow(user.id);

    // 2. Save to Supabase
    const { error: insertError } = await supabase
      .from("user_flows")
      .insert([
        {
          user_id: user.id,
          workflow_id: workflowId,
          active: true,
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: "Failed to save workflow to database" });
    }

    // 3. Return success
    return res.status(200).json({ success: true, workflowId });
  } catch (err) {
    console.error("Error creating workflow:", err);
    return res.status(500).json({ error: "Workflow creation failed" });
  }
}