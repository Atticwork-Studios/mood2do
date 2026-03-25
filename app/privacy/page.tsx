import Link from 'next/link'
import MarketingNav from '@/app/components/MarketingNav'

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <main className="w-full max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Who we are</h2>
            <p className="text-gray-600">
              Mood2do is operated by Atticwork Studios, a UK-based sole trader. Our ICO registration number is <strong>[PENDING — to be added within 2 working days]</strong>.
            </p>
            <p className="text-gray-600 mt-2">
              If you have any questions about this policy, contact us at{' '}
              <a href="mailto:hello@mood2do.co.uk" className="underline hover:text-gray-900">hello@mood2do.co.uk</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">What data we collect</h2>
            <p className="text-gray-600">We collect only what is necessary to provide the service:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li><strong>Email address</strong> — used to create your account and send you transactional emails (account confirmation, password reset).</li>
              <li><strong>Name</strong> — used to personalise your experience within the app. Providing this is optional.</li>
              <li><strong>Tasks and mood data</strong> — the tasks you create and the moods you log are stored to power the app's features. This data is private to your account.</li>
            </ul>
            <p className="text-gray-600 mt-2">We do not collect payment information directly. If payments are introduced, they will be handled by a PCI-compliant third party (Stripe).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>To provide and maintain your account</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To show you personalised task and mood insights within the app</li>
              <li>To improve the service based on aggregated, anonymised usage patterns</li>
            </ul>
            <p className="text-gray-600 mt-2">We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Legal basis for processing</h2>
            <p className="text-gray-600">
              Under UK GDPR, we process your data on the basis of <strong>contract</strong> (to provide the service you signed up for) and <strong>legitimate interests</strong> (to improve and maintain the app).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Who we share data with</h2>
            <p className="text-gray-600">We use a small number of trusted third-party services to run Mood2do:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li><strong>Supabase</strong> — database and authentication (data stored in the EU)</li>
              <li><strong>Vercel</strong> — hosting and deployment</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
            </ul>
            <p className="text-gray-600 mt-2">Each of these providers processes data only as necessary to deliver their service and is bound by their own privacy policies and data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">How long we keep your data</h2>
            <p className="text-gray-600">
              We retain your data for as long as your account is active. If you delete your account, all your personal data — including your tasks and mood history — is permanently deleted immediately. We do not retain backups of deleted accounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your rights</h2>
            <p className="text-gray-600">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (you can do this directly in Settings → Danger zone)</li>
              <li>Object to or restrict processing</li>
              <li>Lodge a complaint with the ICO at <a href="https://ico.org.uk" className="underline hover:text-gray-900">ico.org.uk</a></li>
            </ul>
            <p className="text-gray-600 mt-2">To exercise any of these rights, email us at <a href="mailto:hello@mood2do.co.uk" className="underline hover:text-gray-900">hello@mood2do.co.uk</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cookies</h2>
            <p className="text-gray-600">
              Mood2do uses only essential cookies required for authentication and session management. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Changes to this policy</h2>
            <p className="text-gray-600">
              We may update this policy from time to time. We will notify users of significant changes by email. The date at the top of this page reflects when it was last updated.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Mood2do</Link>
        </div>
      </main>
    </>
  )
}
