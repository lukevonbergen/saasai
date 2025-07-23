import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { flow_name, is_active } = req.body;

  if (!flow_name || typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'Missing or invalid flow_name or is_active' });
  }

  // Parse cookie for Supabase access token
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies['sb-access-token'];

  if (!accessToken) {
    return res.status(401).json({ error: 'User not authenticated (no access token)' });
  }

  // Get authenticated user using access token
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(accessToken);

  if (!user || userError) {
    console.error('❌ Supabase user fetch error:', userError);
    return res.status(401).json({ error: 'User not found', details: userError });
  }

  // Perform upsert on user_flows table
  const { error: upsertError } = await supabase
    .from('user_flows')
    .upsert(
      [
        {
          user_id: user.id,
          flow_name,
          is_active,
          updated_at: new Date().toISOString()
        }
      ],
      {
        onConflict: 'user_id,flow_name'
      }
    );

  if (upsertError) {
    console.error('❌ Failed to upsert user_flows:', upsertError);
    return res.status(500).json({ error: 'Failed to update flow', details: upsertError });
  }

  return res.status(200).json({ success: true });
}
