import type { NextApiRequest, NextApiResponse } from "next";

type Action = "pause" | "resume";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { flowId, action } = req.body;

  if (!flowId || !["pause", "resume"].includes(action)) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  // 🔧 TO DO: Integrate with real n8n toggle logic later
  console.log(`Received toggle request for flow ${flowId}: ${action}`);

  // Simulate a short delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return res.status(200).json({ success: true, newStatus: action === "pause" ? "inactive" : "active" });
}