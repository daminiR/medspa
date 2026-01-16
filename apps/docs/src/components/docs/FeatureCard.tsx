import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle, Clock, Calendar } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  status?: 'complete' | 'in-progress' | 'planned'
  completion?: number
}

export function FeatureCard({ title, description, href, icon, status, completion }: FeatureCardProps) {
  return (
    <Link href={href} className="block">
      <div className="feature-card h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
          {status && (
            <span className={cn(
              'status-badge',
              status === 'complete' && 'complete',
              status === 'in-progress' && 'in-progress',
              status === 'planned' && 'planned'
            )}>
              {status === 'complete' && <CheckCircle className="w-3 h-3" />}
              {status === 'in-progress' && <Clock className="w-3 h-3" />}
              {status === 'planned' && <Calendar className="w-3 h-3" />}
              {status === 'complete' ? 'Complete' : status === 'in-progress' ? 'In Progress' : 'Coming Soon'}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>

        {completion !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{completion}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
          Learn more
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
