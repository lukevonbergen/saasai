// pages/api/oauth/microsoft/is-connected.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies['sb-access-token'];

    if (!token) {
      return res.status(401).json({ connected: false, error: 'No auth token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!user || error) {
      return res.status(401).json({ connected: false, error: 'User not found' });
    }

    const { data, error: tokenError } = await supabase
      .from('microsoft_tokens')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !data) {
      return res.status(200).json({ connected: false });
    }

    return res.status(200).json({ connected: true, email: data.email });
  } catch (err) {
    console.error("❌ Error in is-connected:", err);
    return res.status(500).json({ connected: false, error: 'Unexpected error' });
  }
}