'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, FileText, ArrowRight } from 'lucide-react'
import { navigation } from '@/lib/navigation'

interface SearchResult {
  title: string
  href: string
  section: string
  description?: string
}

// Flatten navigation for search
function getAllPages(): SearchResult[] {
  const pages: SearchResult[] = []

  navigation.forEach(section => {
    section.items.forEach(item => {
      pages.push({
        title: item.title,
        href: item.href,
        section: section.title,
      })

      if (item.items) {
        item.items.forEach(subItem => {
          pages.push({
            title: subItem.title,
            href: subItem.href,
            section: `${section.title} > ${item.title}`,
          })
        })
      }
    })
  })

  return pages
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const allPages = getAllPages()

  // Handle keyboard shortcut to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerms = query.toLowerCase().split(' ')
    const filtered = allPages.filter(page => {
      const searchText = `${page.title} ${page.section}`.toLowerCase()
      return searchTerms.every(term => searchText.includes(term))
    })

    setResults(filtered.slice(0, 8))
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation in results
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      router.push(results[selectedIndex].href)
      setIsOpen(false)
      setQuery('')
    }
  }, [results, selectedIndex, router])

  const handleResultClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documentation..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.href}
                    onClick={() => handleResultClick(result.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <FileText className={`w-5 h-5 flex-shrink-0 ${
                      index === selectedIndex ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        index === selectedIndex ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{result.section}</p>
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="px-4 py-6">
                <p className="text-sm font-medium text-gray-500 mb-3">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Calendar', 'SMS', 'Booking', 'Billing', 'Stripe', 'Twilio'].map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
