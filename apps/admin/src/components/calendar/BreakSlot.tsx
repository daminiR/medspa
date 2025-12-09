import React from 'react'
import { Coffee } from 'lucide-react'
import { Break } from '@/lib/data'
import { CalendarSettings } from '@/types/calendar'
import { getBreakStyle } from '@/utils/calendarHelpers'

interface BreakSlotProps {
	breakItem: Break
	timeSlotHeight: number
	calendarSettings: CalendarSettings
	practitionerInitials?: string
	onClick: (e: React.MouseEvent, breakItem: Break) => void
	style?: React.CSSProperties
}

export default function BreakSlot({
	breakItem,
	timeSlotHeight,
	calendarSettings,
	practitionerInitials,
	onClick,
	style
}: BreakSlotProps) {
	const defaultStyle = getBreakStyle(breakItem, timeSlotHeight, calendarSettings.startHour)

	return (
		<div
			data-break="true"
			className={`absolute rounded-md text-white ${calendarSettings.compactView ? 'p-1' : 'p-2'
				} cursor-pointer hover:opacity-90 overflow-hidden transition-opacity shadow-sm z-10`}
			style={{
				...defaultStyle,
				...style,
				background: `repeating-linear-gradient(
          45deg,
          #6B7280,
          #6B7280 10px,
          #7F8694 10px,
          #7F8694 20px
        )`
			}}
			onClick={(e) => onClick(e, breakItem)}
		>
			<div className="text-xs font-medium flex items-center">
				<Coffee className="h-3 w-3 mr-1" />
				{breakItem.type === 'lunch' ? 'Lunch' :
					breakItem.type === 'personal' ? 'Personal' :
						breakItem.type === 'meeting' ? 'Meeting' :
							breakItem.type === 'training' ? 'Training' : 'Break'}
			</div>
			{practitionerInitials && (
				<div className="text-xs opacity-90">{practitionerInitials}</div>
			)}
			{breakItem.availableForEmergencies && (
				<div className="text-xs opacity-90 mt-0.5">📱 Available</div>
			)}
		</div>
	)
}
