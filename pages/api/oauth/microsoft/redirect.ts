// pages/api/oauth/microsoft/redirect.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/microsoft/callback`;

  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', process.env.MICROSOFT_CLIENT_ID!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('scope', [
    'offline_access',
    'User.Read',
    'Mail.ReadWrite',
    'Mail.Send'
  ].join(' '));
  authUrl.searchParams.set('state', 'secure_random_state_value'); // optional

  res.redirect(authUrl.toString());
}