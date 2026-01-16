import React, { useState } from 'react'
import { Coffee, Users, User, Palmtree, GraduationCap, Clock } from 'lucide-react'
import { Break, BREAK_COLORS } from '@/lib/data'
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

// Icons for each break type
const breakIcons: Record<Break['type'], React.ReactNode> = {
	lunch: <Coffee className="h-3 w-3" />,
	meeting: <Users className="h-3 w-3" />,
	personal: <User className="h-3 w-3" />,
	out_of_office: <Palmtree className="h-3 w-3" />,
	training: <GraduationCap className="h-3 w-3" />,
	other: <Clock className="h-3 w-3" />
}

export default function BreakSlot({
	breakItem,
	timeSlotHeight,
	calendarSettings,
	practitionerInitials,
	onClick,
	style
}: BreakSlotProps) {
	const [showTooltip, setShowTooltip] = useState(false)
	const defaultStyle = getBreakStyle(breakItem, timeSlotHeight, calendarSettings.startHour)
	const colors = BREAK_COLORS[breakItem.type] || BREAK_COLORS.other

	// Format time for tooltip
	const formatTime = (date: Date) => {
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
	}

	return (
		<div
			data-break="true"
			className={`absolute rounded-md ${calendarSettings.compactView ? 'p-1' : 'p-2'
				} cursor-pointer hover:opacity-90 overflow-hidden transition-opacity shadow-sm z-10 border`}
			style={{
				...defaultStyle,
				...style,
				background: `repeating-linear-gradient(
          45deg,
          ${colors.bg},
          ${colors.bg} 10px,
          ${colors.stripe} 10px,
          ${colors.stripe} 20px
        )`,
				borderColor: colors.stripe,
				color: '#374151' // Dark gray text for better readability on light backgrounds
			}}
			onClick={(e) => onClick(e, breakItem)}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			{/* Tooltip */}
			{showTooltip && (
				<div
					className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none"
					style={{ minWidth: '180px' }}
				>
					<div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
						<div className="font-semibold mb-1">{colors.label}</div>
						<div className="text-gray-300">
							{formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
						</div>
						{breakItem.notes && (
							<div className="text-gray-300 mt-1 border-t border-gray-700 pt-1">
								{breakItem.notes}
							</div>
						)}
						{breakItem.isRecurring && (
							<div className="text-blue-300 mt-1 text-[10px]">
								🔄 Recurring
							</div>
						)}
						{/* Tooltip arrow */}
						<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
					</div>
				</div>
			)}

			<div className="text-xs font-medium flex items-center gap-1">
				{breakIcons[breakItem.type]}
				{colors.label}
			</div>
			{practitionerInitials && (
				<div className="text-xs opacity-75">{practitionerInitials}</div>
			)}
			{breakItem.availableForEmergencies && (
				<div className="text-xs opacity-75 mt-0.5">📱 Available</div>
			)}
		</div>
	)
}
