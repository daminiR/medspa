import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Search, CheckCircle2, Filter, Download, Users, Bookmark } from 'lucide-react'

export default function PatientSearchPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Search className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Search & Filters</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Find any patient instantly with powerful search. Filter by any criteria,
        save searches for reuse, and export results for marketing.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Patient Search Tutorial"
        duration="3 min"
        description="Master the patient search and filtering tools"
      />

      <h2 id="quick-search">Quick Search</h2>
      <p>
        The global search bar is available from any page. Just start typing to find patients by:
      </p>
      <ul>
        <li><strong>Name</strong> &mdash; First name, last name, or preferred name</li>
        <li><strong>Phone</strong> &mdash; Full or partial phone number</li>
        <li><strong>Email</strong> &mdash; Full or partial email address</li>
      </ul>

      <Callout type="tip" title="Keyboard Shortcut">
        Press <code>/</code> from any page to jump to the search bar. Start typing immediately
        to search.
      </Callout>

      <h3>Search Results</h3>
      <p>
        As you type, results appear instantly showing:
      </p>
      <ul>
        <li>Patient name and photo (if available)</li>
        <li>Phone number</li>
        <li>Last visit date</li>
        <li>Quick action buttons (View, Book, Message)</li>
      </ul>

      <h2 id="advanced-filters">Advanced Filters</h2>
      <p>
        Use filters to find specific groups of patients:
      </p>

      <h3>Visit Filters</h3>
      <ul>
        <li><strong>Last Visit</strong> &mdash; Within 30/60/90 days, or custom range</li>
        <li><strong>First Visit</strong> &mdash; New patients in date range</li>
        <li><strong>No Visit Since</strong> &mdash; Patients who haven&apos;t been in for X months</li>
        <li><strong>Total Visits</strong> &mdash; 1 visit, 2-5 visits, 5+ visits</li>
      </ul>

      <h3>Service Filters</h3>
      <ul>
        <li><strong>Services Received</strong> &mdash; Patients who&apos;ve had specific services</li>
        <li><strong>Never Had</strong> &mdash; Patients who haven&apos;t tried a service</li>
        <li><strong>Provider</strong> &mdash; Patients of a specific provider</li>
      </ul>

      <h3>Financial Filters</h3>
      <ul>
        <li><strong>Total Spend</strong> &mdash; Above or below threshold</li>
        <li><strong>Has Package</strong> &mdash; Patients with active packages</li>
        <li><strong>Outstanding Balance</strong> &mdash; Patients who owe money</li>
        <li><strong>Card on File</strong> &mdash; Has/doesn&apos;t have card saved</li>
      </ul>

      <h3>Other Filters</h3>
      <ul>
        <li><strong>Marketing Opt-In</strong> &mdash; Can receive promotional messages</li>
        <li><strong>Birthday Month</strong> &mdash; For birthday promotions</li>
        <li><strong>Referral Source</strong> &mdash; How they found you</li>
        <li><strong>Tags</strong> &mdash; Custom tags you&apos;ve assigned</li>
      </ul>

      <h2 id="filter-examples">Common Filter Examples</h2>

      <div className="not-prose space-y-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Lapsed Botox Patients</h4>
          <p className="text-sm text-blue-800 mb-2">Find patients due for their next Botox treatment:</p>
          <code className="text-xs bg-blue-100 px-2 py-1 rounded">
            Service = &quot;Botox&quot; AND Last Visit &gt; 90 days ago
          </code>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">High-Value Patients</h4>
          <p className="text-sm text-green-800 mb-2">Your top spenders for VIP outreach:</p>
          <code className="text-xs bg-green-100 px-2 py-1 rounded">
            Total Spend &gt; $2,000 AND Visits &gt; 3
          </code>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">Filler Candidates</h4>
          <p className="text-sm text-purple-800 mb-2">Botox patients who haven&apos;t tried filler:</p>
          <code className="text-xs bg-purple-100 px-2 py-1 rounded">
            Service = &quot;Botox&quot; AND Never Had = &quot;Filler&quot;
          </code>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">Birthday This Month</h4>
          <p className="text-sm text-amber-800 mb-2">Send birthday offers:</p>
          <code className="text-xs bg-amber-100 px-2 py-1 rounded">
            Birthday Month = Current Month AND Marketing Opt-In = Yes
          </code>
        </div>
      </div>

      <h2 id="saved-searches">Saved Searches</h2>
      <p>
        Save frequently used filter combinations for quick access:
      </p>
      <ol>
        <li>Set up your filters</li>
        <li>Click &quot;Save Search&quot;</li>
        <li>Name your search (e.g., &quot;Lapsed Botox Patients&quot;)</li>
        <li>Access saved searches from the dropdown</li>
      </ol>

      <Callout type="info">
        Saved searches are dynamic &mdash; they always show current results based on your filters,
        not a static list from when you saved it.
      </Callout>

      <h2 id="export">Exporting Results</h2>
      <p>
        Export search results for external use:
      </p>

      <h3>Export to CSV</h3>
      <p>
        Download a spreadsheet with patient data for:
      </p>
      <ul>
        <li>Mail merge campaigns</li>
        <li>External marketing tools</li>
        <li>Analysis in Excel</li>
        <li>Backup records</li>
      </ul>

      <h3>Exportable Fields</h3>
      <ul>
        <li>Name, email, phone</li>
        <li>Last visit date</li>
        <li>Total spend</li>
        <li>Services received</li>
        <li>Custom fields</li>
      </ul>

      <Callout type="warning" title="HIPAA Reminder">
        Exported data contains PHI. Handle according to your HIPAA policies and only share
        with authorized parties.
      </Callout>

      <h2 id="tags">Patient Tags</h2>
      <p>
        Create custom tags to organize patients:
      </p>
      <ul>
        <li><strong>VIP</strong> &mdash; High-value patients</li>
        <li><strong>Influencer</strong> &mdash; Social media presence</li>
        <li><strong>Sensitive</strong> &mdash; Requires extra care/attention</li>
        <li><strong>Staff Family</strong> &mdash; Employee family members</li>
        <li><strong>Referral Source</strong> &mdash; Came from specific marketing</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients/profiles" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">Full patient records</p>
        </Link>
        <Link href="/features/messaging/campaigns" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Campaigns</h3>
          <p className="text-sm text-gray-500">Message filtered patients</p>
        </Link>
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-500">Patient analytics</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">Book appointments</p>
        </Link>
      </div>
    </div>
  )
}
