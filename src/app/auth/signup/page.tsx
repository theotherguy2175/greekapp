'use client'

import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-800 text-center mb-8">
        Create your account
      </h1>
      <SignUpForm />
    </div>
  )
}
