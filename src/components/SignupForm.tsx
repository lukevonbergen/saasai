"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid" // for generating org ID

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Force logout any existing session (clean slate)
    await supabase.auth.signOut()

    // Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("That email is already in use. Try logging in.")
      } else {
        setError(signUpError.message)
      }
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setError("Signup failed. No user ID returned.")
      return
    }

    // Create org
    const orgId = uuidv4()
    const { error: orgError } = await supabase.from("organizations").insert({
      id: orgId,
      name: form.company_name,
    })

    if (orgError) {
      setError("Failed to create organization: " + orgError.message)
      return
    }

    // Insert profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: form.first_name,
      last_name: form.last_name,
      company_name: form.company_name,
      phone: form.phone,
    })

    if (profileError) {
      setError("Failed to create profile: " + profileError.message)
      return
    }

    // Add as admin to org
    const { error: memberError } = await supabase.from("organization_members").insert({
      org_id: orgId,
      user_id: userId,
      role: "admin",
    })

    if (memberError) {
      setError("Failed to link user to org: " + memberError.message)
      return
    }

    // Redirect
    router.push("/dashboard")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-white">Create an account</h1>
                <p className="text-white/70">Sign up to AutoFlow and start building automations.</p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-white/10 p-2 rounded">{error}</p>
              )}

              {["first_name", "last_name", "company_name", "phone", "email", "password", "confirmPassword"].map((id) => (
                <div key={id} className="grid gap-2">
                  <Label htmlFor={id} className="text-white">
                    {id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                  <Input
                    id={id}
                    name={id}
                    type={id.toLowerCase().includes("password") ? "password" : id === "email" ? "email" : id === "phone" ? "tel" : "text"}
                    value={form[id as keyof typeof form]}
                    onChange={handleChange}
                    required
                    className="bg-white/10 text-white placeholder-white/60 border-white/20 focus-visible:ring-white"
                  />
                </div>
              ))}

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
                Sign Up
              </Button>

              <div className="text-center text-sm text-white/70">
                Already have an account? <a href="/login" className="underline underline-offset-4 text-white hover:text-white">Log in</a>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Signup Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-white/60">
        By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
