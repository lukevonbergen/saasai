// components/dashboard/CreateAutomation.tsx
export default function CreateAutomation({
  title,
  description,
  buttonText = "Create Automation",
  onClick,
}: {
  title: string
  description: string
  buttonText?: string
  onClick?: () => void
}) {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
        <p className="text-sm text-blue-700">{description}</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  )
}