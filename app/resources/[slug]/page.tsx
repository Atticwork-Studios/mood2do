import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticle, articles } from '../_content'

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const currentIndex = articles.findIndex(a => a.slug === slug)
  const prev = articles[currentIndex - 1]
  const next = articles[currentIndex + 1]

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>›</span>
        <Link href="/resources/getting-started" className="hover:text-gray-600">Guides</Link>
        <span>›</span>
        <span className="text-gray-600">{article.title}</span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
        {article.title}
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        {article.intro}
      </p>

      {article.image && (
        <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-10">
          <Image
            src={article.image}
            alt={article.title}
            width={1200}
            height={675}
            className="w-full h-auto"
          />
        </div>
      )}

      <div className="border-t border-gray-100 mb-10" />

      {/* Sections */}
      <div className="flex flex-col gap-10">
        {article.sections.map(section => (
          <div key={section.heading}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
            {section.body.map((para, i) => (
              <p key={i} className="text-gray-600 text-sm leading-relaxed mb-2">{para}</p>
            ))}
            {section.list && (
              <ul className="mt-3 flex flex-col gap-2">
                {section.list.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span style={{ color: 'var(--grain-primary)' }} className="font-bold mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between gap-4">
        {prev ? (
          <Link href={`/resources/${prev.slug}`} className="text-sm text-gray-500 hover:text-gray-900 group">
            <span className="block text-xs text-gray-400 mb-1">← Previous</span>
            <span className="font-medium group-hover:underline">{prev.title}</span>
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/resources/${next.slug}`} className="text-sm text-gray-500 hover:text-gray-900 text-right group">
            <span className="block text-xs text-gray-400 mb-1">Next →</span>
            <span className="font-medium group-hover:underline">{next.title}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
