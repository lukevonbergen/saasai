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

    if (!token) {
      console.warn("❌ No Authorization header sent");
      return res.status(401).json({ error: "Missing authorization token" });
    }

    console.log("🔐 Supabase token received:", token.slice(0, 20) + '...');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (!user || userError) {
      console.warn("❌ Supabase auth failed:", userError);
      return res.status(401).json({ error: "Unauthenticated", details: userError });
    }

    console.log("👤 Supabase user ID:", user.id);

    const { data: record, error: tokenError } = await supabase
      .from("microsoft_tokens")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !record) {
      console.warn("⚠️ No token record found for user:", user.id);
      return res.status(404).json({ error: "No Microsoft token found" });
    }

    console.log("📄 Token record retrieved for:", record.email);

    const now = Date.now();
    const isExpired = record.expires_at && record.expires_at < now;

    if (isExpired) {
      console.log("🔄 Token expired — refreshing...");

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
        console.error("❌ Refresh failed:", newToken);
        return res.status(400).json({ error: "Token refresh failed", details: newToken });
      }

      const updatedToken = {
        access_token: newToken.access_token,
        refresh_token: newToken.refresh_token || record.refresh_token,
        expires_at: Date.now() + newToken.expires_in * 1000,
        updated_at: new Date(),
      };

      console.log("✅ Token refreshed. Saving to DB...");

      const { error: updateError } = await supabase
        .from("microsoft_tokens")
        .update(updatedToken)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("❌ Failed to update token in DB:", updateError);
      }

      return res.status(200).json({
        access_token: updatedToken.access_token,
        refresh_token: updatedToken.refresh_token,
        expires_at: updatedToken.expires_at,
        email: record.email,
        scope: record.scope,
      });
    }

    // Token still valid — return current record
    console.log("✅ Token still valid. Returning as-is.");

    return res.status(200).json({
      access_token: record.access_token,
      refresh_token: record.refresh_token,
      expires_at: record.expires_at,
      email: record.email,
      scope: record.scope,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("❌ Unhandled error in token.ts:", error);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
}
