import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Percent, CheckCircle2, DollarSign, Users, Tag } from 'lucide-react'

export default function GroupDiscountsPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Percent className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Group Discounts</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Reward group bookings with automatic discounts. Incentivize bridal parties,
        corporate events, and friend groups.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Groups bring multiple new patients at once. A 10% discount on a bridal party
        of 8 is worth it when 5 of them become regular clients. Plus, groups fill
        your schedule efficiently.
      </p>

      <h2 id="discount-types">Discount Types</h2>

      <h3>Percentage Off</h3>
      <p>
        Reduce the total by a percentage:
      </p>
      <ul>
        <li>10% off groups of 4+</li>
        <li>15% off groups of 6+</li>
        <li>20% off groups of 8+</li>
      </ul>

      <h3>Fixed Amount</h3>
      <p>
        Dollar amount off the group total:
      </p>
      <ul>
        <li>$50 off groups of 4+</li>
        <li>$100 off groups of 6+</li>
      </ul>

      <h3>Free Service</h3>
      <p>
        Include a complimentary service:
      </p>
      <ul>
        <li>Free facial for the bride with 4+ bridesmaids</li>
        <li>Free champagne service for groups of 6+</li>
      </ul>

      <Callout type="tip" title="Psychology Works">
        &quot;Book 4, bride is free&quot; sounds better than &quot;20% off for 5 people&quot; even
        if the math is the same. Frame discounts as rewards.
      </Callout>

      <h2 id="setting-up">Setting Up Group Discounts</h2>
      <ol>
        <li>Go to Settings → Pricing → Group Discounts</li>
        <li>Click &quot;Add Discount Rule&quot;</li>
        <li>Set the minimum group size</li>
        <li>Choose discount type (%, $, or free service)</li>
        <li>Select which services qualify</li>
        <li>Save the rule</li>
      </ol>

      <h2 id="automatic">Automatic Application</h2>
      <p>
        Discounts apply automatically when:
      </p>
      <ul>
        <li>A group meets the size requirement</li>
        <li>Services match the discount rules</li>
        <li>No manual override is set</li>
      </ul>
      <p>
        Staff see the discount at checkout with a &quot;Group Discount Applied&quot; label.
      </p>

      <h2 id="stacking">Discount Stacking</h2>
      <p>
        Configure whether group discounts can combine with:
      </p>
      <ul>
        <li><strong>New patient discounts</strong> &mdash; Usually yes</li>
        <li><strong>Package pricing</strong> &mdash; Usually no (already discounted)</li>
        <li><strong>Promotional codes</strong> &mdash; Your choice</li>
        <li><strong>Membership discounts</strong> &mdash; Usually no</li>
      </ul>

      <h2 id="overrides">Manual Overrides</h2>
      <p>
        Staff can adjust discounts at checkout:
      </p>
      <ul>
        <li><strong>Increase discount</strong> &mdash; For special occasions or VIPs</li>
        <li><strong>Remove discount</strong> &mdash; If group breaks up or rules don&apos;t apply</li>
        <li><strong>Add custom discount</strong> &mdash; One-time special pricing</li>
      </ul>
      <p>
        Overrides are logged with the staff member&apos;s name and reason.
      </p>

      <Callout type="info" title="Manager Approval">
        You can require manager approval for discounts over a certain threshold
        or custom discounts beyond the standard rules.
      </Callout>

      <h2 id="reporting">Discount Reporting</h2>
      <p>
        Track the impact of group discounts:
      </p>
      <ul>
        <li>Total discount given</li>
        <li>Number of group bookings</li>
        <li>Revenue from groups (before/after discount)</li>
        <li>New patient acquisition from groups</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/group-booking/create" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Creating Groups</h3>
          <p className="text-sm text-gray-500">Book multiple people</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Packages</h3>
          <p className="text-sm text-gray-500">Bundled service pricing</p>
        </Link>
      </div>
    </div>
  )
}
