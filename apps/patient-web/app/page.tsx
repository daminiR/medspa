import Link from 'next/link';
import {
  Calendar,
  Camera,
  MessageSquare,
  Shield,
  Star,
  Sparkles,
  Clock,
  Award,
  ArrowRight,
  Check,
  Smartphone,
} from 'lucide-react';
import { MobileAppBanner } from '@/components/MobileAppBanner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile App Banner */}
      <MobileAppBanner />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <nav className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Luxe Medical Spa</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors">
                Services
              </a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary btn-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
              <Star className="w-4 h-4" />
              <span>Rated 4.9/5 by over 10,000 patients</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Your Beauty Journey,{' '}
              <span className="text-gradient">Simplified</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Book appointments in seconds, track your transformation with before/after photos,
              and message your care team - all in one beautiful app.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking" className="btn-primary btn-xl w-full sm:w-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/register" className="btn-outline btn-xl w-full sm:w-auto">
                Create Account
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-success-500" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary-500" />
                <span className="text-sm">Board Certified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent-500" />
                <span className="text-sm">Same-Day Appointments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your aesthetic journey with powerful tools designed for your convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3-Click Booking
              </h3>
              <p className="text-gray-600">
                Book your next appointment in under 30 seconds. Pick your service,
                choose your time, and confirm. It's that easy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Photos
              </h3>
              <p className="text-gray-600">
                Track your transformation with secure before/after photos.
                Compare results and celebrate your progress.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Messaging
              </h3>
              <p className="text-gray-600">
                Message your care team directly. Get answers to questions,
                share concerns, and receive personalized advice.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Rescheduling
              </h3>
              <p className="text-gray-600">
                Life happens. Reschedule or cancel appointments with just a few taps.
                No phone calls needed.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is protected with bank-level encryption.
                HIPAA compliant and fully secure.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile App
              </h3>
              <p className="text-gray-600">
                Download our native app for the best experience.
                Available on iOS and Android.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Book in 3 Simple Steps
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've made booking as easy as possible so you can focus on what matters - you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Choose Your Service
                </h3>
                <p className="text-gray-600">
                  Browse our menu of aesthetic treatments and select what you need.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pick Your Time
                </h3>
                <p className="text-gray-600">
                  See real-time availability and choose a time that works for you.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm & Go
                </h3>
                <p className="text-gray-600">
                  Review your booking, confirm, and you're all set!
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/booking" className="btn-primary btn-xl">
                Start Booking
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See why patients choose Luxe Medical Spa for their aesthetic journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The booking process is incredibly simple. I love being able to see my
                before/after photos and track my progress over time."
              </p>
              <div className="flex items-center">
                <div className="avatar-md bg-primary-500 text-white font-medium mr-3">
                  JD
                </div>
                <div>
                  <div className="font-medium text-gray-900">Jennifer D.</div>
                  <div className="text-sm text-gray-500">Patient since 2023</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Being able to message my provider directly through the app is a game
                changer. They respond so quickly!"
              </p>
              <div className="flex items-center">
                <div className="avatar-md bg-accent-500 text-white font-medium mr-3">
                  MR
                </div>
                <div>
                  <div className="font-medium text-gray-900">Michelle R.</div>
                  <div className="text-sm text-gray-500">Patient since 2022</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I've tried other med spas but the technology here is on another level.
                The app makes everything so easy."
              </p>
              <div className="flex items-center">
                <div className="avatar-md bg-success-500 text-white font-medium mr-3">
                  SK
                </div>
                <div>
                  <div className="font-medium text-gray-900">Sarah K.</div>
                  <div className="text-sm text-gray-500">Patient since 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card p-8 md:p-12 bg-gradient-to-br from-primary-600 to-primary-800">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                Join thousands of satisfied patients who trust Luxe Medical Spa
                for their aesthetic needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/booking"
                  className="btn bg-white text-primary-700 hover:bg-gray-100 btn-xl w-full sm:w-auto"
                >
                  Book Your First Appointment
                </Link>
                <Link
                  href="/register"
                  className="btn border-2 border-white text-white hover:bg-white/10 btn-xl w-full sm:w-auto"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-app">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Luxe Medical Spa</span>
              </div>
              <p className="mb-4 max-w-md">
                Experience luxury aesthetic services with cutting-edge technology
                and world-class providers.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.017 0C8.736 0 8.333.015 7.053.072 5.775.128 4.903.333 4.14.63c-.789.305-1.459.715-2.126 1.384C1.345 2.68.935 3.35.63 4.14.333 4.903.128 5.775.072 7.053.015 8.333 0 8.736 0 12.017c0 3.281.015 3.684.072 4.964.056 1.278.261 2.15.558 2.913.305.789.715 1.459 1.384 2.126.667.666 1.337 1.079 2.126 1.384.763.297 1.635.502 2.913.558 1.28.057 1.683.072 4.964.072s3.684-.015 4.964-.072c1.278-.056 2.15-.261 2.913-.558.789-.305 1.459-.715 2.126-1.384.666-.667 1.079-1.337 1.384-2.126.297-.763.502-1.635.558-2.913.057-1.28.072-1.683.072-4.964s-.015-3.684-.072-4.964c-.056-1.278-.261-2.15-.558-2.913-.305-.789-.715-1.459-1.384-2.126C21.32 1.345 20.65.935 19.86.63c-.763-.297-1.635-.502-2.913-.558C15.667.015 15.264 0 11.983 0h.034zm-.004 2.164c3.222 0 3.603.012 4.874.07 1.175.054 1.814.25 2.24.414.562.218.964.48 1.386.902.422.422.684.824.902 1.386.164.426.36 1.065.414 2.24.058 1.271.07 1.652.07 4.874s-.012 3.603-.07 4.874c-.054 1.175-.25 1.814-.414 2.24-.218.562-.48.964-.902 1.386a3.742 3.742 0 01-1.386.902c-.426.164-1.065.36-2.24.414-1.271.058-1.652.07-4.874.07s-3.603-.012-4.874-.07c-1.175-.054-1.814-.25-2.24-.414-.562-.218-.964-.48-1.386-.902a3.742 3.742 0 01-.902-1.386c-.164-.426-.36-1.065-.414-2.24-.058-1.271-.07-1.652-.07-4.874s.012-3.603.07-4.874c.054-1.175.25-1.814.414-2.24.218-.562.48-.964.902-1.386.422-.422.824-.684 1.386-.902.426-.164 1.065-.36 2.24-.414 1.271-.058 1.652-.07 4.874-.07z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Notice</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Luxe Medical Spa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
