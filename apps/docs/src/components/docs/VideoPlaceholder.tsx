import { Play, Video } from 'lucide-react'

interface VideoPlaceholderProps {
  title: string
  duration?: string
  description?: string
}

export function VideoPlaceholder({ title, duration, description }: VideoPlaceholderProps) {
  return (
    <div className="video-placeholder">
      <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
        <Play className="w-8 h-8 text-primary-600 fill-primary-600 ml-1" />
      </div>
      <div className="text-center mt-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Video className="w-4 h-4" />
          <span className="font-semibold">{title}</span>
        </div>
        {duration && (
          <span className="text-sm text-primary-500">{duration}</span>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-2 max-w-md">{description}</p>
        )}
      </div>
    </div>
  )
}
