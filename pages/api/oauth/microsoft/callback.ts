// /pages/api/oauth/microsoft/callback.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { parse } from "cookie";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const code = req.query.code as string;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`;

    // Step 1: Exchange code for token
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        scope: "offline_access Mail.ReadWrite Mail.Send User.Read",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Token exchange failed", details: tokenData });
    }

    // Step 2: Get Microsoft user's email
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const msUser = await userRes.json();

    const cookies = parse(req.headers.cookie || "");
    const accessToken = cookies["sb-access-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "User not authenticated (no access token)" });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return res.status(401).json({ error: "User not authenticated", details: authError });
    }

    const email = msUser.mail || msUser.userPrincipalName || null;

    const { error: upsertError } = await supabase.from("microsoft_tokens").upsert({
      user_id: user.id,
      email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    });

    if (upsertError) {
      return res.status(500).json({ error: "Token save failed", details: upsertError });
    }

    return res.redirect("/dashboard?connected=outlook");
  } catch (err: unknown) {
    console.error("Callback error:", err);
    return res.status(500).json({ error: "Unexpected error", details: (err as Error).message });
  }
}