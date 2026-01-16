'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  title: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('h2, h3'))
    const items: TocItem[] = elements.map((element) => ({
      id: element.id,
      title: element.textContent || '',
      level: parseInt(element.tagName.charAt(1)),
    }))
    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -66% 0px' }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <aside className="hidden xl:block fixed right-8 top-24 w-56">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        On this page
      </h4>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              'toc-link',
              heading.level === 3 && 'pl-4',
              activeId === heading.id && 'active'
            )}
          >
            {heading.title}
          </a>
        ))}
      </nav>
    </aside>
  )
}
