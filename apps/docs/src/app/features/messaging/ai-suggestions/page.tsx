'use client';

import { Sparkles, Shield, RefreshCw, MessageCircle, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function AISuggestionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-purple-600" />
        <h1 className="text-4xl font-bold">AI Reply Suggestions</h1>
        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
          NEW
        </span>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Save time and respond faster with AI-powered reply suggestions. Our smart system analyzes
        each incoming message and suggests 3 contextual responses you can send with a single click.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="AI Reply Suggestions Demo"
        duration="3:45"
      />

      {/* Key Benefits */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Why Use AI Suggestions?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Save Time</h3>
            </div>
            <p className="text-sm text-gray-700">
              Respond to common questions in seconds instead of typing the same answers repeatedly.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Stay Consistent</h3>
            </div>
            <p className="text-sm text-gray-700">
              Ensure professional, consistent messaging across your entire team.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">HIPAA Safe</h3>
            </div>
            <p className="text-sm text-gray-700">
              All processing happens locally. No patient data is sent to external AI services.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>

        <p className="text-gray-700">
          When a patient sends you a message, the AI system automatically analyzes the content
          and displays 3 suggested replies above your message composer.
        </p>

        <StepList
          steps={[
            {
              title: 'Patient Sends Message',
              description: 'A patient texts your business number with a question, confirmation, or concern.',
            },
            {
              title: 'AI Analyzes Content',
              description: 'Our system detects the intent: Is it about an appointment? A medical question? A thank you?',
            },
            {
              title: 'Suggestions Appear',
              description: 'Three numbered suggestions (1, 2, 3) appear above the message box, each tailored to the context.',
            },
            {
              title: 'Click to Send',
              description: 'Click any suggestion to auto-fill it into your message box. Edit if needed, then send.',
            },
          ]}
        />

        <Callout type="tip">
          <strong>Pro Tip:</strong> Click the refresh icon (↻) next to suggestions to generate new options if none of the current ones fit your needs.
        </Callout>
      </section>

      {/* What AI Detects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Context Detection</h2>

        <p className="text-gray-700 mb-4">
          The AI recognizes different types of messages and provides appropriate suggestions:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">📅 Appointment Messages</h4>
            <p className="text-sm text-blue-800 mb-2">
              When patients mention "appointment," "schedule," "book," or "reschedule"
            </p>
            <div className="bg-white p-3 rounded border border-blue-200">
              <p className="text-xs text-gray-500 mb-2">Example suggestions:</p>
              <ul className="text-sm space-y-1">
                <li>1. "Your appointment is confirmed! We'll see you then."</li>
                <li>2. "I'd be happy to help reschedule. What day works best for you?"</li>
                <li>3. "We're located at [address]. See you soon!"</li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">🩺 Medical Concerns</h4>
            <p className="text-sm text-amber-800 mb-2">
              When patients mention "pain," "swelling," "bruising," "redness," or other symptoms
            </p>
            <div className="bg-white p-3 rounded border border-amber-200">
              <p className="text-xs text-gray-500 mb-2">Example suggestions:</p>
              <ul className="text-sm space-y-1">
                <li>1. "Some swelling is normal and should subside within 24-48 hours."</li>
                <li>2. "Apply ice for 10-15 minutes to help with swelling."</li>
                <li>3. "If symptoms worsen, please call us at [phone] right away."</li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-2">❓ Questions</h4>
            <p className="text-sm text-green-800 mb-2">
              When messages contain question marks or asking words
            </p>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-2">Example suggestions:</p>
              <ul className="text-sm space-y-1">
                <li>1. "Great question! Let me help you with that."</li>
                <li>2. "I can answer that for you. Would you prefer a quick call?"</li>
                <li>3. "You can find that info on our website, or I'm happy to explain."</li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-pink-500 bg-pink-50 p-4 rounded">
            <h4 className="font-semibold text-pink-900 mb-2">🙏 Thank You Messages</h4>
            <p className="text-sm text-pink-800 mb-2">
              When patients express gratitude
            </p>
            <div className="bg-white p-3 rounded border border-pink-200">
              <p className="text-xs text-gray-500 mb-2">Example suggestions:</p>
              <ul className="text-sm space-y-1">
                <li>1. "You're so welcome! It was our pleasure."</li>
                <li>2. "Thank you for choosing us! We appreciate you."</li>
                <li>3. "Happy to help! Let us know if you need anything else."</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HIPAA Compliance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Privacy & HIPAA Compliance</h2>

        <Callout type="info" title="Your Data Stays Private">
          Our AI suggestions are <strong>100% HIPAA compliant</strong>. Unlike cloud-based AI services,
          our system uses local pattern matching that runs entirely within your platform.
          No patient data is ever sent to external servers.
        </Callout>

        <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">How We Protect Patient Data:</h3>

          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Local Processing Only</span>
                <p className="text-sm text-gray-600">All AI analysis happens on your server. PHI never leaves your system.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">No External API Calls</span>
                <p className="text-sm text-gray-600">We don't send messages to OpenAI, Google, or any external AI service.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Pattern-Based Detection</span>
                <p className="text-sm text-gray-600">We use rule-based keyword matching, not machine learning on your data.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">No Data Logging</span>
                <p className="text-sm text-gray-600">Messages are not stored or used to train any AI models.</p>
              </div>
            </li>
          </ul>
        </div>

        <Callout type="warning" title="Future AI Enhancements">
          If we add more advanced AI features in the future, they will only use HIPAA-compliant
          providers with signed Business Associate Agreements (BAA). You'll always be notified
          before any changes to data processing.
        </Callout>
      </section>

      {/* Using Suggestions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Using AI Suggestions</h2>

        <h3 className="text-lg font-semibold mt-4">Selecting a Suggestion</h3>
        <p className="text-gray-700 mb-3">
          When suggestions appear, you have several options:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-semibold">•</span>
            <span><strong>Click to use:</strong> Click any suggestion chip to copy it to your message box</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-semibold">•</span>
            <span><strong>Edit before sending:</strong> Modify the suggested text to personalize it</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-semibold">•</span>
            <span><strong>Refresh for new options:</strong> Click ↻ to generate different suggestions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-semibold">•</span>
            <span><strong>Ignore:</strong> Simply type your own message if none fit</span>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6">Best Practices</h3>
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold text-purple-900 mb-2">Personalize When Possible</h4>
            <p className="text-sm text-purple-800">
              AI suggestions are great starting points. Add the patient's name or specific details
              to make responses feel more personal.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold text-purple-900 mb-2">Review Before Sending</h4>
            <p className="text-sm text-purple-800">
              Always read the suggestion before sending. Make sure it accurately addresses
              the patient's specific question or concern.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold text-purple-900 mb-2">Use for Common Questions</h4>
            <p className="text-sm text-purple-800">
              AI suggestions work best for frequently asked questions. For complex medical
              discussions, take time to compose a thoughtful personal response.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Can I disable AI suggestions?</h4>
            <p className="text-gray-700 text-sm">
              Yes, AI suggestions can be toggled off in Settings → SMS → Features. You can also
              simply ignore them and type your own messages.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Do suggestions learn from my responses?</h4>
            <p className="text-gray-700 text-sm">
              No. Our current AI uses static pattern matching and doesn't learn from your data.
              This is intentional to maintain HIPAA compliance and data privacy.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Why don't suggestions appear for some messages?</h4>
            <p className="text-gray-700 text-sm">
              Suggestions only appear when the AI can confidently detect the message intent.
              Very short or ambiguous messages may not trigger suggestions.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Can I customize the suggestion templates?</h4>
            <p className="text-gray-700 text-sm">
              Currently, suggestions are system-generated. For custom responses, use the
              Quick Replies feature to create your own templates.
            </p>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/quick-replies">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Quick Replies</h3>
              <p className="text-sm text-gray-700">
                Create your own reusable message templates
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/sms">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Two-Way SMS</h3>
              <p className="text-sm text-gray-700">
                Full guide to SMS messaging features
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/templates">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Message Templates</h3>
              <p className="text-sm text-gray-700">
                Manage templates with variables
              </p>
            </div>
          </Link>

          <Link href="/features/messaging">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Messaging Overview</h3>
              <p className="text-sm text-gray-700">
                All messaging features at a glance
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
