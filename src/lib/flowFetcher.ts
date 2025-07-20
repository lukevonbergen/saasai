import { supabase } from "@/lib/supabase";

export async function getUserFlows(userId: string) {
  const { data, error } = await supabase
    .from("user_flows")
    .select("id, workflow_id, active, created_at")
    .eq("user_id", userId);

  if (error) {
    console.error("[flowFetcher] Failed to fetch flows for user:", userId, error);
    return [];
  }

  return data;
}

export async function getSingleFlow(userId: string, workflowId: string) {
  const { data, error } = await supabase
    .from("user_flows")
    .select("*")
    .eq("user_id", userId)
    .eq("workflow_id", workflowId)
    .single();

  if (error) {
    console.error("[flowFetcher] Failed to fetch single flow:", error);
    return null;
  }

  return data;
}