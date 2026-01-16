import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MessageCircle,
  BookOpen,
  FileText,
  Zap,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge info">
          <CheckCircle2 className="w-3 h-3" /> Support & Resources
        </span>
      </div>

      <h1>Support & Resources</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        We're here to help. Find answers, get support, and connect with our team through multiple channels.
      </p>

      {/* Contact Methods */}
      <h2>Get Help Fast</h2>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Email Support</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            For detailed questions and issue reports. We respond within 24 hours.
          </p>
          <p className="text-sm font-medium">
            <a href="mailto:support@medspa.io" className="text-primary-600 hover:text-primary-700">
              support@medspa.io
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">Response time: &lt;24 hours</p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Phone Support</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Talk directly with our team for urgent issues. Available M-F, 9 AM-6 PM EST.
          </p>
          <p className="text-sm font-medium">
            <a href="tel:+18662000200" className="text-primary-600 hover:text-primary-700">
              1-866-200-0200
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">Response time: Immediate</p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Live Chat</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Quick answers to common questions. Available during business hours.
          </p>
          <p className="text-sm font-medium">
            <button className="text-primary-600 hover:text-primary-700">
              Click to open chat
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-2">Response time: &lt;5 minutes</p>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Help Center</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Searchable knowledge base with articles and video guides. Available 24/7.
          </p>
          <p className="text-sm font-medium">
            <Link href="/guides/faq" className="text-primary-600 hover:text-primary-700">
              Browse help center
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">Response time: Instant</p>
        </div>
      </div>

      <Callout type="tip" title="Pro tip: Check the FAQ first">
        Many common questions are answered in our{' '}
        <Link href="/guides/faq" className="text-primary-600 hover:underline">
          FAQ
        </Link>
        {' '}and quick links below. You might find your answer in seconds!
      </Callout>

      {/* Support Levels */}
      <h2>Support by Plan</h2>

      <div className="not-prose overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Support Feature</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Starter</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Professional</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Email support</td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Response time</td>
              <td className="text-center py-3 px-4">48 hours</td>
              <td className="text-center py-3 px-4">24 hours</td>
              <td className="text-center py-3 px-4">4 hours</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Phone support</td>
              <td className="text-center py-3 px-4">-</td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Live chat</td>
              <td className="text-center py-3 px-4">-</td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Dedicated support</td>
              <td className="text-center py-3 px-4">-</td>
              <td className="text-center py-3 px-4">-</td>
              <td className="text-center py-3 px-4">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Setup & training</td>
              <td className="text-center py-3 px-4">Self-serve</td>
              <td className="text-center py-3 px-4">30 min call</td>
              <td className="text-center py-3 px-4">Full onboarding</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Links */}
      <h2>Quick Links</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div>
          <h3>Getting Started</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/getting-started/quick-start" className="text-primary-600 hover:underline">
                Quick Start Guide
              </Link>
            </li>
            <li>
              <Link href="/getting-started/requirements" className="text-primary-600 hover:underline">
                System Requirements
              </Link>
            </li>
            <li>
              <Link href="/getting-started/account-setup" className="text-primary-600 hover:underline">
                Account Setup Guide
              </Link>
            </li>
            <li>
              <Link href="/guides/best-practices" className="text-primary-600 hover:underline">
                Best Practices
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Features & Setup</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/features/calendar" className="text-primary-600 hover:underline">
                Calendar & Scheduling
              </Link>
            </li>
            <li>
              <Link href="/features/patients" className="text-primary-600 hover:underline">
                Patient Management
              </Link>
            </li>
            <li>
              <Link href="/features/billing" className="text-primary-600 hover:underline">
                Billing & Payments
              </Link>
            </li>
            <li>
              <Link href="/features/messaging" className="text-primary-600 hover:underline">
                Messaging & Communication
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Integration & API</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/integrations" className="text-primary-600 hover:underline">
                Integration Hub
              </Link>
            </li>
            <li>
              <Link href="/api" className="text-primary-600 hover:underline">
                API Documentation
              </Link>
            </li>
            <li>
              <a href="https://github.com/medspa" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                GitHub & SDK
              </a>
            </li>
            <li>
              <a href="https://status.medspa.io" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                System Status
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3>Company & Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                HIPAA Compliance
              </a>
            </li>
            <li>
              <a href="#" className="text-primary-600 hover:underline">
                Security & Data
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Common Issues */}
      <h2>Common Issues & Solutions</h2>

      <div className="space-y-4 mb-8">
        <details className="p-4 bg-white border border-gray-200 rounded-lg group cursor-pointer">
          <summary className="flex items-center justify-between font-medium text-gray-900 group-open:text-primary-600">
            <span>I forgot my password</span>
            <span className="text-gray-400 group-open:text-primary-600">+</span>
          </summary>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>
              Click "Forgot Password" on the login page and enter your email address. We'll send you a link to
              reset your password. The link expires in 24 hours.
            </p>
            <p>If you don't receive the email, check your spam folder or contact support.</p>
          </div>
        </details>

        <details className="p-4 bg-white border border-gray-200 rounded-lg group cursor-pointer">
          <summary className="flex items-center justify-between font-medium text-gray-900 group-open:text-primary-600">
            <span>SMS messages aren't sending</span>
            <span className="text-gray-400 group-open:text-primary-600">+</span>
          </summary>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>Check the following:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Patient has SMS consent enabled</li>
              <li>Phone number is valid and correctly formatted</li>
              <li>Carrier isn't blocking messages</li>
              <li>Your SMS balance isn't depleted</li>
            </ul>
            <p>Contact support if the issue persists.</p>
          </div>
        </details>

        <details className="p-4 bg-white border border-gray-200 rounded-lg group cursor-pointer">
          <summary className="flex items-center justify-between font-medium text-gray-900 group-open:text-primary-600">
            <span>Appointments aren't showing in the calendar</span>
            <span className="text-gray-400 group-open:text-primary-600">+</span>
          </summary>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>Make sure you're viewing the correct date and time range. Check:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Calendar is showing the correct month/year</li>
              <li>Filters are set correctly (check provider and service filters)</li>
              <li>View is set to the right time scale (day/week/month)</li>
            </ul>
            <p>Try refreshing the page or clearing your browser cache.</p>
          </div>
        </details>

        <details className="p-4 bg-white border border-gray-200 rounded-lg group cursor-pointer">
          <summary className="flex items-center justify-between font-medium text-gray-900 group-open:text-primary-600">
            <span>Payment processing is failing</span>
            <span className="text-gray-400 group-open:text-primary-600">+</span>
          </summary>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>If payments fail, check:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Card information is correct and not expired</li>
              <li>Billing address matches card info</li>
              <li>Card has sufficient funds</li>
              <li>Payment processor isn't blocking the transaction</li>
            </ul>
            <p>Try a different payment method or contact your bank.</p>
          </div>
        </details>

        <details className="p-4 bg-white border border-gray-200 rounded-lg group cursor-pointer">
          <summary className="flex items-center justify-between font-medium text-gray-900 group-open:text-primary-600">
            <span>I'm getting a "Permission Denied" error</span>
            <span className="text-gray-400 group-open:text-primary-600">+</span>
          </summary>
          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>
              This means your user role doesn't have permission for that action. Talk to your admin about
              adjusting permissions.
            </p>
            <p>
              Different roles have different access levels (Owner &gt; Admin &gt; Provider &gt; Receptionist).
            </p>
          </div>
        </details>
      </div>

      {/* Training & Onboarding */}
      <h2>Training & Onboarding</h2>

      <p>
        Get your team up to speed with our training resources and onboarding programs.
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Video Tutorials</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Step-by-step video guides for every feature. Average video length: 3-5 minutes.
          </p>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
            Watch tutorials →
          </a>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Live Webinars</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Join live Q&A sessions with our team. Monthly onboarding and feature deep-dives.
          </p>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
            Register for webinar →
          </a>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Comprehensive written guides with screenshots. Perfect for reference material.
          </p>
          <Link href="/features" className="text-sm text-primary-600 hover:text-primary-700">
            Read documentation →
          </Link>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 m-0">Pro Tips & Tricks</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Advanced workflows and shortcuts for power users. Learn time-saving techniques.
          </p>
          <Link href="/guides/best-practices" className="text-sm text-primary-600 hover:text-primary-700">
            View tips →
          </Link>
        </div>
      </div>

      <Callout type="success" title="Dedicated onboarding available">
        Professional and Enterprise plans include a dedicated onboarding specialist who will train your team and help you get configured. Book a setup call when you sign up.
      </Callout>

      {/* Feedback */}
      <h2>Share Feedback & Feature Requests</h2>

      <p>
        We value your feedback and use it to guide our product roadmap. Have a feature idea or found a bug?
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <a
          href="https://feedback.medspa.io"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Feature Requests</h3>
          <p className="text-sm text-gray-500">Vote on ideas and suggest new features</p>
        </a>

        <a
          href="https://github.com/medspa/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Bug Reports</h3>
          <p className="text-sm text-gray-500">Report bugs and technical issues</p>
        </a>
      </div>

      {/* Still Need Help */}
      <Callout type="info" title="Still need help?">
        We're here for you! Reach out to support@medspa.io or call 1-866-200-0200 Monday-Friday, 9 AM-6 PM EST.
        Average response time: less than 1 hour.
      </Callout>
    </div>
  )
}
