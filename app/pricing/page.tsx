'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MarketingNav from '@/app/components/MarketingNav'
import { createClient } from '@/lib/supabase/client'

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!

const tiers = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Everything you need to get started.',
    cta: 'Start for free',
    href: '/sign-up',
    priceId: null,
    highlight: false,
    features: [
      'Up to 25 tasks',
      'Mood-matched task picker',
      'Work and Personal spaces',
      'Task timer',
      'Pomodoro timer',
      'Brain dump',
      'Snooze tasks',
    ],
  },
  {
    name: 'Pro Monthly',
    price: '£3.99',
    period: 'per month',
    description: 'Unlimited tasks and full insights.',
    cta: 'Get Pro Monthly',
    href: null,
    priceId: MONTHLY_PRICE_ID,
    highlight: true,
    features: [
      'Unlimited tasks',
      'Everything in Free',
      'Full insights & patterns',
      'Mood history',
      'Priority support',
    ],
  },
  {
    name: 'Pro Annual',
    price: '£39.99',
    period: 'per year',
    description: 'Best value — save £8 vs monthly.',
    cta: 'Get Pro Annual',
    href: null,
    priceId: ANNUAL_PRICE_ID,
    highlight: false,
    features: [
      'Unlimited tasks',
      'Everything in Free',
      'Full insights & patterns',
      'Mood history',
      'Priority support',
      '2 months free vs monthly',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(priceId: string) {
    setLoading(priceId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/sign-in?redirect=/pricing')
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
    })

    const { url, error } = await res.json()
    if (error) {
      alert('Something went wrong. Please try again.')
      setLoading(null)
      return
    }

    window.location.href = url
  }

  return (
    <>
      <MarketingNav />

      <div className="w-full max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em' }}>
            Simple, honest pricing
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Start free with no card required. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 flex flex-col ${
                tier.highlight
                  ? 'shadow-lg border-2'
                  : 'border border-gray-200 bg-white shadow-sm'
              }`}
              style={tier.highlight ? {
                borderColor: 'var(--grain-primary)',
                background: 'var(--grain-primary-light)',
              } : {}}
            >
              {tier.highlight && (
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4"
                  style={{ background: 'var(--grain-primary)', color: 'white' }}
                >
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900 mb-1">{tier.name}</h2>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.03em' }}>{tier.price}</span>
                <span className="text-sm text-gray-400 ml-1">{tier.period}</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">{tier.description}</p>

              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span style={{ color: 'var(--grain-primary)' }} className="mt-0.5 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {tier.href ? (
                <Link
                  href={tier.href}
                  className="text-sm font-semibold text-center py-2.5 rounded-xl transition-opacity hover:opacity-90 text-gray-800 bg-white border border-gray-200 hover:bg-gray-50"
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(tier.priceId!)}
                  disabled={loading === tier.priceId}
                  className={`text-sm font-semibold text-center py-2.5 rounded-xl transition-opacity hover:opacity-90 ${
                    tier.highlight ? 'text-white' : 'text-gray-800 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                  style={tier.highlight ? { background: 'var(--grain-primary)' } : {}}
                >
                  {loading === tier.priceId ? 'Redirecting…' : tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8">
        <div className="w-full max-w-6xl mx-auto px-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Atticwork Studios &nbsp;·&nbsp;{' '}
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            &nbsp;·&nbsp;{' '}
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          </p>
        </div>
      </footer>
    </>
  )
}
