import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = cookies(); // required in new Next.js versions
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { user }, error } = await supabase.auth.getUser();

  const email = user?.email ?? "Unknown User";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back 👋</h1>
        <p className="text-gray-600">Logged in as <span className="font-medium">{email}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Flows" value="23" />
        <StatCard title="Runs This Month" value="487" />
        <StatCard title="Errors in Last 7 Days" value="3" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Runs</h2>
        <div className="bg-white border rounded-md p-4 text-sm text-gray-700">
          <p>No recent executions found.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-md p-4 shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}