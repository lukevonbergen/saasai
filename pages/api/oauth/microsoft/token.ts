import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client using service role (for DB access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      // Use Supabase auth to extract user ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (user && !userError) {
        userId = user.id;
        console.log("🔐 Authenticated user:", userId);
      } else {
        return res.status(401).json({ error: "Unauthenticated", details: userError });
      }
    } else if (req.query.user_id && typeof req.query.user_id === 'string') {
      // Fallback to user_id from query string
      userId = req.query.user_id;
      console.log("🛠️ Using direct user_id:", userId);
    } else {
      return res.status(401).json({ error: "Missing authorization token or user_id" });
    }

    // Fetch the token record
    const { data: record, error: tokenError } = await supabase
      .from("microsoft_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (tokenError || !record) {
      return res.status(404).json({ error: "No Microsoft token found" });
    }

    const now = Date.now();
    const isExpired = record.expires_at && record.expires_at < now;

    if (isExpired) {
      console.log("🔄 Refreshing expired token...");

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
        return res.status(400).json({ error: "Token refresh failed", details: newToken });
      }

      const updatedToken = {
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token || record.refresh_token,
        expires_at: Date.now() + newToken.expires_in * 1000,
        updated_at: new Date(),
      };

      await supabase
        .from("microsoft_tokens")
        .update(updatedToken)
        .eq("user_id", userId);

      return res.status(200).json({
        access_token: updatedToken.access_token,
        refresh_token: updatedToken.refresh_token,
        expires_at: updatedToken.expires_at,
        email: record.email,
        scope: record.scope,
      });
    }

    // Token is still valid
    return res.status(200).json({
      access_token: record.access_token,
      refresh_token: record.refresh_token,
      expires_at: record.expires_at,
      email: record.email,
      scope: record.scope,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
}
