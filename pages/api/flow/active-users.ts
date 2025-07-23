import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const flowName = req.query.flow_name as string;

  if (!flowName) {
    return res.status(400).json({ error: 'Missing flow_name query param' });
  }

  // 1️⃣ Get all users with the requested active flow
  const { data: flows, error: flowsError } = await supabase
    .from('user_flows')
    .select('user_id')
    .eq('flow_name', flowName)
    .eq('is_active', true);

  if (flowsError) {
    console.error('❌ Failed to fetch active flows:', flowsError);
    return res.status(500).json({ error: 'Failed to fetch active flows' });
  }

  const userIds = flows.map(row => row.user_id);

  if (userIds.length === 0) {
    return res.status(200).json([]);
  }

  // 2️⃣ Get Microsoft connection status
  const { data: connections, error: connError } = await supabase
    .from('user_connected_services')
    .select('user_id, microsoft_is_connected')
    .in('user_id', userIds);

  if (connError) {
    console.error('❌ Failed to fetch connections:', connError);
    return res.status(500).json({ error: 'Failed to fetch connections' });
  }

  // 3️⃣ Get user emails from auth.users
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds);

  if (userError) {
    console.error('❌ Failed to fetch user emails:', userError);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  // 4️⃣ Merge and filter users
  const activeUsers = userIds
    .map(user_id => {
      const isConnected = connections.find(c => c.user_id === user_id)?.microsoft_is_connected;
      const email = users.find(u => u.id === user_id)?.email;

      if (!isConnected) return null;

      return { user_id, email };
    })
    .filter(Boolean);

  return res.status(200).json(activeUsers);
}
