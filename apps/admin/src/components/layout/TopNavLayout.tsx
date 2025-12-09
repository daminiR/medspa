'use client'

import TopNav from './TopNav'

export default function TopNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
}