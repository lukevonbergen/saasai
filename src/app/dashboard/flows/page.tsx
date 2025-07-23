'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function FlowsPage() {
  const supabase = createClientComponentClient();

  const [isActive, setIsActive] = useState(false); // flow default
  const [isLoading, setIsLoading] = useState(true); // page load
  const [isToggling, setIsToggling] = useState(false); // toggle action
  const [microsoftConnected, setMicrosoftConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error('Failed to load user:', userError);
        setMicrosoftConnected(false);
        setIsLoading(false);
        return;
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from('user_connected_services')
        .select('microsoft_is_connected')
        .eq('user_id', user.id)
        .single();

      if (serviceError) {
        console.error('Error loading connection state:', serviceError);
        setMicrosoftConnected(false);
        setIsLoading(false);
        return;
      }

      const connected = serviceData?.microsoft_is_connected ?? false;
      setMicrosoftConnected(connected);

      if (connected) {
        const { data: flowData, error: flowError } = await supabase
          .from('user_flows')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('flow_name', 'lead_responder')
          .single();

        if (flowError && flowError.code !== 'PGRST116') {
          console.error('Error loading flow status:', flowError);
        }

        setIsActive(flowData?.is_active ?? false);
      }

      setIsLoading(false);
    };

    loadStatus();
  }, [supabase]);

  const handleToggle = async () => {
    const nextState = !isActive;
    setIsToggling(true);
    setIsActive(nextState); // optimistic

    const res = await fetch('/api/flow/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flow_name: 'lead_responder',
        is_active: nextState
      })
    });

    if (!res.ok) {
      console.error('❌ Failed to toggle flow');
      setIsActive(!nextState); // rollback
    }

    setIsToggling(false);
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automation Flows</h1>
        <p className="text-muted-foreground">Track your live automations and manage settings.</p>
      </div>

      {microsoftConnected && (
        <Card className="w-full sm:w-[480px] bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Inbound Lead Responder
              <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically replies to inbound email leads from platforms like Rightmove and Zoopla.
            </p>

            <div className="pt-2">
              <Button
                variant={isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggle}
                disabled={isToggling}
              >
                {isToggling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isActive ? 'Pause Flow' : 'Activate Flow'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {microsoftConnected === false && (
        <div className="text-sm text-muted-foreground">
          Connect your Outlook account to unlock the Lead Responder automation.
        </div>
      )}
    </div>
  );
}
