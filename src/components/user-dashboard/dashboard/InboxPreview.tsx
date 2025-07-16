import { Sparkles } from "lucide-react"

export type LeadEmail = {
  name: string
  email: string
  subject: string
  message: string
  time: string
  actionType: "calendar" | "response"
}

export default function InboxPreview({
  title = "Lead Inbox",
  gmailConnected = true,
  leads,
}: {
  title?: string
  gmailConnected?: boolean
  leads: LeadEmail[]
}) {
  return (
    <div className="col-span-2 rounded-2xl bg-white border border-gray-200 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          <span className="flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI Activated
          </span>
        </div>
        {gmailConnected && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
            Gmail Connected
          </span>
        )}
      </div>

      {/* Lead List */}
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {leads.map((lead) => (
          <div
            key={`${lead.email}-${lead.time}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
              <p className="text-xs text-gray-500">{lead.email}</p>
              <p className="text-sm font-medium text-gray-700 truncate">{lead.subject}</p>
              <p className="text-sm text-gray-500 truncate">{lead.message}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400">{lead.time}</span>
              <button
                className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition"
              >
                {lead.actionType === "calendar" ? "Send Calendar Invite" : "Generate Response"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}