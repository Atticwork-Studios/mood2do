'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Reset your password</h1>

        {sent ? (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">Check your email — we&apos;ve sent a reset link to <strong>{email}</strong>.</p>
            <p className="text-xs text-gray-400 mb-6">If it doesn&apos;t arrive, check your spam folder.</p>
            <Link href="/sign-in" className="text-sm font-medium" style={{ color: 'var(--grain-primary)' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-6">Enter your email and we&apos;ll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="text-white rounded-lg py-2 font-medium disabled:opacity-50 hover:opacity-90"
                style={{ background: 'var(--grain-primary)' }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-sm mt-4 text-gray-500">
              <Link href="/sign-in" className="hover:underline" style={{ color: 'var(--grain-primary)' }}>
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
