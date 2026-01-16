'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false })

// Screenshot carousel data
const SCREENSHOTS = [
  { src: '/screenshots/dashboard.png', label: 'Dashboard', desc: 'Real-time KPIs, today\'s schedule, and activity feed' },
  { src: '/screenshots/calendar.png', label: 'Smart Scheduling', desc: 'Drag-to-create with conflict detection' },
  { src: '/screenshots/charting-face.png', label: 'Face Charting', desc: 'Patient profile with treatment history' },
  { src: '/screenshots/charting-zones.png', label: 'Zone Mapping', desc: 'Visual treatment zones with pricing' },
  { src: '/screenshots/charting-3d-body.png', label: '3D Body Charting', desc: 'Full body injection point tracking' },
  { src: '/screenshots/billing.png', label: 'Injectable Billing', desc: 'Live appointment workflow and payments' },
  { src: '/screenshots/invoices.png', label: 'Invoice Management', desc: 'Payment tracking and processing' },
  { src: '/screenshots/messaging.png', label: 'AI Messaging', desc: 'Smart replies and patient communication' },
  { src: '/screenshots/patients.png', label: 'Patient Database', desc: '10,000+ patients with full history' },
  { src: '/screenshots/reports.png', label: 'Executive Reports', desc: 'Revenue, retention, and service analytics' },
  { src: '/screenshots/inventory.png', label: 'Inventory Control', desc: 'Lot tracking with expiration alerts' },
  { src: '/screenshots/staff.png', label: 'Staff Management', desc: 'Team directory and task tracking' },
  { src: '/screenshots/settings.png', label: 'Charting Settings', desc: 'Configurable needle gauges and techniques' },
]

// Screenshot carousel component
function ScreenshotCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-advance carousel
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SCREENSHOTS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isHovered])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SCREENSHOTS.length)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length)
  }, [])

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main screenshot display */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        <div className="relative aspect-[16/10] overflow-hidden">
          {SCREENSHOTS.map((screenshot, idx) => (
            <div
              key={screenshot.src}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                idx === currentIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={screenshot.src}
                alt={screenshot.label}
                className="w-full h-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />

        {/* Screenshot info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h4 className="text-white text-xl font-bold mb-1">{SCREENSHOTS[currentIndex].label}</h4>
              <p className="text-white/70 text-sm">{SCREENSHOTS[currentIndex].desc}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
        {SCREENSHOTS.map((screenshot, idx) => (
          <button
            key={screenshot.src}
            onClick={() => goTo(idx)}
            className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden transition-all ${
              idx === currentIndex
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={screenshot.src}
              alt={screenshot.label}
              className="w-full h-full object-cover object-top"
            />
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex gap-1.5 justify-center">
        {SCREENSHOTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-purple-500'
                : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-between items-center transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-purple-100/50' : ''}`}>
        <a href="#" className="flex items-center gap-3 no-underline group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent transition-all group-hover:opacity-80">Dalphene</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium text-sm no-underline transition-colors">Features</a>
          <a href="#ai" className="text-gray-600 hover:text-purple-600 font-medium text-sm no-underline transition-colors">AI Platform</a>
          <a href="#about" className="text-gray-600 hover:text-purple-600 font-medium text-sm no-underline transition-colors">About</a>
          <a href="#contact" className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:scale-95 transition-all no-underline">Get Early Access</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 md:px-8 pt-24 pb-16 bg-gradient-to-b from-purple-50/50 to-white relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-25%] w-[80%] h-[150%] bg-[radial-gradient(ellipse,rgba(102,126,234,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200/60 px-4 py-2 rounded-full text-sm font-medium text-purple-600 mb-6 shadow-sm shadow-purple-500/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              Now in Development
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Your AI Assistant<br />
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">For Every</span><br />
              MedSpa Workflow
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6 max-w-xl">
              Dalphene handles the busywork while your team focuses on patients.
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 max-w-xl">
              {[
                '3D Anatomical Charting',
                'AI Smart Replies',
                'Automated Follow-ups',
                'Voice-Activated Notes',
                'Inventory Expiry Alerts',
                'Waitlist Auto-Fill',
                'Virtual Check-In',
                'Unit-Based Billing',
                'Lot Number Tracking',
                'Booking Cascade',
              ].map((feature, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 border border-purple-100 rounded-full text-[10px] sm:text-xs font-semibold text-purple-700">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  {feature}
                </span>
              ))}
            </div>
            <div className="flex gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10">
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">Q1</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">2026 Launch</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">12+</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">Core Modules</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">3D</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">Charting System</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a href="#contact" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 hover:brightness-110 active:scale-95 transition-all no-underline">
                Get Early Access
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a href="#features" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base border-2 border-gray-100 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50/30 active:scale-95 transition-all no-underline">
                Explore Features
              </a>
            </div>
          </div>

          {/* 3D Face Container */}
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] group">
            {/* Floating Cards - Real pain points med spa owners care about */}
            <div className="hidden md:block absolute top-[10%] left-[-20px] lg:left-[-60px] bg-white rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 hover:scale-105 transition-transform cursor-default" style={{ animation: 'float 6s ease-in-out infinite' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <strong className="block text-xl text-gray-900">2 hrs/day</strong>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Saved on Charting</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-[45%] right-[-20px] lg:right-[-50px] bg-white rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 hover:scale-105 transition-transform cursor-default" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <strong className="block text-xl text-gray-900">45% fewer</strong>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-tighter">No-Shows</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-[15%] left-[-10px] lg:left-[-30px] bg-white rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 hover:scale-105 transition-transform cursor-default" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                  <strong className="block text-xl text-gray-900">$40K/yr</strong>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Saved on Expired Product</span>
                </div>
              </div>
            </div>

            {/* 3D Canvas */}
            <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-950 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative ring-1 ring-white/10 group-hover:ring-purple-500/30 transition-all duration-500">
              {mounted && <Scene3D />}
              <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-end pointer-events-none">
                <div className="bg-black/40 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-white text-xs sm:text-sm border border-white/10 shadow-2xl">
                  <strong className="block text-sm sm:text-base mb-0.5 sm:mb-1">3D Injection Mapping</strong>
                  <span className="hidden sm:inline">Interactive charting for precision treatments</span>
                  <span className="inline sm:hidden">Precision treatment charting</span>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-xl px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white text-[10px] sm:text-xs border border-white/10 shadow-2xl">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    Neurotoxin
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-xl px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white text-[10px] sm:text-xs border border-white/10 shadow-2xl">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                    Filler
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-24 px-8 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-pink-400 mb-4">The Challenge</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">Medical Spas Deserve Better Software</h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Most platforms are salon software with &quot;medical mode&quot; bolted on. No unit-based billing. No lot tracking. No real AI. Just generic tools that don&apos;t understand injectable workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: '📅', title: 'Rule-Based Scheduling', desc: 'Generic calendars that can\'t predict no-shows, optimize provider time, or auto-fill cancellations with AI.', stat: '$150K+ lost annually', color: 'red' },
              { icon: '📝', title: 'Flat 2D Charting', desc: 'Basic tools with no 3D mapping, no injection depth tracking, and no treatment outcome analytics.', stat: '2+ hours daily', color: 'orange' },
              { icon: '💬', title: 'Manual SMS Replies', desc: 'Staff typing every response from scratch. No AI suggestions. No intent detection. No emergency flagging.', stat: '23% patient churn', color: 'yellow' },
              { icon: '💳', title: 'Generic Invoicing', desc: 'Systems that don\'t understand unit-based Botox pricing or auto-deduct inventory on treatment complete.', stat: '15-day payment delay', color: 'red' },
              { icon: '📦', title: 'No Lot Tracking', desc: 'Platforms that skip FDA-required lot numbers, miss expiration dates, and ignore wastage documentation.', stat: '$40K wasted yearly', color: 'orange' },
              { icon: '🔌', title: 'Locked Ecosystems', desc: "Vendors that force you into their payment processor, their SMS, their everything. No Zapier. No open APIs.", stat: '5+ separate tools', color: 'yellow' },
            ].map((problem, i) => (
              <div key={i} className="group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-8 hover:bg-white/[0.08] hover:border-purple-500/40 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-10 sm:w-14 h-10 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-3xl mb-3 sm:mb-6 shadow-lg ${problem.color === 'red' ? 'bg-red-500/15 text-red-400' : problem.color === 'orange' ? 'bg-orange-500/15 text-orange-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                  {problem.icon}
                </div>
                <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-purple-300 transition-colors">{problem.title}</h3>
                <p className="text-[10px] sm:text-sm text-white/60 leading-relaxed mb-3 sm:mb-6 hidden sm:block">{problem.desc}</p>
                <span className="inline-block px-2 sm:px-4 py-1 sm:py-2 bg-red-500/10 border border-red-500/20 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold text-red-300 group-hover:bg-red-500/20 transition-all">{problem.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Carousel Section - MOBILE ONLY (shown earlier on mobile) */}
      <section className="py-16 px-8 bg-gradient-to-b from-white to-purple-50/30 md:hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 mb-3">See It In Action</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Real Platform. Real Progress.</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Not mockups. Not wireframes. These are actual screens from our production-ready platform.
            </p>
          </div>
          {mounted && <ScreenshotCarousel />}
        </div>
      </section>

      {/* Solution Section */}
      <section id="features" className="py-24 px-8 bg-gradient-to-b from-white to-purple-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-4">Meet Dalphene</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                Your AI Assistant<br />For Every<br />
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">MedSpa Workflow</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Dalphene isn&apos;t just software. It&apos;s an intelligent assistant that handles the busywork so your team can focus on patients. One action triggers a cascade of automations. AI drafts, humans verify.
              </p>
              <div className="flex flex-col gap-5">
                {[
                  'AI listens to calls and auto-fills booking forms while you talk',
                  'Voice-activated charting—dictate SOAP notes hands-free',
                  'Smart SMS replies generated in seconds, you just approve',
                  'One booking triggers 4 automated confirmations instantly',
                  'Patient texts "HERE"—entire check-in workflow fires automatically',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-gray-900 font-semibold group-hover:text-purple-700 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2.5rem] p-1 shadow-2xl shadow-purple-500/5 group">
              <div className="bg-white rounded-[2.25rem] p-8 shadow-inner border border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="md:col-span-1 bg-purple-50/50 rounded-2xl p-4 md:p-5 border border-purple-100/50">
                    <div className="text-[10px] text-purple-400 mb-3 md:mb-4 font-bold uppercase tracking-wider">TODAY&apos;S SCHEDULE</div>
                    <div className="flex flex-col gap-2 md:gap-3">
                      <div className="bg-purple-600 shadow-md shadow-purple-500/20 text-white px-3 py-2 md:py-2.5 rounded-lg text-[10px] font-bold">9:00 - Botox (J. Smith)</div>
                      <div className="bg-pink-600 shadow-md shadow-pink-500/20 text-white px-3 py-2 md:py-2.5 rounded-lg text-[10px] font-bold">10:30 - Filler (M. Johnson)</div>
                      <div className="bg-purple-600 shadow-md shadow-purple-500/20 text-white px-3 py-2 md:py-2.5 rounded-lg text-[10px] font-bold">1:00 - Consultation</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-[10px] text-gray-500 mb-3 md:mb-4 font-bold uppercase tracking-wider">QUICK STATS</div>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      <div className="bg-green-50/50 p-3 md:p-5 rounded-2xl text-center border border-green-100/50 hover:bg-green-50 transition-colors">
                        <div className="text-xl md:text-2xl font-black text-green-600">$4,280</div>
                        <div className="text-[9px] md:text-[10px] text-green-500/70 font-bold uppercase mt-1">Today&apos;s Revenue</div>
                      </div>
                      <div className="bg-purple-50/50 p-3 md:p-5 rounded-2xl text-center border border-purple-100/50 hover:bg-purple-50 transition-colors">
                        <div className="text-xl md:text-2xl font-black text-purple-600">8</div>
                        <div className="text-[9px] md:text-[10px] text-purple-500/70 font-bold uppercase mt-1">Appointments</div>
                      </div>
                      <div className="bg-yellow-50/50 p-3 md:p-5 rounded-2xl text-center border border-yellow-100/50 hover:bg-yellow-50 transition-colors">
                        <div className="text-xl md:text-2xl font-black text-yellow-600">3</div>
                        <div className="text-[9px] md:text-[10px] text-yellow-500/70 font-bold uppercase mt-1">On Waitlist</div>
                      </div>
                      <div className="bg-pink-50/50 p-3 md:p-5 rounded-2xl text-center border border-pink-100/50 hover:bg-pink-50 transition-colors">
                        <div className="text-xl md:text-2xl font-black text-pink-600">2</div>
                        <div className="text-[9px] md:text-[10px] text-pink-500/70 font-bold uppercase mt-1">Follow-ups Due</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-4">AI-Powered Workflows</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">One Action. Ten Automations.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every patient interaction triggers a cascade of intelligent automations. Your team stays focused on care while Dalphene handles the coordination.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            <div className="col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-xl sm:rounded-[2rem] p-5 sm:p-10 shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-white/10 transition-colors duration-500" />
              <div className="w-10 sm:w-16 h-10 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl sm:text-4xl mb-4 sm:mb-8 shadow-xl ring-1 ring-white/30 group-hover:scale-110 transition-transform">🎙️</div>
              <h3 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">Voice-Activated Everything</h3>
              <p className="text-white/80 text-sm sm:text-lg leading-relaxed max-w-2xl hidden sm:block">
                AI listens to phone calls and auto-fills booking forms. Practitioners dictate SOAP notes hands-free during treatment. Staff talk naturally while Dalphene captures every detail. No typing required.
              </p>
              <p className="text-white/80 text-xs leading-relaxed sm:hidden">
                AI listens to calls, auto-fills forms, and captures dictated notes hands-free.
              </p>
              <span className="inline-block mt-4 sm:mt-8 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest group-hover:bg-white/25 transition-all">Hands-Free Workflow</span>
            </div>
            {[
              { icon: '🤖', title: 'Smart SMS Replies', desc: 'AI reads patient messages, understands intent, and generates 3 perfect response options. You just tap to send.', tag: 'AI Drafts, You Approve' },
              { icon: '🎯', title: '3D Injection Mapping', desc: '360° anatomical models for face and body. Click to place injection points with depth, units, and lot tracking.', tag: 'Industry First' },
              { icon: '⚡', title: 'Booking Cascade', desc: 'One booking triggers: SMS confirmation, email details, calendar sync, pre-visit instructions, and reminder sequence.', tag: '4 Auto-Actions' },
              { icon: '📍', title: 'Virtual Waiting Room', desc: 'Patient texts "HERE" from parking lot. System notifies staff, updates queue, sends "room ready" SMS automatically.', tag: 'Zero Lobby Time' },
              { icon: '🔄', title: 'Treatment → Invoice', desc: 'Mark treatment complete and invoice auto-generates with services, products, and pricing. No manual entry.', tag: 'Instant Billing' },
              { icon: '📱', title: 'Follow-Up Sequences', desc: '5-message automated sequence: aftercare (1hr), check-in (24hr), results (3 days), photos (2 weeks), review request.', tag: 'Set & Forget' },
              { icon: '🎪', title: 'Waitlist Auto-Fill', desc: 'Cancellation detected? AI identifies best-fit patients from waitlist and sends one-click booking offers instantly.', tag: 'Fill Every Slot' },
            ].map((feature, i) => (
              <div key={i} className="group bg-gray-50/50 rounded-xl sm:rounded-[2rem] p-4 sm:p-8 border border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-purple-200 hover:-translate-y-2 transition-all duration-300">
                <div className="w-10 sm:w-16 h-10 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-xl sm:text-3xl mb-3 sm:mb-8 shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-3 text-gray-900 group-hover:text-purple-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[10px] sm:text-sm mb-3 sm:mb-6 hidden sm:block">{feature.desc}</p>
                <span className="inline-block px-2 sm:px-4 py-1 sm:py-2 bg-purple-100/50 text-purple-600 border border-purple-200/50 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-bold uppercase tracking-wider group-hover:bg-purple-600 group-hover:text-white transition-all">{feature.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Carousel Section - DESKTOP ONLY (hidden on mobile, shown earlier) */}
      <section className="hidden md:block py-24 px-8 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4">See It In Action</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">Real Platform. Real Progress.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Not mockups. Not wireframes. These are actual screens from our production-ready platform.
            </p>
          </div>
          {mounted && <ScreenshotCarousel />}
        </div>
      </section>
      {/* AI Section */}
      <section id="ai" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-pink-400 mb-2 sm:mb-4">The Dalphene Difference</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
                AI That Works<br />The Way You Do
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed mb-6 sm:mb-8">
                Dalphene&apos;s AI doesn&apos;t replace your team. It amplifies them. Every workflow has an AI layer: voice-activated charting, phone call transcription, smart SMS replies, and emergency detection. AI drafts, humans verify.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                {[
                  { icon: '🎙️', title: 'Voice Charting', desc: 'Dictate SOAP notes hands-free during treatment. AI structures and fills forms.' },
                  { icon: '📞', title: 'Call Transcription', desc: 'AI listens to booking calls and auto-fills forms while you talk naturally.' },
                  { icon: '🚨', title: 'Emergency Detection', desc: 'Keywords like "swelling" or "reaction" trigger instant staff alerts.' },
                  { icon: '💡', title: 'Smart Replies', desc: 'Patient texts analyzed instantly. 3 perfect response options, you tap to send.' },
                ].map((cap, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                    <h4 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-lg">{cap.icon}</span> <span className="leading-tight">{cap.title}</span>
                    </h4>
                    <p className="text-[10px] sm:text-xs text-white/60 leading-snug">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-0.5 sm:p-1 shadow-2xl backdrop-blur-sm group">
              <div className="bg-gray-950/50 rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.25rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-purple-500/10 blur-[80px] sm:blur-[100px] rounded-full" />
                <div className="flex items-center gap-1.5 sm:gap-2 pb-3 sm:pb-4 lg:pb-6 mb-4 sm:mb-6 lg:mb-8 border-b border-white/5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="ml-auto text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-white/30">AI Message Analysis</span>
                </div>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="bg-white/10 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 mr-0 sm:mr-8 lg:mr-12 shadow-xl hover:bg-white/20 transition-colors">
                    <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 sm:mb-3">Incoming SMS</div>
                    <p className="text-xs sm:text-sm leading-relaxed text-white/80">
                      &quot;Hi, I got Botox 3 days ago and I&apos;m seeing some bruising near my eye. Is this normal? Also can I reschedule my filler appointment next Tuesday to Thursday instead?&quot;
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-purple-500/5 animate-pulse rounded-xl sm:rounded-2xl" />
                    <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-purple-300 mb-2 sm:mb-3 relative z-10">AI Analysis</div>
                    <p className="text-xs sm:text-sm leading-relaxed relative z-10 font-medium">
                      <span className="text-white/90"><strong>Primary Intent:</strong> Medical concern + Reschedule</span><br />
                      <span className="text-pink-400"><strong>Urgency:</strong> Medium (post-treatment)</span><br />
                      <span className="text-white/70"><strong>Extracted:</strong> Botox, 3d post, bruising, Tue → Thu</span>
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-3 lg:mt-4 flex-wrap relative z-10">
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/10 border border-white/10 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter">Post-Treatment</span>
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white/10 border border-white/10 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter">Reschedule</span>
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-purple-500/40 border border-purple-400/30 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-tighter">Requires Action</span>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-xl hover:bg-green-500/20 transition-all">
                    <div className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-green-400/70 mb-2 sm:mb-3">Suggested Response</div>
                    <p className="text-xs sm:text-sm leading-relaxed text-green-50 italic">
                      &quot;Hi Sarah! Minor bruising near the injection site is completely normal and should resolve within 5-7 days. Apply cold compresses if needed. I&apos;ve moved your filler appointment to Thursday at 2pm. Does that work?&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-purple-600 mb-4">Expected Impact</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">Built for Results</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on industry benchmarks and platform capabilities, here&apos;s what medical spas can expect.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {[
              { value: '45%', label: 'Reduction in No-Shows', trend: 'SMS Reminders' },
              { value: '3x', label: 'Faster Payment Cycles', trend: '15 days → 3 days' },
              { value: '35%', label: 'Higher Staff Utilization', trend: 'Smart Scheduling' },
              { value: '40%', label: 'Less Product Waste', trend: 'Lot Tracking' },
            ].map((metric, i) => (
              <div key={i} className="group text-center p-4 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
                <div className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-500">{metric.value}</div>
                <div className="text-xs sm:text-base text-gray-900 font-bold mb-2 sm:mb-4 tracking-tight leading-tight">{metric.label}</div>
                <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-600 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider group-hover:bg-green-600 group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /></svg>
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Section */}
      <section id="market" className="py-24 px-8 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-4">Market Opportunity</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">A Rapidly Growing Industry</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The medical spa industry is experiencing unprecedented growth, with increasing demand for specialized management solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: '📈', title: 'Explosive Growth', desc: 'The US medical spa market is growing at one of the fastest rates in healthcare services, driven by non-invasive aesthetic treatments.', stat: '$18B+', label: 'US Market Size by 2028' },
              { icon: '🏢', title: 'Underserved Market', desc: 'Most med spas use generic wellness software or outdated systems. Less than 20% have purpose-built medical aesthetics platforms.', stat: '7,000+', label: 'Medical Spas in the US' },
              { icon: '💉', title: 'Injectable Dominance', desc: 'Neurotoxins and dermal fillers represent the largest treatment category, requiring specialized tracking and billing capabilities.', stat: '60%', label: 'Revenue from Injectables' },
            ].map((card, i) => (
              <div key={i} className="group bg-white rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-6 lg:mb-8 shadow-sm group-hover:scale-110 transition-transform">{card.icon}</div>
                <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 text-gray-900 group-hover:text-purple-700 transition-colors">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm mb-6 sm:mb-8">{card.desc}</p>
                <div className="flex items-baseline gap-2 sm:gap-3 mt-auto pt-6 sm:pt-8 border-t border-gray-50">
                  <span className="text-3xl sm:text-4xl font-black text-purple-600 group-hover:scale-110 transition-transform origin-left">{card.stat}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{card.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-4">Seamless Integrations</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">Your Favorite Tools. Connected.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We integrate with best-of-breed solutions so you can keep using what you love. No vendor lock-in. Just seamless workflows.
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-3 sm:gap-4 mb-12">
            {[
              { name: 'Stripe', desc: 'Payments', color: '#635BFF', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg> },
              { name: 'Square', desc: 'POS', color: '#000000', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M4.01 0A4.01 4.01 0 000 4.01v15.98A4.01 4.01 0 004.01 24h15.98A4.01 4.01 0 0024 19.99V4.01A4.01 4.01 0 0019.99 0H4.01zm2.04 6.05h11.9c1.12 0 2.05.93 2.05 2.05v7.8c0 1.12-.93 2.05-2.05 2.05H6.05A2.07 2.07 0 014 15.9v-7.8c0-1.12.93-2.05 2.05-2.05zm1.93 2.96v6.01h8.04V9.01H7.98z"/></svg> },
              { name: 'Twilio', desc: 'SMS & Voice', color: '#F22F46', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.381 0 0 5.381 0 12s5.381 12 12 12 12-5.381 12-12S18.619 0 12 0zm0 20.4c-4.639 0-8.4-3.761-8.4-8.4S7.361 3.6 12 3.6s8.4 3.761 8.4 8.4-3.761 8.4-8.4 8.4zm3.6-11.4c0 1.325-1.075 2.4-2.4 2.4S10.8 10.325 10.8 9s1.075-2.4 2.4-2.4 2.4 1.075 2.4 2.4zm-6 6c0 1.325-1.075 2.4-2.4 2.4S4.8 16.325 4.8 15s1.075-2.4 2.4-2.4 2.4 1.075 2.4 2.4zm6 0c0 1.325-1.075 2.4-2.4 2.4s-2.4-1.075-2.4-2.4 1.075-2.4 2.4-2.4 2.4 1.075 2.4 2.4z"/></svg> },
              { name: 'Google', desc: 'Calendar', color: '#4285F4', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
              { name: 'DocuSign', desc: 'E-Signatures', color: '#FFCC22', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M4.07 0A4.07 4.07 0 000 4.07v15.86A4.07 4.07 0 004.07 24h15.86A4.07 4.07 0 0024 19.93V4.07A4.07 4.07 0 0019.93 0zm7.793 5.067h6.07v1.54h-6.07zm-5.796 4.4l8.263 4.773-8.263 4.773z"/></svg> },
              { name: 'Zapier', desc: 'Automation', color: '#FF4A00', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M15.633 1.636l-3.507 7.89h7.016l-10.769 12.838 3.506-7.89H4.864L15.633 1.636z"/></svg> },
              { name: 'Podium', desc: 'Reviews', color: '#5046E5', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> },
              { name: 'RxPhoto', desc: 'Before/After', color: '#10B981', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v8l4-4 3 3 5-5 4 4V6H4zm0 12h16v-2.5l-4-4-5 5-3-3-4 4V18zM8 10a2 2 0 110-4 2 2 0 010 4z"/></svg> },
              { name: 'PatientFi', desc: 'Financing', color: '#0EA5E9', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg> },
              { name: 'QuickBooks', desc: 'Accounting', color: '#2CA01C', icon: <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM9.2 16.4H7.6c-1.325 0-2.4-1.075-2.4-2.4V10c0-1.325 1.075-2.4 2.4-2.4h1.6v1.6H7.6c-.44 0-.8.36-.8.8v4c0 .44.36.8.8.8h1.6v1.6zm8 0h-1.6v-1.6h1.6c.44 0 .8-.36.8-.8v-4c0-.44-.36-.8-.8-.8h-1.6V7.6h1.6c1.325 0 2.4 1.075 2.4 2.4v4c0 1.325-1.075 2.4-2.4 2.4zm-4-8.8c-1.325 0-2.4 1.075-2.4 2.4v4c0 1.325 1.075 2.4 2.4 2.4s2.4-1.075 2.4-2.4v-4c0-1.325-1.075-2.4-2.4-2.4zm.8 6.4c0 .44-.36.8-.8.8s-.8-.36-.8-.8v-4c0-.44.36-.8.8-.8s.8.36.8.8v4z"/></svg> },
            ].map((integration, i) => (
              <div key={i} className="group bg-white rounded-xl p-3 sm:p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 text-center">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 flex items-center justify-center text-gray-400 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ color: integration.color }}
                >
                  {integration.icon}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-purple-700 transition-colors">{integration.name}</h4>
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5 sm:mt-1">{integration.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-[2rem] p-6 sm:p-8 lg:p-10 text-center border border-purple-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
            <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-gray-900">Coming Soon: Manufacturer Loyalty Programs</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
              First-to-market integrations with Allergan Allē, Galderma ASPIRE, and Merz Xperience. Automatic points tracking. No more manual entry.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest text-purple-600/70">
              <span className="hover:text-purple-600 transition-colors cursor-default">Allē (Botox, Juvederm)</span>
              <span className="hidden sm:inline text-purple-200">•</span>
              <span className="hover:text-purple-600 transition-colors cursor-default">ASPIRE (Dysport, Restylane)</span>
              <span className="hidden sm:inline text-purple-200">•</span>
              <span className="hover:text-purple-600 transition-colors cursor-default">Xperience (Xeomin, Radiesse)</span>
            </div>
          </div>
        </div>
      </section>

      {/* About / Founder Section */}
      <section id="about" className="py-24 px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/50 blur-[150px] rounded-full -mt-48 -ml-48" />
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header with photo */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-6 mb-8">
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-purple-100">
                <img
                  src="/founder-profile-v2.jpeg"
                  alt="Damini Rijhwani, Founder of Dalphene"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <span className="inline-block text-xs sm:text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 mb-2">Meet the Founder</span>
              <h2 className="text-3xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                Why I&apos;m Building<br />
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Dalphene</span>
              </h2>
            </div>
          </div>

          {/* Bio content */}
          <div className="prose prose-gray max-w-none mb-8">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
              I wasn&apos;t looking to build medical spa software. I was looking for the right problem to solve.
            </p>

            <p className="text-base sm:text-base text-gray-600 leading-relaxed mb-6">
              After working as an AI Research Scientist at Philips in health tech, I wanted to build something that combined everything I&apos;d learned: AI, software engineering, and healthcare. I&apos;d been in AI for nearly a decade, shipped multiple products, and had the technical foundation. But I wanted something with real staying power.
            </p>

            <p className="text-base sm:text-base text-gray-600 leading-relaxed mb-6">
              The idea came from my network. Family in medicine, relatives in the med spa business, physician friends in New York. The conversations kept circling back to the same thing: practice software that felt like a burden rather than a tool. Workflows that created more work.
            </p>

            <p className="text-base sm:text-base text-gray-600 leading-relaxed">
              So I started building with a simple philosophy: software should feel invisible. AI handles the repetitive work. Humans make the decisions that matter. The goal is a platform you don&apos;t have to fight against.
            </p>
          </div>

          {/* Credibility badges */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl text-sm sm:text-xs font-bold text-purple-700">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              European Patent Holder
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl text-sm sm:text-xs font-bold text-green-700">
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              10+ Years in AI/ML
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 sm:py-32 px-4 sm:px-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">Be First in Line</h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed text-pretty font-medium px-4">
            Get notified when we launch and be among the first to experience the future of medical spa management.
          </p>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 mb-10 sm:mb-16 max-w-xl mx-auto border border-white/20 shadow-2xl group hover:bg-white/15 transition-all">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center text-yellow-900 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <div className="text-left">
                <strong className="block text-white text-2xl font-black tracking-tight mb-1">Become a Design Partner</strong>
                <span className="text-purple-200/70 text-sm font-bold uppercase tracking-widest">Limited Slots Available</span>
              </div>
            </div>
            <p className="text-white/70 text-sm text-left leading-relaxed font-semibold">
              Med spa owners who join as design partners get direct input on features, priority access to new releases, and locked-in founder pricing for life.
            </p>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="mailto:medspa@automationcoreinc.com?subject=Early Access Request" className="group inline-flex items-center gap-3 bg-white text-purple-700 px-8 py-5 rounded-2xl font-black text-lg hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95 transition-all no-underline shadow-xl">
              Request Early Access
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="mailto:medspa@automationcoreinc.com?subject=Design Partner Inquiry" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-8 py-5 rounded-2xl font-black text-lg border-2 border-white/30 hover:bg-white hover:text-purple-700 active:scale-95 transition-all no-underline">
              Become a Design Partner
            </a>
            <a href="mailto:medspa@automationcoreinc.com?subject=Investment Inquiry" className="inline-flex items-center gap-3 bg-yellow-400 text-gray-900 px-8 py-5 rounded-2xl font-black text-lg hover:bg-yellow-300 hover:-translate-y-1 active:scale-95 transition-all no-underline shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Become an Investor
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-24 px-8 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 blur-[150px] rounded-full -mb-48 -mr-48" />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-10 mb-20 pb-20 border-b border-white/5">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span className="text-sm font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-sm font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              <span className="text-sm font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">SOC 2 Ready</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-xl group hover:bg-white/10 transition-colors cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <span className="text-sm font-black uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">PCI DSS Compliant</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div>
              <a href="#" className="flex items-center gap-4 no-underline mb-8 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-black text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dalphene</span>
              </a>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs font-medium">
                The AI-powered platform purpose-built for modern medical spas. Streamline operations, enhance patient care, and grow your practice.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Features</a></li>
                <li><a href="#ai" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">AI Engine</a></li>
                <li><a href="#integrations" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Integrations</a></li>
                <li><a href="#contact" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Get Early Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Company</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">About Us</a></li>
                <li><a href="mailto:medspa@automationcoreinc.com?subject=Internship Inquiry" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Internships</a></li>
                <li><a href="mailto:medspa@automationcoreinc.com?subject=Investment Inquiry" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Investors</a></li>
                <li><a href="#contact" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Trust &amp; Security</h4>
              <ul className="space-y-4">
                <li><a href="/landing/privacy" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Privacy Policy</a></li>
                <li><a href="/landing/terms" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Terms of Service</a></li>
                <li><a href="/landing/security" className="text-white/60 hover:text-purple-400 text-sm font-bold no-underline transition-colors">Security &amp; HIPAA</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest text-center">&copy; 2026 Dalphene by Automation Core Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Float animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  )
}
