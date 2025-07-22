import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token);

  if (!user || userError) {
    return res.status(401).json({ error: "Unauthenticated", details: userError });
  }

  const { data: record, error: tokenError } = await supabase
    .from("microsoft_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (tokenError || !record) {
    return res.status(404).json({ error: "No Microsoft token found" });
  }

  const now = Date.now();
  const isExpired = record.expires_at && record.expires_at < now;

  if (isExpired) {
    const refreshRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: record.refresh_token,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`,
        scope: record.scope || "offline_access Mail.ReadWrite Mail.Send User.Read"
      }),
    });

    const newToken = await refreshRes.json();

    if (!newToken.access_token) {
      return res.status(400).json({ error: "Token refresh failed", details: newToken });
    }

    // Update in Supabase
    await supabase
      .from("microsoft_tokens")
      .update({
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token || record.refresh_token,
        expires_at: Date.now() + newToken.expires_in * 1000,
        updated_at: new Date(),
      })
      .eq("user_id", user.id);

    return res.status(200).json({
      access_token: newToken.access_token,
      refresh_token: newToken.refresh_token || record.refresh_token,
      expires_at: Date.now() + newToken.expires_in * 1000,
      email: record.email,
      scope: record.scope
    });
  }

  return res.status(200).json({
    access_token: record.access_token,
    refresh_token: record.refresh_token,
    expires_at: record.expires_at,
    email: record.email,
    scope: record.scope
  });
}
