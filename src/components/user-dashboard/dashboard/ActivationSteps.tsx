// components/dashboard/ActivationSteps.tsx
import { CheckCircle, XCircle, Clock } from "lucide-react"

export default function ActivationSteps({
  title = "Activation Steps",
  steps = [],
}: {
  title?: string
  steps: { title: string; status: "complete" | "pending" | "waiting" }[]
}) {
  const getIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "pending": return <XCircle className="w-5 h-5 text-orange-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 h-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.title} className="flex items-center gap-3">
            {getIcon(step.status)}
            <span className="text-sm text-gray-600">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}