'use client'

import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-800 text-center mb-8">
        Sign in to <span className="text-amber-700">Koiné</span> Lexicon
      </h1>
      <SignInForm />
    </div>
  )
}
