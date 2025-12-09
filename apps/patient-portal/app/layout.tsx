import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxe Medical Spa - Patient Portal',
  description: 'Book appointments, view records, and manage your treatments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}