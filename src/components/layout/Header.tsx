'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { clsx } from 'clsx'

const tabs = [
  { name: 'Dictionary', href: '/' },
  { name: 'Flash Cards', href: '/flashcards' },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-xl font-bold text-stone-800 tracking-tight">
            <span className="text-amber-700">Koiné</span> Lexicon
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-stone-500">
                  {session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-1 -mb-px">
          {tabs.map(tab => {
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-amber-700 text-amber-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
