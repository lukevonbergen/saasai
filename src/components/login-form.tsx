"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard") // or wherever you want after login
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                <p className="text-balance text-white/70">
                  Login to your AutoFlow account
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-white/10 p-2 rounded">
                  {error}
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 text-white placeholder-white/60 border-white/20 focus-visible:ring-white"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm text-white/70 underline-offset-2 hover:underline"
                  >
                    Forgot?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 text-white placeholder-white/60 border-white/20 focus-visible:ring-white"
                />
              </div>

              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
                Login
              </Button>

              <div className="text-center text-sm text-white/70">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4 text-white hover:text-white">
                  Sign up
                </a>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-white/60 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}