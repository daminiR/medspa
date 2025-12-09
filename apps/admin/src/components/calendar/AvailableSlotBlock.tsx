import React from 'react'
import moment from 'moment'
import { ContinuousSlotBlock } from '@/types/calendar'
import { getContinuousBlockStyle, getTimeFromY } from '@/utils/calendarHelpers'

interface AvailableSlotBlockProps {
	block: ContinuousSlotBlock
	timeSlotHeight: number
	onSlotClick: (slot: any) => void
	style?: React.CSSProperties
	compact?: boolean
}

export default function AvailableSlotBlock({
	block,
	timeSlotHeight,
	onSlotClick,
	style,
	compact = false
}: AvailableSlotBlockProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()

		// Find the closest slot to the click position
		const rect = e.currentTarget.getBoundingClientRect()
		const clickY = e.clientY
		const time = getTimeFromY(clickY, rect, timeSlotHeight)
		const clickMinutes = time.hour * 60 + time.minute

		let closestSlot = block.slots[0]
		let closestDistance = Infinity

		block.slots.forEach(slot => {
			const slotMinutes = slot.startTime.getHours() * 60 + slot.startTime.getMinutes()
			const distance = Math.abs(slotMinutes - clickMinutes)
			if (distance < closestDistance) {
				closestDistance = distance
				closestSlot = slot
			}
		})

		onSlotClick(closestSlot)
	}

	return (
		<div
			data-highlight="true"
			className="absolute transition-all duration-200 cursor-pointer z-8"
			style={{
				...getContinuousBlockStyle(block, timeSlotHeight),
				...style
			}}
			onClick={handleClick}
		>
			{/* Gradient background */}
			<div
				className="absolute inset-0 rounded-md overflow-hidden"
				style={{
					background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.15) 100%)',
					border: '1px solid rgba(251, 191, 36, 0.5)'
				}}
			>
				{/* Striped pattern overlay */}
				<div
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(251, 191, 36, 0.2) 10px,
              rgba(251, 191, 36, 0.2) 20px
            )`
					}}
				/>
			</div>

			{/* Content */}
			<div className="relative h-full flex flex-col justify-center items-center text-yellow-900 p-1">
				<div className="text-xs font-medium">
					Available
				</div>
				{!compact && (
					<div className="text-xs opacity-75">
						{moment(block.startTime).format('h:mm A')} - {moment(block.endTime).format('h:mm A')}
					</div>
				)}
				{block.slots.length > 1 && (
					<div className="text-xs opacity-60 mt-1">
						{block.slots.length} slots
					</div>
				)}
			</div>
		</div>
	)
}
