// /pages/api/gmail/send-test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Unauthenticated" });

  const { data: tokenRow } = await supabase
    .from("gmail_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow?.access_token) {
    return res.status(400).json({ error: "No Gmail access token found" });
  }

  const emailBody = [
    "From: me",
    "To: lmvonbergen01@gmail.com",
    "Subject: Hello from Gmail API!",
    "",
    "This is a test email sent from your connected Gmail account.",
  ].join("\n");

  const encodedMessage = Buffer.from(emailBody).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

  const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenRow.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  const sendData = await sendRes.json();

  if (!sendRes.ok) {
    console.error("Send failed", sendData);
    return res.status(500).json({ error: "Failed to send email", details: sendData });
  }

  return res.status(200).json({ success: true, id: sendData.id });
}