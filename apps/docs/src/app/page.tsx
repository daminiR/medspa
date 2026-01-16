import Link from 'next/link'
import { FeatureCard } from '@/components/docs/FeatureCard'
import { Callout } from '@/components/docs/Callout'
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { featureStatus } from '@/lib/navigation'
import {
  Calendar, Users, MessageCircle, CreditCard, BarChart,
  Clock, Zap, Users2, Repeat, FileText, ArrowRight,
  Sparkles, CheckCircle2, Rocket, Smartphone
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Modern MedSpa Management</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          <span className="gradient-text">Luxe MedSpa</span>
          <span className="text-gray-900"> Documentation</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Everything you need to run your medical spa efficiently. From scheduling to billing,
          charting to messaging &mdash; all in one beautiful platform.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/getting-started/quick-start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25"
          >
            <Rocket className="w-5 h-5" />
            Quick Start Guide
          </Link>
          <Link
            href="/features/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Explore Features
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Video Intro */}
      <div className="mb-16">
        <VideoPlaceholder
          title="Platform Overview"
          duration="4 min"
          description="Watch a quick introduction to the Luxe MedSpa platform and its key features"
        />
      </div>

      {/* Development Status */}
      <Callout type="info" title="Active Development">
        Luxe MedSpa is under active development. Features marked as &quot;In Progress&quot; are partially
        complete, and &quot;Coming Soon&quot; features are on our roadmap. Check back often for updates!
      </Callout>

      {/* Core Features Grid */}
      <section className="mb-16">
        <h2 id="core-features" className="text-2xl font-bold text-gray-900 mb-2">Core Features</h2>
        <p className="text-gray-500 mb-8">Essential tools for running your medical spa</p>

        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            title="Calendar & Scheduling"
            description="Beautiful calendar with day, week, and month views. Drag-and-drop appointments, time blocks, and waitlist management."
            href="/features/calendar"
            icon={<Calendar className="w-5 h-5" />}
            status="complete"
            completion={featureStatus.calendar.completion}
          />
          <FeatureCard
            title="Patient Management"
            description="Complete patient profiles with treatment history, documents, and communication preferences."
            href="/features/patients"
            icon={<Users className="w-5 h-5" />}
            status="complete"
            completion={featureStatus.patients.completion}
          />
          <FeatureCard
            title="Messaging & SMS"
            description="Two-way SMS messaging with appointment reminders, quick replies, and campaign management."
            href="/features/messaging"
            icon={<MessageCircle className="w-5 h-5" />}
            status="in-progress"
            completion={featureStatus.messaging.completion}
          />
          <FeatureCard
            title="Billing & Payments"
            description="POS checkout, package sales, membership management, and payment processing with Stripe."
            href="/features/billing"
            icon={<CreditCard className="w-5 h-5" />}
            status="in-progress"
            completion={featureStatus.billing.completion}
          />
          <FeatureCard
            title="Reports & Analytics"
            description="Sales reports, appointment analytics, treatment outcomes, and cash reconciliation."
            href="/features/reports"
            icon={<BarChart className="w-5 h-5" />}
            status="complete"
            completion={featureStatus.reports.completion}
          />
          <FeatureCard
            title="Packages & Memberships"
            description="Create and sell treatment packages, membership plans, and prepaid services."
            href="/features/billing/packages"
            icon={<Repeat className="w-5 h-5" />}
            status="complete"
            completion={featureStatus.packages.completion}
          />
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="mb-16">
        <h2 id="advanced-features" className="text-2xl font-bold text-gray-900 mb-2">Advanced Features</h2>
        <p className="text-gray-500 mb-8">Power features for growing practices</p>

        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            title="Virtual Waiting Room"
            description="SMS check-in, queue management, and real-time status updates for patients."
            href="/features/waiting-room"
            icon={<Clock className="w-5 h-5" />}
            status="complete"
            completion={featureStatus['waiting-room'].completion}
          />
          <FeatureCard
            title="Express Booking"
            description="Send SMS booking links with card capture. Reduce no-shows with payment on file."
            href="/features/express-booking"
            icon={<Zap className="w-5 h-5" />}
            status="complete"
            completion={featureStatus['express-booking'].completion}
          />
          <FeatureCard
            title="Group Booking"
            description="Book bridal parties, couples, and groups with coordinated scheduling and group discounts."
            href="/features/group-booking"
            icon={<Users2 className="w-5 h-5" />}
            status="in-progress"
            completion={featureStatus['group-booking'].completion}
          />
          <FeatureCard
            title="Treatment Series"
            description="Repeating appointments for Botox maintenance and multi-session treatments like laser."
            href="/features/series"
            icon={<Repeat className="w-5 h-5" />}
            status="complete"
            completion={featureStatus.series.completion}
          />
          <FeatureCard
            title="Charting"
            description="SOAP notes, injectable tracking, and photo documentation for treatments."
            href="/features/charting"
            icon={<FileText className="w-5 h-5" />}
            status="in-progress"
            completion={featureStatus.charting.completion}
          />
          <FeatureCard
            title="Patient Portal (Web)"
            description="Modern web portal for patients with booking, photos, messaging, and rewards. Built with Next.js 15."
            href="/features/patient-portal"
            icon={<Smartphone className="w-5 h-5" />}
            status="complete"
            completion={featureStatus['patient-portal'].completion}
          />
        </div>
      </section>

      {/* Why Luxe Section */}
      <section className="mb-16 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8">
        <h2 id="why-luxe" className="text-2xl font-bold text-gray-900 mb-6">Why Luxe MedSpa?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Modern & Beautiful</h3>
              <p className="text-sm text-gray-600">Designed for today&apos;s medical spas with an intuitive, beautiful interface.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Integration-First</h3>
              <p className="text-sm text-gray-600">Built to connect with tools you already use &mdash; Stripe, Twilio, QuickBooks, and more.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
              <p className="text-sm text-gray-600">Smart SMS suggestions, voice dictation, and automated workflows coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 id="quick-links" className="text-2xl font-bold text-gray-900 mb-6">Popular Pages</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/getting-started/quick-start" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">Quick Start Guide</h3>
            <p className="text-sm text-gray-500">Get up and running in minutes</p>
          </Link>
          <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">Booking Appointments</h3>
            <p className="text-sm text-gray-500">Learn how to schedule patients</p>
          </Link>
          <Link href="/features/messaging/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">SMS Messaging</h3>
            <p className="text-sm text-gray-500">Set up two-way patient messaging</p>
          </Link>
          <Link href="/integrations/stripe" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">Stripe Integration</h3>
            <p className="text-sm text-gray-500">Connect payment processing</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
