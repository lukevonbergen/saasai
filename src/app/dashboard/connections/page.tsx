'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { ConnectionCard, ProviderStatus } from '@/components/user-dashboard/connections/ConnectionCard';

export default function ConnectionsPage() {
  const supabase = useSupabaseClient();

  const [gmail, setGmail] = useState<ProviderStatus>({
    connected: false,
    email: null,
    expires_at: null,
    checking: true,
  });

  const [outlook, setOutlook] = useState<ProviderStatus>({
    connected: false,
    email: null,
    expires_at: null,
    checking: true,
  });

  useEffect(() => {
    const fetchStatus = async (
      url: string,
      setter: React.Dispatch<React.SetStateAction<ProviderStatus>>
    ) => {
      setter(prev => ({ ...prev, checking: true }));
      try {
        const res = await fetch(url);
        const data = await res.json();
        setter({
          connected: data.connected === true,
          email: data.email || null,
          expires_at: data.expires_at
            ? new Date(data.expires_at).toLocaleString()
            : null,
          checking: false,
        });
      } catch (err) {
        console.error(`Error checking ${url}`, err);
        setter({
          connected: false,
          email: null,
          expires_at: null,
          checking: false,
        });
      }
    };

    fetchStatus('/api/gmail/is-connected', setGmail);
    fetchStatus('/api/oauth/microsoft/status', setOutlook);
  }, []);

  const handleOutlookConnect = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      alert('Please log in first.');
      return;
    }

    document.cookie = `sb-access-token=${session.access_token}; path=/; Secure; SameSite=Lax`;
    window.location.href = '/api/oauth/microsoft/redirect';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connections</h1>
        <p className="text-muted-foreground">
          Manage and connect your automation accounts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <ConnectionCard
          title="Gmail"
          provider={gmail}
          variant="green"
          onDisconnect={async () => {
            await fetch('/api/oauth/gmail/disconnect');
            setGmail(prev => ({
              ...prev,
              connected: false,
              email: null,
              expires_at: null,
            }));
          }}
          connectUrl="/api/oauth/gmail/start"
        />

        <ConnectionCard
          title="Outlook"
          provider={outlook}
          variant="blue"
          onConnect={handleOutlookConnect}
          onDisconnect={async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
              alert('No active session found.');
              return;
            }

            await fetch('/api/oauth/microsoft/disconnect', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            setOutlook(prev => ({
              ...prev,
              connected: false,
              email: null,
              expires_at: null,
            }));
          }}
        />
      </div>
    </div>
  );
}
