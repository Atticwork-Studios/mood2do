'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { articles } from './_content'

export default function ResourcesSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-56 flex-shrink-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Guides</p>
      <ul className="flex flex-col gap-0.5">
        {articles.map(article => {
          const href = `/resources/${article.slug}`
          const active = pathname === href
          return (
            <li key={article.slug}>
              <Link
                href={href}
                className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  active
                    ? 'font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={active ? {
                  background: 'var(--grain-primary-light)',
                  color: 'var(--grain-primary-dark)',
                  borderLeft: '2px solid var(--grain-primary)',
                } : {}}
              >
                {article.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
