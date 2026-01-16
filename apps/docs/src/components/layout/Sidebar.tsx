'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation, NavItem, NavSection } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Rocket, Settings, User, Calendar, Users, MessageCircle,
  CreditCard, BarChart, Clock, Zap, Users2, Repeat, FileText,
  Mic, Sparkles, Book, Key, Code, HelpCircle, Lightbulb, Tag,
  LifeBuoy, ChevronDown, ChevronRight, Webhook, MessageSquare, Smartphone,
  Package, LayoutDashboard, UserCog
} from 'lucide-react'

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'home': Home,
  'rocket': Rocket,
  'settings': Settings,
  'user': User,
  'calendar': Calendar,
  'users': Users,
  'message-circle': MessageCircle,
  'credit-card': CreditCard,
  'bar-chart': BarChart,
  'clock': Clock,
  'zap': Zap,
  'users-2': Users2,
  'repeat': Repeat,
  'file-text': FileText,
  'mic': Mic,
  'sparkles': Sparkles,
  'book': Book,
  'key': Key,
  'code': Code,
  'help-circle': HelpCircle,
  'lightbulb': Lightbulb,
  'tag': Tag,
  'life-buoy': LifeBuoy,
  'webhook': Webhook,
  'message-square': MessageSquare,
  'smartphone': Smartphone,
  'package': Package,
  'layout-dashboard': LayoutDashboard,
  'user-cog': UserCog,
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null

  return (
    <span className={cn(
      'ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
      status === 'complete' && 'bg-green-100 text-green-700',
      status === 'in-progress' && 'bg-yellow-100 text-yellow-700',
      status === 'planned' && 'bg-purple-100 text-purple-700'
    )}>
      {status === 'complete' ? 'Done' : status === 'in-progress' ? 'WIP' : 'Soon'}
    </span>
  )
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(pathname.startsWith(item.href))
  const hasChildren = item.items && item.items.length > 0
  const isActive = pathname === item.href
  const Icon = item.icon ? iconMap[item.icon] : null

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm',
          depth === 0 && 'font-medium',
          depth > 0 && 'ml-4 text-[13px]',
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {Icon && <Icon className={cn('w-4 h-4', isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600')} />}
        {hasChildren ? (
          <>
            <span className="flex-1">{item.title}</span>
            <StatusBadge status={item.status} />
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </>
        ) : (
          <Link href={item.href} className="flex-1 flex items-center">
            <span className="flex-1">{item.title}</span>
            <StatusBadge status={item.status} />
          </Link>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.items!.map((subItem) => (
            <NavItemComponent key={subItem.href} item={subItem} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function NavSectionComponent({ section }: { section: NavSection }) {
  return (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        {navigation.map((section) => (
          <NavSectionComponent key={section.title} section={section} />
        ))}
      </nav>
    </aside>
  )
}
