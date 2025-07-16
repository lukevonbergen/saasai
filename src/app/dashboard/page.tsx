import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import StatCard from "@/components/user-dashboard/dashboard/StatCard"
import ActivationSteps from "@/components/user-dashboard//dashboard/ActivationSteps"
import InboxPreview from "@/components/user-dashboard//dashboard/InboxPreview"
import CreateAutomation from "@/components/user-dashboard//dashboard/CreateAutomation"
import { MailIcon, Users,  } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="p-6 text-lg text-gray-600">Not logged in</p>
  }

  // Fetch first name from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single()

  const firstName = profile?.first_name || "there"
  const steps = [
    { title: "Install X-Ray", status: "complete" },
    { title: "Connect Email", status: "pending" },
    { title: "Connect CRM", status: "pending" },
    { title: "Create First Workflow", status: "waiting" },
  ]



  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
    Welcome back, {firstName}
  </h1>
  <p className="mt-1 text-sm text-gray-500">Here’s what’s happening in your account today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
<StatCard
  title="Emails Sent"
  value={340}
  icon={<MailIcon className="w-5 h-5" />}
  note="Week-to-date"
  extraInfo="Last updated 45 mins ago"
/>

<StatCard
  title="Replies Received"
  value={76}
  icon={<MailIcon className="w-5 h-5" />}
  note="Avg reply rate: 22%"
  extraInfo="Last updated 10 mins ago"
/>

<StatCard
  title="New Leads Captured"
  value={58}
  icon={<Users className="w-5 h-5" />}
  note="Via website & landing pages"
  extraInfo="Synced from forms 2 hours ago"
/>
        {/* More StatCards */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActivationSteps
  title="Setup Checklist"
  steps={[
    { title: "Install X-Ray", status: "complete" },
    { title: "Connect Email", status: "pending" },
    { title: "Connect CRM", status: "pending" },
  ]}
/>

<CreateAutomation
  title="Create a new Automation"
  description="Start automating your outreach today."
/>

<InboxPreview
  title="Latest Lead Messages"
  gmailConnected
  leads={[
    {
      name: "Emily Butler",
      email: "emily.butler@example.com",
      subject: "Follow-up on Shoreditch flat",
      message: "Hey, just checking if the 2-bed in Shoreditch is still available? I can view this week.",
      time: "2 hours ago",
      actionType: "calendar",
    },
    {
      name: "Eugenia Bates",
      email: "eugenia.bates@example.com",
      subject: "Requesting call back",
      message: "Can you give me a call tomorrow around 3pm about the Paddington listing?",
      time: "1 day ago",
      actionType: "calendar",
    },
    {
      name: "Liam O’Connor",
      email: "liam.oconnor@hotmail.co.uk",
      subject: "Interest in Brixton 1-bed",
      message: "Hi, is the Brixton 1-bed still open for viewings? Looking to move in August.",
      time: "5 hours ago",
      actionType: "response",
    },
    {
      name: "Sophie Patel",
      email: "sophie.patel@gmail.com",
      subject: "Offer submitted for Clapham house",
      message: "Just submitted an offer for the Clapham 3-bed. Let me know next steps please.",
      time: "6 minutes ago",
      actionType: "response",
    },
    {
      name: "Marcus Lee",
      email: "marcus.lee@propertymail.com",
      subject: "Docs sent for Canary Wharf let",
      message: "I’ve emailed over proof of income + ID. Can you confirm you’ve received them?",
      time: "Yesterday",
      actionType: "response",
    },
    {
      name: "Jasmine N.",
      email: "jas.n@hotmail.com",
      subject: "Question about deposit terms",
      message: "What’s the deposit required for the Battersea studio? I can pay upfront if needed.",
      time: "2 days ago",
      actionType: "response",
    },
    {
      name: "Ollie R.",
      email: "ollie.r90@gmail.com",
      subject: "Looking to book viewing this week",
      message: "Hey, I’m available after 5pm Weds or Thurs. Can I view the Islington property?",
      time: "3 hours ago",
      actionType: "calendar",
    },
    {
      name: "Hannah West",
      email: "hannah.west@outlook.com",
      subject: "Parking availability at Richmond flat",
      message: "Does the 2-bed in Richmond come with a parking space? Important for me.",
      time: "4 days ago",
      actionType: "response",
    }
  ]}
/>
      </div>
    </div>
  )
}