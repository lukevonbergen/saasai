'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ProviderStatus {
  connected: boolean;
  email: string | null;
  expires_at: string | null;
  checking: boolean;
}

interface ConnectionCardProps {
  title: string;
  provider: ProviderStatus;
  variant: 'green' | 'blue' | 'gray' | 'purple';
  onConnect?: () => void;
  onDisconnect: () => void;
  connectUrl?: string;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  title,
  provider,
  onConnect,
  onDisconnect,
  connectUrl,
  variant,
}) => {
  const statusColor = provider.checking
    ? 'bg-gray-100 text-gray-800'
    : provider.connected
    ? variant === 'green'
      ? 'bg-green-100 text-green-800'
      : variant === 'blue'
      ? 'bg-blue-100 text-blue-800'
      : variant === 'purple'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-gray-100 text-gray-800'
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
