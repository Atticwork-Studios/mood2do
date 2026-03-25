'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
        <div className="text-center mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Mood2do</Link>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign in to Mood2do</h1>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-500">
          No account yet?{' '}
          <Link href="/sign-up" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
