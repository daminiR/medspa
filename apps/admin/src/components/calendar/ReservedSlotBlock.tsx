import React from 'react'
import { ReservedSlot } from '@/types/calendar'

interface ReservedSlotBlockProps {
	slot: ReservedSlot
	timeSlotHeight: number
	style?: React.CSSProperties
}

export default function ReservedSlotBlock({
	slot,
	timeSlotHeight,
	style
}: ReservedSlotBlockProps) {
	const startHour = slot.startTime.getHours()
	const startMinutes = slot.startTime.getMinutes()
	const endHour = slot.endTime.getHours()
	const endMinutes = slot.endTime.getMinutes()

	const startTotalMinutes = (startHour - 8) * 60 + startMinutes
	const endTotalMinutes = (endHour - 8) * 60 + endMinutes
	const duration = endTotalMinutes - startTotalMinutes

	const topOffset = startTotalMinutes * (timeSlotHeight / 60)
	const height = duration * (timeSlotHeight / 60)

	return (
		<div
			className="absolute transition-all duration-200 z-10"
			style={{
				top: `${topOffset}px`,
				height: `${height}px`,
				...style
			}}
		>
			<div
				className="absolute inset-0 rounded-md overflow-hidden shadow-sm"
				style={{
					backgroundColor: '#E5E7EB', // gray-200
					border: '2px dashed #6B7280' // gray-500 dashed border
				}}
			>
				{/* Diagonal stripes pattern */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 4px,
              rgba(107, 114, 128, 0.1) 4px,
              rgba(107, 114, 128, 0.1) 8px
            )`
					}}
				/>
			</div>

			{/* Content */}
			<div className="relative h-full flex flex-col justify-center items-center text-gray-600">
				<div className="bg-white px-2 py-1 rounded shadow-sm">
					<div className="text-xs font-semibold text-gray-700">Reserved</div>
				</div>
			</div>
		</div>
	)
}
