'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions to continue.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (data.user || (error?.message ?? '').toLowerCase().includes('sending confirmation email')) {
      // Save consent flags to profile
      const userId = data.user?.id
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          marketing_consent: marketingConsent,
          terms_accepted_at: new Date().toISOString(),
        })
      }
      router.push('/check-email')
    } else {
      setError(error?.message ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Create your account</h1>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-indigo-600 flex-shrink-0"
              />
              <span className="text-xs text-gray-600">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={e => setMarketingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-indigo-600 flex-shrink-0"
              />
              <span className="text-xs text-gray-600">
                I&apos;d like to receive occasional news and updates about Mood2do (optional)
              </span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending confirmation email…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-500">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
