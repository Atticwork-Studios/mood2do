import Link from 'next/link'
import MarketingNav from '@/app/components/MarketingNav'

const tiers = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Everything you need to get started.',
    cta: 'Start for free',
    href: '/sign-up',
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
    cta: 'Get Pro',
    href: '/sign-up',
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
    href: '/sign-up',
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

              <Link
                href={tier.href}
                className={`text-sm font-semibold text-center py-2.5 rounded-xl transition-opacity hover:opacity-90 ${
                  tier.highlight ? 'text-white' : 'text-gray-800 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
                style={tier.highlight ? { background: 'var(--grain-primary)' } : {}}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Payments not yet live — sign up free and we&apos;ll be in touch when Pro launches.
        </p>
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
