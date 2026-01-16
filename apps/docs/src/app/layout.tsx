import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SearchDialog } from '@/components/layout/SearchDialog'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Luxe MedSpa Documentation',
  description: 'Complete documentation for Luxe MedSpa EMR - The modern medical spa management platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Sidebar />
        <SearchDialog />
        <main className="ml-[280px] pt-16 min-h-screen">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
