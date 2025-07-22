// pages/api/oauth/microsoft/refresh.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const { data: record } = await supabase
    .from("microsoft_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!record?.refresh_token) {
    return res.status(400).json({ error: "No refresh token found" });
  }

  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: record.refresh_token,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`,
      scope: record.scope || "offline_access Mail.ReadWrite Mail.Send User.Read",
    }),
  });

  const newToken = await response.json();

  if (!newToken.access_token) {
    return res.status(400).json({ error: "Refresh failed", details: newToken });
  }

  await supabase
    .from("microsoft_tokens")
    .update({
      access_token: newToken.access_token,
      refresh_token: newToken.refresh_token || record.refresh_token,
      expires_at: Date.now() + newToken.expires_in * 1000,
      updated_at: new Date(),
    })
    .eq("user_id", user.id);

  return res.status(200).json({ success: true });
}