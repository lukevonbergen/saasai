import type { NextApiRequest, NextApiResponse } from "next";
import { getWorkflowStatus } from "@/lib/n8nClient";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Not logged in" });

  const workflowId = "mock-id"; // later: pull from Supabase
  const isActive = await getWorkflowStatus(workflowId);

  res.status(200).json({ status: isActive ? "active" : "paused" });
}