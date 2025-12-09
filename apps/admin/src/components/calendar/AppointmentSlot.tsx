import React from 'react'
import { Appointment, services, getGroupInfoForAppointment } from '@/lib/data'
import { CalendarSettings } from '@/types/calendar'
import { getAppointmentStyle } from '@/utils/calendarHelpers'
import { AlertTriangle, MapPin, Layers, Zap, UsersRound } from 'lucide-react'
import { mockRooms } from '@/lib/mockResources'

interface AppointmentSlotProps {
	appointment: Appointment
	timeSlotHeight: number
	calendarSettings: CalendarSettings
	practitionerInitials?: string
	onClick: (e: React.MouseEvent, appointment: Appointment) => void
	style?: React.CSSProperties
	onDragStart?: (appointment: Appointment) => void
	onDragEnd?: () => void
	doubleBookingMode?: boolean
}

export default function AppointmentSlot({
	appointment,
	timeSlotHeight,
	calendarSettings,
	practitionerInitials,
	onClick,
	style,
	onDragStart,
	onDragEnd,
	doubleBookingMode = false
}: AppointmentSlotProps) {
	const defaultStyle = getAppointmentStyle(appointment, timeSlotHeight, calendarSettings.startHour)
	
	// Override background color for cancelled appointments
	if (appointment.status === 'cancelled') {
		defaultStyle.backgroundColor = '#9CA3AF' // gray-400
	}
	
	// Override background color for deleted appointments
	if (appointment.status === 'deleted') {
		defaultStyle.backgroundColor = '#6B7280' // gray-500 (darker for better contrast)
		;(defaultStyle as any).opacity = 0.8
		;(defaultStyle as any).border = '2px dashed #9CA3AF' // dashed border for deleted indication
		;(defaultStyle as any).backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)' // subtle striped pattern
	}
	
	// Apply double booking mode styling
	if (doubleBookingMode && (appointment.status === 'cancelled' || appointment.status === 'deleted')) {
		// Shift cancelled/deleted appointments to the right
		;(defaultStyle as any).width = '40%'
		;(defaultStyle as any).left = '60%'
		;(defaultStyle as any).right = 'auto'
		;(defaultStyle as any).opacity = 0.6
		;(defaultStyle as any).zIndex = 5
		;(defaultStyle as any).transform = 'scale(0.95)'
		;(defaultStyle as any).boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1)'
	}

	const handleDragStart = (e: React.DragEvent) => {
		// Set the drag data using text/plain for compatibility
		const appointmentData = JSON.stringify({ type: 'appointment', data: appointment })
		e.dataTransfer.setData('text/plain', appointmentData)
		e.dataTransfer.effectAllowed = 'move'
		
		// Add a visual effect
		const target = e.target as HTMLElement
		target.style.opacity = '0.5'
		
		// Call the parent's drag start handler
		onDragStart?.(appointment)
	}

	const handleDragEnd = (e: React.DragEvent) => {
		// Reset visual effect
		const target = e.target as HTMLElement
		target.style.opacity = '1'
		
		// Call the parent's drag end handler
		onDragEnd?.()
	}
	
	// Check if this is a staggered appointment
	const service = services.find(s => s.name === appointment.serviceName)
	const isStaggered = service && service.scheduledDuration && service.scheduledDuration < service.duration

	// Check if appointment is narrow (part of overlapping group)
	const isNarrow = style?.width && typeof style.width === 'string' && style.width.includes('%') && parseInt(style.width) < 60
	const isOverlapping = style?.width && typeof style.width === 'string' && style.width.includes('%') && parseInt(style.width) < 100

	// Check if this is a group booking
	const groupInfo = appointment.groupBookingId ? getGroupInfoForAppointment(appointment.id) : null
	const isGroupBooking = !!groupInfo
	
	return (
		<>
			{/* Visual connector for overlapping appointments */}
			{isOverlapping && style?.left !== '2%' && (
				<div 
					className="absolute h-full border-l-2 border-blue-300 border-dashed opacity-40"
					style={{
						...defaultStyle,
						left: style.left,
						width: '2px',
						zIndex: ((style.zIndex as number) || 10) - 1
					}}
				/>
			)}
			<div
				data-appointment="true"
				draggable={appointment.status !== 'cancelled'}
				className={`absolute rounded-md ${appointment.status === 'cancelled' ? 'text-gray-400' : 'text-white'} ${isNarrow ? 'p-1' : calendarSettings.compactView ? 'p-1' : 'p-2'
					} ${appointment.status === 'cancelled' ? 'cursor-not-allowed' : 'cursor-move'} hover:opacity-90 overflow-hidden transition-all duration-200 ease-in-out ${isOverlapping ? 'shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'shadow-sm'} ${appointment.status === 'arrived' ? 'ring-2 ring-green-400 ring-offset-1' : ''
					} ${appointment.status === 'no_show' ? 'opacity-50 line-through' : ''} ${appointment.status === 'cancelled' ? 'opacity-60' : ''} ${isOverlapping ? 'border-l-4 border-white border-opacity-50' : ''} ${appointment.assignedResources && appointment.assignedResources.length > 0 ? 'border-2 border-green-400 border-opacity-40' : ''} ${isGroupBooking ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
				style={{ ...defaultStyle, ...style }}
				onClick={(e) => onClick(e, appointment)}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				title={isGroupBooking ? `Part of: ${groupInfo?.group?.name || 'Group'} (${groupInfo?.position}/${groupInfo?.totalInGroup})` : undefined}
			>
			<div className="text-xs font-medium truncate flex items-center gap-1">
				{isGroupBooking && (
					<span title={`Group: ${groupInfo?.group?.name} (${groupInfo?.position}/${groupInfo?.totalInGroup})`} className="flex items-center">
						<UsersRound className="h-3 w-3 text-indigo-300 flex-shrink-0" />
						{!isNarrow && <span className="text-[10px] text-indigo-200 ml-0.5">{groupInfo?.position}/{groupInfo?.totalInGroup}</span>}
					</span>
				)}
				{appointment.overriddenConflicts && (
					<span title="Booked with override">
						<AlertTriangle className="h-3 w-3 text-yellow-300 flex-shrink-0" />
					</span>
				)}
				{isStaggered && (
					<span title="Staggered appointment">
						<Layers className="h-3 w-3 text-blue-300 flex-shrink-0" />
					</span>
				)}
				{appointment.assignedResources && appointment.assignedResources.length > 0 && (
					<span title={`Uses: ${appointment.assignedResources.map(r => r.resourceName).join(', ')}`}>
						<Zap className="h-3 w-3 text-green-300 flex-shrink-0" />
					</span>
				)}
				<span className="truncate">{appointment.patientName}</span>
			</div>
			<div className="text-xs opacity-90 truncate">
				{practitionerInitials ? (
					<>
						{appointment.serviceName} • {practitionerInitials}
					</>
				) : (
					appointment.serviceName
				)}
			</div>
			{calendarSettings.showDuration && (
				<div className="text-xs opacity-75">{appointment.duration} min</div>
			)}
			{calendarSettings.showPhoneNumbers && appointment.phone && (
				<div className="text-xs opacity-75 truncate">{appointment.phone}</div>
			)}
			{appointment.status === 'arrived' && (
				<div className="text-xs mt-1 font-semibold">✓ Arrived</div>
			)}
			{appointment.status === 'no_show' && (
				<div className="text-xs mt-1 font-semibold">No Show</div>
			)}
			{appointment.status === 'cancelled' && (
				<div className="text-xs mt-1 font-semibold line-through">Cancelled</div>
			)}
			{appointment.status === 'deleted' && (
				<div className="text-xs mt-1 font-semibold text-white bg-red-600 px-2 py-0.5 rounded inline-block">DELETED</div>
			)}
			{appointment.roomId && (
				<div className="text-xs opacity-75 flex items-center gap-1 mt-1">
					<MapPin className="h-3 w-3" />
					{mockRooms.find(r => r.id === appointment.roomId)?.name || 'Room'}
				</div>
			)}
			</div>
		</>
	)
}
