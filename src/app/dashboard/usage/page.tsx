import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const usageStats = {
  plan: "Free",
  flowLimit: 2,
  flowUsed: 2,
  runLimit: 500,
  runUsed: 438,
  teamLimit: 1,
  teamUsed: 1,
};

const calculatePercent = (used: number, limit: number) => {
  if (!limit || limit <= 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

export default function UsagePage() {
  const flowPercent = calculatePercent(usageStats.flowUsed, usageStats.flowLimit);
  const runPercent = calculatePercent(usageStats.runUsed, usageStats.runLimit);
  const teamPercent = calculatePercent(usageStats.teamUsed, usageStats.teamLimit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Usage</h1>
          <p className="text-muted-foreground">View your plan limits and current usage.</p>
        </div>
        <Link href="/dashboard/billing">
          <Button variant="default" size="sm">Upgrade Plan</Button>
        </Link>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-700">
            Current Plan: <strong>{usageStats.plan}</strong>
          </div>

          <UsageMetric label="Flows Used" used={usageStats.flowUsed} limit={usageStats.flowLimit} percent={flowPercent} />
          <UsageMetric label="Monthly Runs" used={usageStats.runUsed} limit={usageStats.runLimit} percent={runPercent} />
          <UsageMetric label="Team Members" used={usageStats.teamUsed} limit={usageStats.teamLimit} percent={teamPercent} />
        </CardContent>
      </Card>
    </div>
  );
}

function UsageMetric({ label, used, limit, percent }: { label: string; used: number; limit: number; percent: number }) {
  const statusColor =
    percent >= 90 ? "text-red-600" : percent >= 75 ? "text-yellow-600" : "text-green-600";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm font-medium">
        <span>{label}: {used}/{limit}</span>
        <span className={`text-xs font-semibold ${statusColor}`}>
          {Math.round(percent)}%
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}