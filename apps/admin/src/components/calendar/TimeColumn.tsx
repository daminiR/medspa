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
		<div className="w-20 bg-gray-50 flex-shrink-0">
			{/* Add spacer for header in week view */}
			{headerHeight > 0 && (
				<div style={{ height: `${headerHeight}px` }} className="border-b border-gray-200" />
			)}
			<div className="relative" style={{ height: `${timeSlotHeight * (endHour - startHour)}px` }}>
				{/* Hour lines and labels */}
				{Array.from({ length: endHour - startHour }, (_, i) => {
					const hour = i + startHour
					const time = moment().hour(hour).minute(0).format('h:mm A')
					return (
						<div key={hour} className="relative" style={{ height: `${timeSlotHeight}px` }}>
							{/* Time label positioned exactly at the hour line */}
							<div className="absolute right-2 text-xs text-gray-500" style={{ top: '-6px' }}>
								{time}
							</div>
							<div className="absolute bottom-0 left-0 right-0 border-b border-gray-200" />
						</div>
					)
				})}
			</div>
		</div>
	)
}
