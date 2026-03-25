'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const linkClass = (path: string) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      pathname === path
        ? 'bg-orange-50 text-orange-800'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/home" style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.15rem', color: 'var(--grain-primary)' }}>
          Mood2do
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/work" className={linkClass('/work')}>Work</Link>
          <Link href="/personal" className={linkClass('/personal')}>Personal</Link>
          <Link href="/tasks" className="ml-3 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-md">
            Task list
          </Link>
          <Link href="/insights" className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-md">
            Insights
          </Link>
          <Link href="/settings" className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-1 rounded-md">
            Settings
          </Link>
          <button
            onClick={signOut}
            className="ml-2 text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/work" onClick={() => setMenuOpen(false)} className={linkClass('/work')}>Work</Link>
          <Link href="/personal" onClick={() => setMenuOpen(false)} className={linkClass('/personal')}>Personal</Link>
          <Link href="/tasks" onClick={() => setMenuOpen(false)} className={linkClass('/tasks')}>Task list</Link>
          <Link href="/insights" onClick={() => setMenuOpen(false)} className={linkClass('/insights')}>Insights</Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} className={linkClass('/settings')}>Settings</Link>
          <button
            onClick={signOut}
            className="text-left text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 mt-1"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
