// /pages/api/oauth/microsoft/callback.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const code = req.query.code as string;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`;

    // Exchange code for tokens
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
    console.log('🔁 Token exchange response:', tokenData);

    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'OAuth token exchange failed', details: tokenData });
    }

    // Fetch Microsoft account info
    const msUserRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const msUser = await msUserRes.json();
    console.log('📧 Microsoft user:', msUser);

    // Extract token from cookie
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const accessToken = cookies['sb-access-token'];

    if (!accessToken) {
      console.error('❌ Missing Supabase access token');
      return res.status(401).json({ error: 'User not authenticated (no access token)' });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(accessToken);

    if (!user || userError) {
      console.error('❌ Supabase user fetch error:', userError);
      return res.status(401).json({ error: 'User not found', details: userError });
    }

    const email = msUser.mail || msUser.userPrincipalName || null;

    // Save token to Supabase
    const { error: upsertError } = await supabase.from('microsoft_tokens').upsert({
      user_id: user.id,
      email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000
    });

    if (upsertError) {
      console.error('❌ Token save failed:', upsertError);
      return res.status(500).json({ error: 'Failed to save token', details: upsertError });
    }

    return res.redirect('/dashboard?connected=outlook');
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('❌ General error in Microsoft callback:', error);
    return res.status(500).json({ error: 'Unhandled error', details: error });
  }
}