import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Globe, Smartphone, Calendar, Camera, MessageCircle, Gift, User, Shield, CheckCircle2, Zap } from 'lucide-react'

export default function PatientPortalPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Globe className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 85% Complete
        </span>
      </div>
      <h1>Patient Portal (Web)</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        A modern, responsive web portal that allows patients to manage their appointments,
        photos, messages, and rewards from any browser. Built with Next.js 15 for optimal
        performance and SEO.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Patient Portal Overview"
        duration="5 min"
        description="Tour the patient-facing web portal and learn how patients interact with your practice online"
      />

      <Callout type="success" title="Production Ready">
        The Patient Portal is fully implemented with all core pages, authentication flows,
        and responsive design. Ready for deployment with minimal configuration.
      </Callout>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Online Booking</h3>
          </div>
          <p className="text-sm text-gray-500">3-step booking wizard with service selection, date/time picker, and confirmation. Fully responsive.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Appointment Management</h3>
          </div>
          <p className="text-sm text-gray-500">View upcoming/past appointments, reschedule, cancel, download receipts, add to calendar.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Photo Gallery</h3>
          </div>
          <p className="text-sm text-gray-500">Before/after photos with side-by-side comparison, treatment filtering, drag-and-drop upload.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Secure Messaging</h3>
          </div>
          <p className="text-sm text-gray-500">Two-way messaging with staff, attachment support, real-time notifications.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Rewards & Referrals</h3>
          </div>
          <p className="text-sm text-gray-500">View loyalty rewards, track referrals, share codes with QR codes and social sharing.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Modern Authentication</h3>
          </div>
          <p className="text-sm text-gray-500">Magic link login, SMS OTP, social login (Google, Facebook, Apple), WebAuthn/Passkeys.</p>
        </div>
      </div>

      <h2 id="tech-stack">Technology Stack</h2>
      <p>Built with modern web technologies for optimal performance:</p>
      <ul>
        <li><strong>Framework:</strong> Next.js 15 with App Router for SSR and optimal SEO</li>
        <li><strong>Language:</strong> TypeScript for type safety</li>
        <li><strong>Styling:</strong> Tailwind CSS with shadcn/ui components</li>
        <li><strong>State Management:</strong> Zustand for global state, TanStack Query for server state</li>
        <li><strong>Forms:</strong> React Hook Form with Zod validation</li>
        <li><strong>Authentication:</strong> NextAuth v5 with multiple providers</li>
        <li><strong>PWA:</strong> Progressive Web App with offline support</li>
      </ul>

      <h2 id="pages">Portal Pages</h2>

      <h3 id="dashboard">Dashboard</h3>
      <p>
        The patient&apos;s home base showing everything at a glance:
      </p>
      <ul>
        <li>Personalized welcome message</li>
        <li>Interactive membership card with tier and points progress</li>
        <li>Quick action buttons (Book, Photos, Rewards, Messages)</li>
        <li>Upcoming appointments preview</li>
        <li>Recent photos gallery</li>
        <li>Responsive 2-column (desktop) / single-column (mobile) layout</li>
      </ul>

      <h3 id="booking">3-Step Booking Flow</h3>
      <p>Streamlined booking wizard:</p>
      <ol>
        <li><strong>Select Service</strong> &mdash; Browse services with search and filters</li>
        <li><strong>Choose Date & Time</strong> &mdash; Interactive calendar with available slots</li>
        <li><strong>Confirm & Book</strong> &mdash; Review details and add to calendar</li>
      </ol>

      <Callout type="tip" title="Smart Booking">
        Progress indicator, side-by-side layout on desktop, conflict detection,
        and instant confirmation with booking details.
      </Callout>

      <h3 id="appointments">Appointments Management</h3>
      <ul>
        <li>Filterable list by upcoming, past, and all appointments</li>
        <li>Search by service, date, or provider</li>
        <li>Actions: Reschedule, cancel, add to calendar, download receipt</li>
        <li>Table view (desktop) / Card view (mobile)</li>
      </ul>

      <h3 id="photos">Photo Gallery</h3>
      <ul>
        <li>Before/after photo grid with responsive columns</li>
        <li>Side-by-side comparison view with slider</li>
        <li>Filter by treatment type and date</li>
        <li>Drag-and-drop photo upload</li>
        <li>Privacy controls (private by default)</li>
      </ul>

      <h3 id="messaging">Messaging</h3>
      <ul>
        <li>Conversation list with unread badges</li>
        <li>Split view on desktop (list + thread side-by-side)</li>
        <li>Rich messages: text, attachments, images</li>
        <li>Real-time updates via WebSocket or polling</li>
      </ul>

      <h3 id="profile">Profile & Settings</h3>
      <ul>
        <li>Personal information editor</li>
        <li>Membership details display</li>
        <li>Account settings (password, email preferences)</li>
        <li>Notification preferences</li>
        <li>Payment methods management</li>
      </ul>

      <h2 id="responsive">Responsive Design</h2>
      <p>Mobile-first with progressive enhancement:</p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-gray-900">Mobile (&lt; 640px):</strong>
            <span className="text-gray-600 ml-2">Single column, hamburger menu, full-screen modals</span>
          </div>
          <div>
            <strong className="text-gray-900">Tablet (640px - 1024px):</strong>
            <span className="text-gray-600 ml-2">2-column grids, collapsible sidebar</span>
          </div>
          <div>
            <strong className="text-gray-900">Desktop (&gt; 1024px):</strong>
            <span className="text-gray-600 ml-2">Fixed sidebar, multi-column layouts, hover states</span>
          </div>
        </div>
      </div>

      <h2 id="pwa">Progressive Web App</h2>
      <p>Native-like capabilities:</p>
      <ul>
        <li><strong>Offline Support:</strong> Service worker caches key pages</li>
        <li><strong>Installable:</strong> Add to home screen on mobile and desktop</li>
        <li><strong>App Icons:</strong> Custom icons for all platforms</li>
        <li><strong>Standalone Mode:</strong> Runs full-screen without browser chrome</li>
        <li><strong>Push Notifications:</strong> Ready for appointment reminders (future)</li>
      </ul>

      <h2 id="performance">Performance & SEO</h2>
      <ul>
        <li><strong>SSR:</strong> Public pages use server-side rendering for SEO</li>
        <li><strong>Image Optimization:</strong> Automatic AVIF/WebP conversion</li>
        <li><strong>Code Splitting:</strong> Route-based splitting reduces bundle size</li>
        <li><strong>React Query Caching:</strong> Stale-while-revalidate for fast navigation</li>
        <li><strong>Metadata API:</strong> Dynamic meta tags and Open Graph</li>
      </ul>

      <h2 id="deployment">Deployment Options</h2>

      <div className="not-prose grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border-2 border-primary-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Vercel</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Zero-config deployment with automatic HTTPS and global CDN.</p>
          <div className="text-xs text-primary-600 font-semibold">✓ Recommended</div>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">Railway</h3>
          <p className="text-sm text-gray-500">Simple container deployment</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">AWS/GCP</h3>
          <p className="text-sm text-gray-500">Enterprise deployment</p>
        </div>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patient-portal/authentication" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Authentication Setup</h3>
          <p className="text-sm text-gray-500">Configure NextAuth with providers</p>
        </Link>
        <Link href="/features/patient-portal/deployment" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Deployment Guide</h3>
          <p className="text-sm text-gray-500">Deploy to Vercel or other platforms</p>
        </Link>
        <Link href="/api/overview" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">API Integration</h3>
          <p className="text-sm text-gray-500">Connect to backend API</p>
        </Link>
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Patient Management</h3>
          <p className="text-sm text-gray-500">Admin-side patient features</p>
        </Link>
      </div>
    </div>
  )
}
