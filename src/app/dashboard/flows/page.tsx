'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FlowsPage() {
  const supabase = createClientComponentClient();

  const [isPaused, setIsPaused] = useState(true); // defaults to paused until loaded
  const [microsoftConnected, setMicrosoftConnected] = useState<boolean | null>(null);
  const [flowRuns, setFlowRuns] = useState(152); // placeholder
  const monthlyLimit = 1000;
  const usagePercent = (flowRuns / monthlyLimit) * 100;

  // Load connection + flow status
  useEffect(() => {
    const loadStatus = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error('Failed to load user:', userError);
        setMicrosoftConnected(false);
        return;
      }

      // Check if Outlook is connected
      const { data: serviceData, error: serviceError } = await supabase
        .from('user_connected_services')
        .select('microsoft_is_connected')
        .eq('user_id', user.id)
        .single();

      if (serviceError) {
        console.error('Error loading connection state:', serviceError);
        setMicrosoftConnected(false);
        return;
      }

      const connected = serviceData?.microsoft_is_connected ?? false;
      setMicrosoftConnected(connected);

      if (connected) {
        // Now check if the flow is active
        const { data: flowData, error: flowError } = await supabase
          .from('user_flows')
          .select('is_active')
          .eq('user_id', user.id)
          .eq('flow_name', 'lead_responder')
          .single();

        if (flowError && flowError.code !== 'PGRST116') {
          console.error('Error loading flow status:', flowError);
        }

        setIsPaused(!flowData?.is_active); // true if not active
      }
    };

    loadStatus();
  }, [supabase]);

  const handleToggle = async () => {
    const nextState = !isPaused;
    setIsPaused(nextState); // optimistic

    const res = await fetch('/api/flow/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flow_name: 'lead_responder',
        is_active: !isPaused
      })
    });

    if (!res.ok) {
      console.error('❌ Failed to toggle flow');
      setIsPaused(!nextState); // rollback
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automation Flows</h1>
        <p className="text-muted-foreground">
          Track your live automations and monitor usage.
        </p>
      </div>

      {microsoftConnected && (
        <Card className="w-full sm:w-[480px] bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Inbound Lead Responder
              <Badge className={isPaused ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}>
                {isPaused ? 'Paused' : 'Active'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically replies to inbound email leads from platforms like Rightmove and Zoopla.
            </p>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {flowRuns} / {monthlyLimit} runs this month
              </p>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 ${isPaused ? 'bg-gray-400' : 'bg-green-500'} rounded`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-sm font-medium text-yellow-800 bg-yellow-100 p-2 rounded">
              ⚠️ This is currently using dummy data and not connected to live inboxes yet.
            </p>

            <div className="pt-2">
              <Button
                variant={isPaused ? 'default' : 'destructive'}
                size="sm"
                onClick={handleToggle}
              >
                {isPaused ? 'Resume Flow' : 'Pause Flow'}
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