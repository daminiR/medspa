import { cn } from '@/lib/utils'
import { Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'

interface CalloutProps {
  type: 'info' | 'warning' | 'success' | 'tip'
  title?: string
  children: React.ReactNode
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  tip: Lightbulb,
}

const titles = {
  info: 'Note',
  warning: 'Warning',
  success: 'Success',
  tip: 'Pro Tip',
}

export function Callout({ type, title, children }: CalloutProps) {
  const Icon = icons[type]

  return (
    <div className={cn('callout', type)}>
      <div className="flex items-start gap-3">
        <Icon className={cn(
          'w-5 h-5 mt-0.5 flex-shrink-0',
          type === 'info' && 'text-blue-500',
          type === 'warning' && 'text-amber-500',
          type === 'success' && 'text-green-500',
          type === 'tip' && 'text-primary-500'
        )} />
        <div>
          <p className={cn(
            'font-semibold mb-1',
            type === 'info' && 'text-blue-700',
            type === 'warning' && 'text-amber-700',
            type === 'success' && 'text-green-700',
            type === 'tip' && 'text-primary-700'
          )}>
            {title || titles[type]}
          </p>
          <div className="text-sm text-gray-600">{children}</div>
        </div>
      </div>
    </div>
  )
}
