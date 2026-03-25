import Link from 'next/link'
import MarketingNav from '@/app/components/MarketingNav'

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <main className="w-full max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.03em' }}>Terms and Conditions</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Who we are</h2>
            <p className="text-gray-600">
              Mood2do is a web application operated by Atticwork Studios, a UK-based sole trader. By creating an account and using Mood2do, you agree to these terms. If you do not agree, please do not use the service.
            </p>
            <p className="text-gray-600 mt-2">
              Questions? Contact us at <a href="mailto:hello@mood2do.co.uk" className="underline hover:text-gray-900">hello@mood2do.co.uk</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">The service</h2>
            <p className="text-gray-600">
              Mood2do is a productivity app designed to help users manage tasks in relation to their mood and energy levels. We provide the service on a free and paid basis as described on our <Link href="/pricing" className="underline hover:text-gray-900">pricing page</Link>.
            </p>
            <p className="text-gray-600 mt-2">
              We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will give reasonable notice where possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your account</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You may not use the service for any unlawful purpose.</li>
              <li>You may delete your account at any time from Settings. All your data will be permanently removed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your content</h2>
            <p className="text-gray-600">
              You own the tasks and data you create in Mood2do. We do not claim any rights over your content. You grant us a limited licence to store and process your content solely for the purpose of providing the service to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Paid plans</h2>
            <p className="text-gray-600">
              Paid subscriptions are billed monthly or annually as selected at checkout. Payments are processed by Stripe. You may cancel at any time — cancellation takes effect at the end of the current billing period. We do not offer refunds for partial periods.
            </p>
            <p className="text-gray-600 mt-2">
              We reserve the right to change pricing with reasonable notice. Existing subscribers will be notified by email before any price change takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Acceptable use</h2>
            <p className="text-gray-600">You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>Use the service in any way that violates applicable UK law</li>
              <li>Attempt to gain unauthorised access to any part of the service</li>
              <li>Interfere with or disrupt the service or its infrastructure</li>
              <li>Use automated tools to scrape or extract data from the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Disclaimer of warranties</h2>
            <p className="text-gray-600">
              Mood2do is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or suitable for any particular purpose. Use of the service is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Limitation of liability</h2>
            <p className="text-gray-600">
              To the fullest extent permitted by UK law, Atticwork Studios shall not be liable for any indirect, incidental, or consequential damages arising from your use of Mood2do. Our total liability to you shall not exceed the amount you have paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Governing law</h2>
            <p className="text-gray-600">
              These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Changes to these terms</h2>
            <p className="text-gray-600">
              We may update these terms from time to time. We will notify you by email of significant changes. Continued use of the service after changes take effect constitutes acceptance of the updated terms.
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
