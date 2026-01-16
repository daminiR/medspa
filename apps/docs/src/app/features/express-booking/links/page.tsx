import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Link as LinkIcon, CheckCircle2, Share2, QrCode, Globe } from 'lucide-react'

export default function BookingLinksPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <LinkIcon className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Booking Links</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Shareable links that let patients book directly. Put them on your website,
        social media, email signatures, or print as QR codes.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Every barrier to booking is a potential lost appointment. Booking links
        remove friction - patients click, pick a time, done. No phone call needed.
      </p>

      <h2 id="types">Types of Booking Links</h2>

      <h3>General Booking Link</h3>
      <p>
        A link to your full booking page where patients can:
      </p>
      <ul>
        <li>Browse all services</li>
        <li>Select their provider</li>
        <li>Choose any available time</li>
      </ul>
      <p>
        Best for: Website, Instagram bio, email signature
      </p>

      <h3>Service-Specific Links</h3>
      <p>
        Links pre-filled with a specific service:
      </p>
      <ul>
        <li><code>book.luxemedspa.com/botox</code></li>
        <li><code>book.luxemedspa.com/hydrafacial</code></li>
        <li><code>book.luxemedspa.com/consultation</code></li>
      </ul>
      <p>
        Best for: Service promotions, targeted ads, specific landing pages
      </p>

      <h3>Provider-Specific Links</h3>
      <p>
        Links for booking with a specific provider:
      </p>
      <ul>
        <li><code>book.luxemedspa.com/dr-johnson</code></li>
      </ul>
      <p>
        Best for: Provider marketing, business cards, patient referrals
      </p>

      <Callout type="tip" title="Track Your Links">
        Use different links for different channels to see where bookings come from.
        &quot;How did you hear about us?&quot; becomes automatic.
      </Callout>

      <h2 id="creating">Creating Booking Links</h2>
      <ol>
        <li>Go to Settings → Booking Links</li>
        <li>Click &quot;Create New Link&quot;</li>
        <li>Choose link type (general, service, provider)</li>
        <li>Customize the URL slug</li>
        <li>Set any restrictions (if needed)</li>
        <li>Copy and share!</li>
      </ol>

      <h2 id="qr-codes">QR Codes</h2>
      <p>
        Every booking link has an auto-generated QR code. Use them for:
      </p>
      <ul>
        <li><strong>In-clinic signage</strong> &mdash; &quot;Scan to book your next visit&quot;</li>
        <li><strong>Business cards</strong> &mdash; Easy booking for referrals</li>
        <li><strong>Print advertising</strong> &mdash; Magazine ads, flyers</li>
        <li><strong>Product packaging</strong> &mdash; If you sell retail</li>
      </ul>

      <h2 id="customization">Link Customization</h2>
      <p>
        Configure each link&apos;s behavior:
      </p>
      <ul>
        <li><strong>Available services</strong> &mdash; Show all or specific services</li>
        <li><strong>Available providers</strong> &mdash; All or specific providers</li>
        <li><strong>Date range</strong> &mdash; How far ahead patients can book</li>
        <li><strong>New patient only</strong> &mdash; Restrict to first-time visitors</li>
        <li><strong>Require card</strong> &mdash; Collect card info during booking</li>
      </ul>

      <h2 id="tracking">Link Analytics</h2>
      <p>
        Track how each link performs:
      </p>
      <ul>
        <li>Total clicks</li>
        <li>Bookings completed</li>
        <li>Conversion rate</li>
        <li>Revenue generated</li>
      </ul>

      <Callout type="info" title="A/B Testing">
        Create different links for the same service and see which description or
        image converts better.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/express-booking/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Quick Book</h3>
          <p className="text-sm text-gray-500">Send links via text</p>
        </Link>
        <Link href="/features/patient-portal" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Portal</h3>
          <p className="text-sm text-gray-500">Full patient self-service</p>
        </Link>
      </div>
    </div>
  )
}
