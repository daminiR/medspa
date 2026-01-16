import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { InvoiceProvider } from '@/contexts/InvoiceContext'
import { ChartingSettingsProvider } from '@/contexts/ChartingSettingsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ScreenLock } from '@/components/auth/ScreenLock'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dalphene - Admin Portal',
  description: 'Comprehensive medical spa management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <AuthProvider>
          <InvoiceProvider>
            <ChartingSettingsProvider>
              {children}
              <ScreenLock />
            </ChartingSettingsProvider>
          </InvoiceProvider>
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
