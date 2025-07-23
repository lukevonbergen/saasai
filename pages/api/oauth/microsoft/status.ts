import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies['sb-access-token'];

  if (!accessToken) {
    return res.status(401).json({ connected: false });
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return res.status(401).json({ connected: false });
  }

  const { data: conn } = await supabase
    .from('user_connected_services')
    .select('microsoft_is_connected')
    .eq('user_id', user.id)
    .single();

  const { data: token } = await supabase
    .from('microsoft_tokens')
    .select('email, expires_at')
    .eq('user_id', user.id)
    .single();

  return res.status(200).json({
    connected: conn?.microsoft_is_connected ?? false,
    email: token?.email ?? null,
    expires_at: token?.expires_at ?? null
  });
}
