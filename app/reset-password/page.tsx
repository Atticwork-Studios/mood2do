'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords don\'t match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/home')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Choose a new password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Pick something you&apos;ll remember.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">New password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
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
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </main>
  )
}
