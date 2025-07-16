"use client"

import {
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Clock,
  Zap,
  Settings,
  TrendingUp,
  Server,
} from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function DashboardContent({ email }: { email: string }) {
  return (
    <div className="space-y-8 px-6 py-4">
      <div>
        <h1 className="text-3xl font-bold">Welcome back 👋</h1>
        <p className="text-gray-600">
          Logged in as <span className="font-medium">{email}</span>
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Workflow Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Active Workflows" value="23" icon={PlayCircle} color="blue" />
          <StatCard title="Success Rate" value="97%" icon={CheckCircle} color="green" progress={97} />
          <StatCard title="Errors This Week" value="3" icon={AlertCircle} color="red" />
          <StatCard title="Avg Completion Time" value="12.4s" icon={Clock} color="yellow" />
          <StatCard title="Queue Backlog" value="4 pending" icon={Zap} color="purple" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
        <div className="flex gap-6">
          <CircleCard title="ROI" percentage={82} />
          <CircleCard title="Time Saved" percentage={65} />
          <CircleCard title="Workflows Completed" percentage={91} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Resource Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="API Calls Today" value="1,204" icon={Server} color="indigo" />
          <StatCard title="Tokens Used" value="9,487" icon={Zap} color="purple" />
          <StatCard title="System Uptime" value="99.99%" icon={TrendingUp} color="green" progress={99.99} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Start New Flow" value="↗" icon={PlayCircle} color="blue" />
          <StatCard title="Settings" value="Edit" icon={Settings} color="gray" />
          <StatCard title="Recent Activity" value="View All" icon={Clock} color="yellow" />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  progress,
  color = "blue",
}: {
  title: string
  value: string | number
  icon: any
  progress?: number
  color?: string
}) {
  return (
    <div className="flex items-center bg-white border rounded-xl p-5 shadow-sm space-x-4">
      <div className={`rounded-full p-3 bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {progress !== undefined && (
          <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
            <div
              className={`bg-${color}-500 h-2 rounded-full`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CircleCard({ title, percentage }: { title: string; percentage: number }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm text-center w-40">
      <div className="w-20 mx-auto">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: "#1f2937",
            pathColor: "#3b82f6",
            trailColor: "#e5e7eb",
          })}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">{title}</p>
    </div>
  )
}