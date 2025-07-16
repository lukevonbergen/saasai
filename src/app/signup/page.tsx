import { SignupForm } from "@/components/SignupForm"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  )
}