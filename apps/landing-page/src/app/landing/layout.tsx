import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dalphene | The Future of MedSpa Management',
  description: 'AI-powered medical spa management platform with 3D charting, intelligent scheduling, and seamless patient communication. Built specifically for modern medical spas.',
  openGraph: {
    title: 'Dalphene',
    description: 'AI-powered medical spa management with 3D anatomical charting',
    type: 'website',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout bypasses the main admin layout for a clean landing page
  return <>{children}</>
}
