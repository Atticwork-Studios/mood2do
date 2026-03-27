'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/" style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.25rem', color: 'var(--grain-primary)' }}>
          Mood2do
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-gray-900">Resources</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: 'var(--grain-primary)' }}
          >
            Start for free →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-8 py-4 flex flex-col gap-4">
          <Link href="/resources" className="text-sm font-medium text-gray-600" onClick={() => setOpen(false)}>Resources</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/sign-in" className="text-sm font-medium text-gray-600" onClick={() => setOpen(false)}>Log in</Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-white px-4 py-3 rounded-lg text-center hover:opacity-90 transition-opacity"
            style={{ background: 'var(--grain-primary)' }}
            onClick={() => setOpen(false)}
          >
            Start for free →
          </Link>
        </div>
      )}
    </nav>
  )
}
