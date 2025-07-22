'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface MicrosoftTokenResult {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  email?: string;
  error?: string;
  [key: string]: any;
}

export default function TokenTestPage() {
  const supabase = useSupabaseClient();
  const [result, setResult] = useState<MicrosoftTokenResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("No Supabase access token found.");
          setLoading(false);
          return;
        }

        const res = await fetch('/api/oauth/microsoft/token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData?.error || "Unknown error from token endpoint.");
        } else {
          const data: MicrosoftTokenResult = await res.json();
          setResult(data);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [supabase]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Microsoft Token Debug</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-600 font-medium">Error: {error}</p>}
      {!loading && !error && (
        <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap overflow-x-auto border border-gray-200">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
