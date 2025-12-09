import React from 'react'
import { Clock } from 'lucide-react'

interface PostTreatmentBlockProps {
	duration: number // minutes
	practitionerName: string
	serviceName: string
}

export default function PostTreatmentBlock({ duration, practitionerName, serviceName }: PostTreatmentBlockProps) {
	return (
		<div 
			className="absolute left-0 right-0 bg-yellow-100 border border-yellow-300 border-dashed opacity-80"
			style={{ 
				height: `${(duration / 15) * 20}px`,
				minHeight: '20px'
			}}
		>
			<div className="p-1 text-xs text-yellow-800 flex items-center gap-1 h-full">
				<Clock className="h-3 w-3 flex-shrink-0" />
				<span className="truncate">
					Sanitization ({duration}min)
				</span>
			</div>
		</div>
	)
}