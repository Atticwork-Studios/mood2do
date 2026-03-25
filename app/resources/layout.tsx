import MarketingNav from '@/app/components/MarketingNav'
import ResourcesSidebar from './_sidebar'

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <div className="w-full max-w-6xl mx-auto px-8 py-12 flex gap-12">
        <aside className="hidden md:block sticky top-24 self-start">
          <ResourcesSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  )
}
