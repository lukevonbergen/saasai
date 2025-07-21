import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role key (backend only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`;

  // Exchange auth code for token
  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      scope: 'offline_access Mail.ReadWrite Mail.Send User.Read'
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return res.status(400).json({ error: 'OAuth token exchange failed', details: tokenData });
  }

  // Get Microsoft account info
  const msUserRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const msUser = await msUserRes.json();

  // ✅ Extract Supabase session token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No Supabase auth token provided' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(401).json({ error: 'Supabase user not authenticated', details: error });
  }

  // Save token to `microsoft_tokens` table
  const result = await supabase
    .from('microsoft_tokens')
    .upsert({
      user_id: user.id,
      email: msUser.mail || msUser.userPrincipalName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    });

  if (result.error) {
    return res.status(500).json({ error: 'Failed to save token', details: result.error });
  }

  res.redirect('/dashboard?connected=outlook');
}