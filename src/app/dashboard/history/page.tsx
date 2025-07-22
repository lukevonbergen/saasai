'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function TokenTestPage() {
  const supabase = useSupabaseClient();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No Supabase access token found.");
        return;
      }

      const res = await fetch('/api/oauth/microsoft/token', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      setResult(data);
    };

    fetchToken();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Microsoft Token Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
