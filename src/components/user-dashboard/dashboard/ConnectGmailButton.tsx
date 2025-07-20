// components/ConnectGmailButton.tsx
"use client";

import { Button } from "@/components/ui/button";

export function ConnectGmailButton() {
  const handleConnect = () => {
    window.location.href = "/api/oauth/gmail/start";
  };

  return (
    <Button onClick={handleConnect} variant="default">
      Connect Gmail
    </Button>
  );
}