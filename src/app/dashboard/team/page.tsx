"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  phone: string
  company_name: string
  role: string
  joined_at: string
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      if (!userId) return

      // Step 1: Get org_id for current user
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", userId)
        .single()

      if (memberError || !memberData) return console.error("No org found", memberError)

      const orgId = memberData.org_id

      // Step 2: Get all members of this org
      const { data: teamData, error: teamError } = await supabase
        .from("organization_members")
        .select("user_id, role, joined_at, profiles(first_name, last_name, phone, company_name)")
        .eq("org_id", orgId)

      if (teamError) {
        console.error("Error fetching team", teamError)
        return
      }

      const parsed = teamData.map((member) => ({
        id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        first_name: member.profiles?.first_name || "",
        last_name: member.profiles?.last_name || "",
        phone: member.profiles?.phone || "",
        company_name: member.profiles?.company_name || "",
      }))

      setTeam(parsed)
      setLoading(false)
    }

    fetchTeam()
  }, [])

  if (loading) {
    return <p className="p-4 text-gray-600">Loading team members...</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Members</h1>
      <div className="overflow-auto border rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} className="border-t text-sm">
                <td className="p-2">{member.first_name} {member.last_name}</td>
                <td className="p-2">{member.company_name}</td>
                <td className="p-2">{member.phone}</td>
                <td className="p-2 capitalize">{member.role}</td>
                <td className="p-2">{new Date(member.joined_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}