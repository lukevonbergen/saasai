// /pages/api/oauth/gmail/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) return res.status(400).json({ error: "Missing code" });

  // Step 1: Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error("OAuth error:", tokenData);
    return res.status(500).json({ error: "Failed to exchange code" });
  }

  // Step 2: Get user's Gmail address
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const profile = await userInfoRes.json();

  if (!profile.email) {
    console.error("Failed to fetch user email:", profile);
    return res.status(500).json({ error: "Failed to fetch email address" });
  }

  // Step 3: Save tokens + email to Supabase
  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("gmail_tokens").upsert(
  {
    user_id: user.id,
    email: profile.email,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
  },
  {
    onConflict: "user_id", // 👈 just a string, not an array
  }
);
  }

  return res.redirect("/dashboard");
}