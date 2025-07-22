'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FlowsPage() {
  const supabase = useSupabaseClient();

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

  const handleOutlookConnect = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Please log in first.");
      return;
    }

    document.cookie = `sb-access-token=${session.access_token}; path=/; Secure; SameSite=Lax`;
    window.location.href = "/api/oauth/microsoft/redirect";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Connect Accounts</h1>
          <p className="text-muted-foreground">
            Link your email providers to enable automation workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Gmail Section */}
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

          {/* Outlook Section */}
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
              onClick={handleOutlookConnect}
              size="sm"
              variant="secondary"
            >
              Connect Outlook
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
