import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const dummyFlows = [
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Flows</h1>
          <p className="text-muted-foreground">Manage and monitor your automation workflows.</p>
        </div>
        <Button variant="default" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> New Flow
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Flow List</CardTitle>
        </CardHeader>
        <CardContent>
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
              {dummyFlows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">{flow.name}</TableCell>
                  <TableCell>
                    <Badge className={
                      flow.status === "active"
                        ? "bg-green-100 text-green-800"
                        : flow.status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-700"
                    }>
                      {flow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{flow.runs}</TableCell>
                  <TableCell>{flow.lastRun}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}