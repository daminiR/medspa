import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { CheckCircle2, Smartphone, Globe, Lock, HardDrive, Monitor } from 'lucide-react'

export default function RequirementsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Monitor className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge success">
          <CheckCircle2 className="w-3 h-3" /> System Requirements
        </span>
      </div>

      <h1>System Requirements</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Everything you need to know about the technical requirements to run the MedSpa platform.
      </p>

      <Callout type="tip" title="Modern browsers recommended">
        The platform works best on modern browsers updated within the last 6 months. We recommend Chrome, Safari,
        Edge, or Firefox for optimal performance.
      </Callout>

      {/* Browser Requirements */}
      <h2>
        <Globe className="w-6 h-6 inline mr-2" />
        Browser Requirements
      </h2>

      <p>The MedSpa platform is a web-based application. You need a modern web browser to access it.</p>

      <h3>Supported Browsers</h3>
      <div className="not-prose grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
          <p className="text-sm text-gray-600">Version 90+</p>
          <p className="text-xs text-green-600 mt-1">Recommended</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
          <p className="text-sm text-gray-600">Version 14+</p>
          <p className="text-xs text-green-600 mt-1">Recommended</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
          <p className="text-sm text-gray-600">Version 88+</p>
          <p className="text-xs text-green-600 mt-1">Recommended</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h4>
          <p className="text-sm text-gray-600">Version 90+</p>
          <p className="text-xs text-green-600 mt-1">Recommended</p>
        </div>
      </div>

      <h3>Browser Settings</h3>
      <p>Make sure these browser settings are enabled:</p>
      <ul>
        <li>
          <strong>JavaScript:</strong> Required for the platform to function. JavaScript must be enabled.
        </li>
        <li>
          <strong>Cookies:</strong> Required for session management and preferences. Third-party cookies must be
          allowed.
        </li>
        <li>
          <strong>Local Storage:</strong> Used to store temporary data and preferences locally in your browser.
        </li>
        <li>
          <strong>HTTPS:</strong> Platform only works over secure HTTPS connections. HTTP is not supported.
        </li>
      </ul>

      <Callout type="warning" title="Older browsers not supported">
        Internet Explorer is not supported. We recommend upgrading to a modern browser for security, performance,
        and feature support.
      </Callout>

      {/* Device Requirements */}
      <h2>
        <Smartphone className="w-6 h-6 inline mr-2" />
        Device Requirements
      </h2>

      <h3>Desktop / Laptop</h3>
      <ul>
        <li>
          <strong>Processor:</strong> Any modern processor from the last 5 years (Intel i3, AMD Ryzen 3, or
          equivalent)
        </li>
        <li>
          <strong>Memory:</strong> 4GB RAM minimum, 8GB recommended
        </li>
        <li>
          <strong>Storage:</strong> 100MB free disk space (for browser cache)
        </li>
        <li>
          <strong>Display:</strong> 1920x1080 or higher resolution recommended for optimal viewing
        </li>
        <li>
          <strong>Mouse/Keyboard:</strong> Required for appointment dragging and other interactions
        </li>
      </ul>

      <h3>Mobile Devices</h3>
      <p>The platform is mobile-friendly and works on smartphones and tablets:</p>
      <ul>
        <li>
          <strong>iOS:</strong> iPhone 6 or later with iOS 12+
        </li>
        <li>
          <strong>Android:</strong> Android 6.0+ with Chrome, Safari, Firefox, or Edge
        </li>
        <li>
          <strong>Tablets:</strong> iPad (5th generation or later) or Android tablets with 7" screens
        </li>
      </ul>

      <Callout type="info" title="Mobile experience">
        While the platform works on mobile, we recommend using a desktop or laptop for complex tasks like
        appointment scheduling, as dragging and calendar views work best on larger screens.
      </Callout>

      {/* Internet Connection */}
      <h2>Internet Connection</h2>

      <p>A reliable internet connection is required for the platform to function.</p>

      <h3>Bandwidth Requirements</h3>
      <div className="not-prose bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Minimum upload speed:</span>
            <span className="text-gray-600">1 Mbps</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Minimum download speed:</span>
            <span className="text-gray-600">2 Mbps</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Recommended upload speed:</span>
            <span className="text-gray-600">5 Mbps+</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Recommended download speed:</span>
            <span className="text-gray-600">10 Mbps+</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Data usage per month:</span>
            <span className="text-gray-600">~500MB (typical usage)</span>
          </div>
        </div>
      </div>

      <h3>Connection Types</h3>
      <p>These connection types are suitable:</p>
      <ul>
        <li>Broadband (cable, fiber, DSL)</li>
        <li>Mobile hotspot (4G LTE or 5G)</li>
        <li>WiFi (2.4GHz or 5GHz)</li>
      </ul>

      <Callout type="warning" title="Important: WiFi recommendations">
        While the platform works on WiFi, we recommend a wired connection for critical operations (large file
        uploads, processing payments). WiFi can be unstable with interference.
      </Callout>

      {/* Software Requirements */}
      <h2>
        <HardDrive className="w-6 h-6 inline mr-2" />
        Software & Plugins
      </h2>

      <h3>Required</h3>
      <ul>
        <li>
          <strong>Operating System:</strong> Windows 7+, macOS 10.12+, or any Linux distribution with a modern
          browser
        </li>
        <li>
          <strong>WebGL Support:</strong> For calendar visualization and charts. Supported in all modern browsers
        </li>
      </ul>

      <h3>Optional but Recommended</h3>
      <ul>
        <li>
          <strong>PDF Reader:</strong> To view and print reports, invoices, and documents. Built into most modern
          browsers
        </li>
        <li>
          <strong>Microsoft Office or Google Workspace:</strong> To edit exported spreadsheets and documents
        </li>
        <li>
          <strong>Antivirus Software:</strong> Recommended for security, doesn't affect platform functionality
        </li>
      </ul>

      <h3>Not Required</h3>
      <ul>
        <li>Adobe Flash (outdated and blocked by browsers)</li>
        <li>Java applets (outdated)</li>
        <li>Browser extensions (generally not needed, but some may conflict)</li>
        <li>VPN (works with VPN, but may slow connection slightly)</li>
      </ul>

      {/* Network & Security */}
      <h2>
        <Lock className="w-6 h-6 inline mr-2" />
        Network & Security Requirements
      </h2>

      <h3>Network Configuration</h3>
      <p>
        If you're behind a corporate firewall, make sure these are allowed:
      </p>
      <ul>
        <li>
          <strong>Domain:</strong> *.medspa.io, api.medspa.io, cdn.medspa.io
        </li>
        <li>
          <strong>Ports:</strong> 443 (HTTPS) - outbound
        </li>
        <li>
          <strong>Protocol:</strong> HTTPS/TLS 1.2+ only
        </li>
        <li>
          <strong>WebSockets:</strong> wss:// (secure WebSocket) for real-time updates
        </li>
      </ul>

      <h3>SSL/TLS Certificates</h3>
      <p>
        The platform requires modern SSL/TLS certificates. If you're seeing certificate warnings:
      </p>
      <ul>
        <li>Update your browser's root certificates</li>
        <li>Make sure your system date/time is correct</li>
        <li>Check that antivirus software isn't intercepting HTTPS connections</li>
        <li>Contact your IT department if on a corporate network</li>
      </ul>

      <Callout type="warning" title="HTTPS only">
        The platform only works over secure HTTPS connections. HTTP (non-secure) will not work. Your data is
        always encrypted in transit and at rest.
      </Callout>

      {/* Storage & Data Requirements */}
      <h2>Storage & Data</h2>

      <h3>Local Storage (Browser Cache)</h3>
      <ul>
        <li>
          <strong>Space needed:</strong> 50-100MB
        </li>
        <li>
          <strong>Purpose:</strong> Caching, preferences, temporary files
        </li>
        <li>
          <strong>Automatic:</strong> Browser automatically manages cache
        </li>
      </ul>

      <h3>Cloud Storage (Data Retention)</h3>
      <p>
        All your data is stored securely in our cloud infrastructure. Data retention depends on your plan:
      </p>
      <ul>
        <li>
          <strong>Active data:</strong> Stored indefinitely while your account is active
        </li>
        <li>
          <strong>After cancellation:</strong> 90-day retention period before deletion
        </li>
        <li>
          <strong>Backups:</strong> Automatic daily backups, 30-day retention
        </li>
        <li>
          <strong>HIPAA-compliant:</strong> All data encrypted at rest with AES-256
        </li>
      </ul>

      {/* Accessibility */}
      <h2>Accessibility</h2>

      <p>
        The platform is designed to be accessible to users with disabilities:
      </p>
      <ul>
        <li>WCAG 2.1 Level AA compliant</li>
        <li>Keyboard navigation throughout</li>
        <li>Screen reader compatible (NVDA, JAWS, VoiceOver)</li>
        <li>High contrast modes supported</li>
        <li>Adjustable text sizes</li>
        <li>Color-blind friendly designs</li>
      </ul>

      <Callout type="success" title="Accessibility support">
        If you have accessibility needs not met by these features, contact our support team. We're committed to
        making the platform usable for everyone.
      </Callout>

      {/* Troubleshooting */}
      <h2>Troubleshooting Setup Issues</h2>

      <h3>The platform won't load</h3>
      <ul>
        <li>
          <strong>Check internet connection:</strong> Make sure you have an active internet connection with at
          least 2 Mbps download speed
        </li>
        <li>
          <strong>Clear browser cache:</strong> Try clearing cookies and cached files
        </li>
        <li>
          <strong>Try a different browser:</strong> Test in Chrome, Firefox, Safari, or Edge
        </li>
        <li>
          <strong>Disable browser extensions:</strong> Some extensions can interfere with web apps
        </li>
        <li>
          <strong>Check firewall:</strong> Make sure your firewall allows access to *.medspa.io
        </li>
      </ul>

      <h3>Pages load slowly</h3>
      <ul>
        <li>
          <strong>Check internet speed:</strong> Run a speed test (speedtest.net). You need at least 5 Mbps for
          good performance
        </li>
        <li>
          <strong>Close other tabs/apps:</strong> Other apps and browser tabs can consume bandwidth
        </li>
        <li>
          <strong>Try a wired connection:</strong> WiFi can be slower and more unstable than wired
        </li>
        <li>
          <strong>Restart your router:</strong> Occasionally helps with connection issues
        </li>
      </ul>

      <h3>Features don't work</h3>
      <ul>
        <li>
          <strong>Make sure JavaScript is enabled:</strong> The platform requires JavaScript to function
        </li>
        <li>
          <strong>Check browser version:</strong> Update to the latest version of your browser
        </li>
        <li>
          <strong>Disable browser extensions:</strong> Some extensions block functionality
        </li>
        <li>
          <strong>Check browser console:</strong> Open developer tools (F12) to look for error messages
        </li>
      </ul>

      {/* Next Steps */}
      <h2>What's Next?</h2>

      <p>Once you've confirmed your system meets the requirements:</p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <Link
          href="/getting-started/account-setup"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Account Setup Guide</h3>
          <p className="text-sm text-gray-500">Set up your account and configure basic settings</p>
        </Link>

        <Link
          href="/getting-started/quick-start"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Quick Start Guide</h3>
          <p className="text-sm text-gray-500">Get up and running in your first 30 minutes</p>
        </Link>
      </div>

      <Callout type="info">
        Still having issues? Contact{' '}
        <a href="mailto:support@medspa.io" className="text-primary-600 hover:underline">
          support@medspa.io
        </a>
        {' '}or call 1-866-200-0200 for technical assistance.
      </Callout>
    </div>
  )
}
