import React from 'react'
import moment from 'moment'

interface TimeColumnProps {
	timeSlotHeight: number
	startHour: number
	endHour: number
	headerHeight?: number // Optional header height for week view
}

export default function TimeColumn({ timeSlotHeight, startHour, endHour, headerHeight = 0 }: TimeColumnProps) {
	return (
		<div className="w-20 bg-gradient-to-b from-gray-50 to-white flex-shrink-0 border-r border-gray-100">
			{/* Add spacer for header in week view */}
			{headerHeight > 0 && (
				<div style={{ height: `${headerHeight}px` }} className="border-b border-gray-200" />
			)}
			<div className="relative" style={{ height: `${timeSlotHeight * (endHour - startHour)}px` }}>
				{/* Hour lines and labels */}
				{Array.from({ length: endHour - startHour }, (_, i) => {
					const hour = i + startHour
					const isPM = hour >= 12
					const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
					return (
						<div key={hour} className="relative" style={{ height: `${timeSlotHeight}px` }}>
							{/* Time label - cleaner typography */}
							<div className="absolute right-2 flex items-baseline gap-0.5" style={{ top: '-8px' }}>
								<span className="text-sm font-medium text-gray-700 tabular-nums">
									{displayHour}
								</span>
								<span className="text-[10px] font-medium text-gray-400 uppercase">
									{isPM ? 'pm' : 'am'}
								</span>
							</div>
							<div className="absolute bottom-0 left-4 right-0 border-b border-gray-200" />
						</div>
					)
				})}
			</div>
		</div>
	)
}
