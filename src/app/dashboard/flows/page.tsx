'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProviderStatus {
  connected: boolean;
  email: string | null;
  expires_at: string | null;
  checking: boolean;
}

export default function FlowsPage() {
  const supabase = useSupabaseClient();

  const [gmail, setGmail] = useState<ProviderStatus>(() => ({
    connected: false,
    email: null,
    expires_at: null,
    checking: true,
  }));

  const [outlook, setOutlook] = useState<ProviderStatus>(() => ({
    connected: false,
    email: null,
    expires_at: null,
    checking: true,
  }));

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
    fetchStatus('/api/oauth/microsoft/is-connected', setOutlook);
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

  const CardBlock = ({
    title,
    provider,
    onConnect,
    onDisconnect,
    connectUrl,
    variant,
  }: {
    title: string;
    provider: ProviderStatus;
    onConnect?: () => void;
    onDisconnect: () => void;
    connectUrl?: string;
    variant: 'green' | 'blue';
  }) => {
    const statusColor = provider.checking
      ? 'bg-gray-100 text-gray-800'
      : provider.connected
      ? variant === 'green'
        ? 'bg-green-100 text-green-800'
        : 'bg-blue-100 text-blue-800'
      : 'bg-red-100 text-red-800';

    return (
      <Card className="w-full sm:w-[360px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge className={statusColor}>
              {provider.checking
                ? 'Checking...'
                : provider.connected
                ? 'Connected'
                : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {provider.connected && provider.email && (
            <div>
              <p className="text-sm text-muted-foreground">Email:</p>
              <p className="text-sm font-medium">{provider.email}</p>
            </div>
          )}

          {provider.connected && provider.expires_at && (
            <div>
              <p className="text-sm text-muted-foreground">Token expires:</p>
              <p className="text-sm font-medium">{provider.expires_at}</p>
            </div>
          )}

          <div className="pt-2">
            {provider.connected ? (
              <Button variant="destructive" size="sm" onClick={onDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onConnect || (() => (window.location.href = connectUrl!))}
              >
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connect Accounts</h1>
        <p className="text-muted-foreground">
          Link your email providers to enable automation workflows.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <CardBlock
          title="Gmail"
          provider={gmail}
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
          variant="green"
        />

        <CardBlock
          title="Outlook"
          provider={outlook}
          onDisconnect={async () => {
            await fetch('/api/oauth/microsoft/disconnect');
            setOutlook(prev => ({
              ...prev,
              connected: false,
              email: null,
              expires_at: null,
            }));
          }}
          onConnect={handleOutlookConnect}
          variant="blue"
        />
      </div>
    </div>
  );
}
