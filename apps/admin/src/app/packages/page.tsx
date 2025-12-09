'use client'

import { Navigation } from '@/components/Navigation'
import { PackageList } from '@/components/packages/PackageList'

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <PackageList />
    </div>
  )
}