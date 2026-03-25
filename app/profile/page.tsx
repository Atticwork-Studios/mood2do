'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/app/components/NavBar'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      if (data?.name) setName(data.name)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name })

    if (error) {
      setMessage('Could not save — please try again.')
      setSaving(false)
    } else {
      router.push('/home')
    }
  }

  if (loading) return (
    <>
      <NavBar />
      <div className="p-8 text-gray-600">Loading…</div>
    </>
  )

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your profile</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-sm">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {message && (
              <p className={`text-sm ${message === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
