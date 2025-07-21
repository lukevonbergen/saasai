'use client';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

type FlowStatus = "active" | "inactive" | "error";

interface Flow {
  id: string;
  name: string;
  status: FlowStatus;
  runs: number;
  lastRun: string;
}

const initialFlows: Flow[] = [
  {
    id: "flow-1",
    name: "Gmail Responser",
    status: "active",
    runs: 25,
    lastRun: "2025-07-15 14:32",
  },
  {
    id: "flow-2",
    name: "CRM Lead Sync",
    status: "error",
    runs: 5,
    lastRun: "2025-07-14 09:12",
  },
  {
    id: "flow-3",
    name: "Slack New User Alert",
    status: "inactive",
    runs: 18,
    lastRun: "2025-07-13 17:45",
  },
];

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>(initialFlows);

  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [checkingGmail, setCheckingGmail] = useState(true);

  const [outlookConnected, setOutlookConnected] = useState(false);
  const [outlookEmail, setOutlookEmail] = useState<string | null>(null);
  const [checkingOutlook, setCheckingOutlook] = useState(true);

  useEffect(() => {
    const checkGmail = async () => {
      setCheckingGmail(true);
      try {
        const res = await fetch("/api/gmail/is-connected");
        const data = await res.json();
        setGmailConnected(data.connected === true);
        setGmailEmail(data.email || null);
      } catch (err) {
        console.error("Failed to check Gmail status", err);
      } finally {
        setCheckingGmail(false);
      }
    };

    const checkOutlook = async () => {
      setCheckingOutlook(true);
      try {
        const res = await fetch("/api/oauth/microsoft/is-connected");
        const data = await res.json();
        setOutlookConnected(data.connected === true);
        setOutlookEmail(data.email || null);
      } catch (err) {
        console.error("Failed to check Outlook status", err);
      } finally {
        setCheckingOutlook(false);
      }
    };

    checkGmail();
    checkOutlook();
  }, []);

  const handleToggle = async (flowId: string, currentStatus: FlowStatus) => {
    const action = currentStatus === "active" ? "pause" : "resume";
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === flowId
          ? { ...flow, status: action === "pause" ? "inactive" : "active" }
          : flow
      )
    );

    try {
      const res = await fetch("/api/flow/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId, action }),
      });

      if (!res.ok) console.error("Toggle failed");
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  const getBadgeStyle = (status: FlowStatus) => {
    if (status === "active") return "bg-green-100 text-green-800";
    if (status === "error") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">My Flows</h1>
          <p className="text-muted-foreground">
            Manage and monitor your automation workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {checkingGmail ? (
            <span className="text-sm text-muted-foreground">Checking Gmail...</span>
          ) : gmailConnected && gmailEmail ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-700 border-green-700">
                Gmail: {gmailEmail}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await fetch("/api/oauth/gmail/disconnect");
                  setGmailConnected(false);
                  setGmailEmail(null);
                }}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => (window.location.href = "/api/oauth/gmail/start")}
              size="sm"
            >
              Connect Gmail
            </Button>
          )}

          {checkingOutlook ? (
            <span className="text-sm text-muted-foreground">Checking Outlook...</span>
          ) : outlookConnected && outlookEmail ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-700 border-blue-700">
                Outlook: {outlookEmail}
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await fetch("/api/oauth/microsoft/disconnect");
                  setOutlookConnected(false);
                  setOutlookEmail(null);
                }}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => (window.location.href = "/api/oauth/microsoft/redirect")}
              size="sm"
              variant="secondary"
            >
              Connect Outlook
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Flow List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">{flow.name}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeStyle(flow.status)}>
                        {flow.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{flow.runs}</TableCell>
                    <TableCell>{flow.lastRun}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggle(flow.id, flow.status)}
                      >
                        {flow.status === "active" ? "Pause" : "Resume"}
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}