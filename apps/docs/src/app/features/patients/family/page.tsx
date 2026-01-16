import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Users, CheckCircle2, UserPlus, Heart, Calendar, CreditCard } from 'lucide-react'

export default function FamilyLinkingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Family Linking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Connect family members for easy group bookings. Perfect for couples treatments,
        mother-daughter spa days, and bridal parties.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        When a wife wants to book Botox for herself and her husband, or a mom brings her
        daughter for a facial, you shouldn&apos;t have to look up two separate profiles and
        coordinate manually. Family linking lets you see connections at a glance and
        book everyone together.
      </p>

      <h2 id="use-cases">Common Use Cases</h2>

      <h3>Couples Treatments</h3>
      <p>
        Link spouses or partners. When one books, you can easily add the other to the
        same time slot or back-to-back appointments.
      </p>

      <h3>Mother-Daughter Visits</h3>
      <p>
        A popular combination - mom gets Botox while daughter gets a facial. Linking them
        means you can book both with one conversation.
      </p>

      <h3>Bridal Parties</h3>
      <p>
        Link the bride with bridesmaids and mother of the bride. When planning pre-wedding
        treatments, you can see the whole group and coordinate schedules.
      </p>

      <Callout type="tip" title="Cross-Selling Opportunity">
        When a linked family member books, you can suggest: &quot;Would [spouse name] like
        to come in too? I see they&apos;re due for their treatment.&quot;
      </Callout>

      <h2 id="how-it-works">How It Works</h2>

      <h3>Linking Family Members</h3>
      <ol>
        <li>Open either patient&apos;s profile</li>
        <li>Go to the Medical Profile tab</li>
        <li>Scroll to &quot;Family Members&quot; section</li>
        <li>Click &quot;Link Family Member&quot;</li>
        <li>Search for the other patient</li>
        <li>Select their relationship (spouse, child, parent, sibling)</li>
      </ol>

      <h3>What Gets Linked</h3>
      <ul>
        <li><strong>Profile access</strong> &mdash; Jump between family profiles with one click</li>
        <li><strong>Group booking</strong> &mdash; Book multiple family members at once</li>
        <li><strong>Relationship display</strong> &mdash; See how they&apos;re connected</li>
      </ul>

      <h3>What Stays Separate</h3>
      <ul>
        <li><strong>Medical information</strong> &mdash; Each person&apos;s health data is private</li>
        <li><strong>Payment methods</strong> &mdash; Cards on file don&apos;t transfer</li>
        <li><strong>Treatment history</strong> &mdash; Individual records stay individual</li>
      </ul>

      <Callout type="info" title="Privacy Note">
        Linking family members is for scheduling convenience only. Medical records and
        payment information remain completely separate and private.
      </Callout>

      <h2 id="relationship-types">Relationship Types</h2>
      <ul>
        <li><strong>Spouse/Partner</strong> &mdash; For couples</li>
        <li><strong>Child</strong> &mdash; For parent-child relationships</li>
        <li><strong>Parent</strong> &mdash; The reverse of child</li>
        <li><strong>Sibling</strong> &mdash; Brothers/sisters</li>
      </ul>

      <h2 id="group-booking">Using with Group Booking</h2>
      <p>
        Family linking works seamlessly with our Group Booking feature. When you create
        a group appointment:
      </p>
      <ol>
        <li>Start with one family member</li>
        <li>Click &quot;Add to Group&quot;</li>
        <li>Linked family members appear at the top of the search</li>
        <li>Select services for each person</li>
        <li>Book everyone together</li>
      </ol>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/group-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Group Booking</h3>
          <p className="text-sm text-gray-500">Book multiple people at once</p>
        </Link>
        <Link href="/features/patients/profiles" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">Complete patient records</p>
        </Link>
      </div>
    </div>
  )
}
