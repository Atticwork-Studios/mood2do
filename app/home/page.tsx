'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import WelcomeModal from '@/app/components/WelcomeModal'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const { data } = await supabase
        .from('profiles')
        .select('name, welcomed')
        .eq('id', user.id)
        .single()

      setName(data?.name ?? null)
      setLoading(false)

      if (!data?.welcomed) {
        setShowWelcome(true)
      }
    }
    load()
  }, [router])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  if (loading) return (
    <>
      <NavBar />
      <div className="p-8 text-gray-400">Loading…</div>
    </>
  )

  return (
    <>
      <NavBar />
      <main className="w-full max-w-5xl mx-auto px-8 py-12">

        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}{name ? `, ${name}` : ''}.
          </h1>
          {name ? (
            <p className="text-gray-500 mt-2">Where are you starting today?</p>
          ) : (
            <p className="text-gray-500 mt-2">
              What shall I call you?{' '}
              <Link href="/settings" className="underline hover:text-gray-800" style={{ color: 'var(--grain-primary)' }}>
                Set your name in Settings →
              </Link>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link href="/work" className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
              <div
                className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center text-white text-lg font-bold"
                style={{ background: 'var(--grain-primary)' }}
              >
                W
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">Work</h2>
              <p className="text-sm text-gray-400">Tasks, focus, and deadlines for your working day.</p>
            </Link>

            <Link href="/personal" className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl mb-5 bg-purple-500 flex items-center justify-center text-white text-lg font-bold">
                P
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">Personal</h2>
              <p className="text-sm text-gray-400">Everything outside of work — life, hobbies, errands.</p>
            </Link>
          </div>

          <Link href="/tasks" className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center gap-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              +
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">Brain dump</h2>
              <p className="text-sm text-gray-400">Capture tasks quickly — add, edit, and organise your full task list.</p>
            </div>
          </Link>
        </div>

      </main>

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </>
  )
}
