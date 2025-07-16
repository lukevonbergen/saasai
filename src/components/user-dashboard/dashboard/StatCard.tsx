"use client"

import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  note?: string
  extraInfo?: string
  className?: string
}

export default function StatCard({
  title,
  value,
  icon,
  note,
  extraInfo,
  className = "",
}: StatCardProps) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border border-gray-200 bg-white
      transition-all duration-300 p-6 ${className}
    `}>
      <div className="flex flex-col space-y-4">
        {/* Icon */}
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 text-white shadow-sm">
            {icon}
          </div>
        )}

        {/* Title + Value */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Notes */}
        {note && <p className="text-xs text-gray-500">{note}</p>}
        {extraInfo && <p className="text-xs text-gray-400">{extraInfo}</p>}
      </div>
    </div>
  )
}