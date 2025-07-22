'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FlowsPage() {
  const flowRuns = 152;
  const monthlyLimit = 1000;
  const usagePercent = (flowRuns / monthlyLimit) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Automation Flows</h1>
        <p className="text-muted-foreground">
          Track your live automations and monitor usage.
        </p>
      </div>

      <Card className="w-full sm:w-[480px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Inbound Lead Responder
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Automatically replies to inbound email leads from platforms like Rightmove and Zoopla.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {flowRuns} / {monthlyLimit} runs this month
            </p>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-sm font-medium text-yellow-800 bg-yellow-100 p-2 rounded">
            ⚠️ This is currently using dummy data and not connected to live inboxes yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
