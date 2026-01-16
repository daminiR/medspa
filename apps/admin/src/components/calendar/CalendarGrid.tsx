import React, { useState, useRef } from 'react'
import moment from 'moment'
import { Appointment, Break } from '@/lib/data'
import { CalendarSettings, ContinuousSlotBlock, DragState, BreakType } from '@/types/calendar'
import { Shift } from '@/types/shifts'
import { getTimeFromY } from '@/utils/calendarHelpers'
import { findAppointmentConflicts, getConflictMessage, findBreakConflicts, getBreakConflictMessage } from '@/utils/appointmentConflicts'
import DayView from './DayView'
import WeekView from './WeekView'

interface CalendarGridProps {
	view: 'day' | 'week'
	visiblePractitioners: any[]
	visibleEntities?: Array<{ id: string; name: string; type: 'practitioner' | 'room' }>
	calendarViewType?: 'practitioners' | 'rooms'
	selectedDate: Date
	weekDates: Date[]
	appointments: Appointment[]
	breaks: Break[]
	shifts: Shift[]
	allShifts?: Shift[]  // All shifts for room mapping
	calendarSettings: CalendarSettings
	timeSlotHeight: number
	showShiftsOnly: boolean
	createMode: 'appointment' | 'break' | 'none'
	pendingBreakType?: BreakType
	shiftMode: boolean
	moveMode: boolean
	movingAppointment: Appointment | null
	isDragging: boolean
	dragStart: DragState | null
	dragEnd: { y: number; time: { hour: number; minute: number } } | null
	isDraggingWaitlistPatient: boolean
	continuousSlotBlocks: ContinuousSlotBlock[]
	highlightedSlots: any[]
	selectedShift: Shift | null
	today: Date
	calendarRef: React.RefObject<HTMLDivElement>
	getShiftForDate: (practitionerId: string, date: Date) => any
	// Persistent appointment preview while sidebar is open
	appointmentPreview?: {
		practitionerId: string
		startTime: { hour: number; minute: number }
		duration: number
		date: Date
	} | null
	onAppointmentClick: (appointment: Appointment) => void
	onBreakClick: (breakItem: Break) => void
	onShiftClick: (shift: Shift) => void
	onTimeSlotClick: (practitioner: any, date: Date, time: { hour: number; minute: number }, draggedDuration?: number) => void
	onSlotClick: (slot: any) => void
	onDragStart: (state: DragState | null) => void
	onDragEnd: (state: { y: number; time: { hour: number; minute: number } } | null) => void
	onDragging: (isDragging: boolean) => void
	onBreakCreate: (breakData: Break) => void
	onShiftDragComplete: (data: { practitionerId: string; startTime: { hour: number; minute: number }; endTime: { hour: number; minute: number }; date: Date }) => void
	onAppointmentDrop: (appointment: Appointment) => void
	showToast: (message: string) => void
	onCompleteMove?: (practitionerId: string, date: Date, time: { hour: number; minute: number }) => void
	onAppointmentDragStart?: (appointment: Appointment) => void
	onAppointmentDragEnd?: () => void
	doubleBookingMode?: boolean
}

export default function CalendarGrid({
	view,
	visiblePractitioners,
	visibleEntities,
	calendarViewType = 'practitioners',
	selectedDate,
	weekDates,
	appointments,
	breaks,
	shifts,
	allShifts,
	calendarSettings,
	timeSlotHeight,
	showShiftsOnly,
	createMode,
	pendingBreakType = 'personal',
	shiftMode,
	moveMode,
	movingAppointment,
	isDragging,
	dragStart,
	dragEnd,
	isDraggingWaitlistPatient,
	continuousSlotBlocks,
	highlightedSlots,
	selectedShift,
	today,
	calendarRef,
	getShiftForDate,
	appointmentPreview,
	onAppointmentClick,
	onBreakClick,
	onShiftClick,
	onTimeSlotClick,
	onSlotClick,
	onDragStart,
	onDragEnd,
	onDragging,
	onBreakCreate,
	onShiftDragComplete,
	onAppointmentDrop,
	showToast,
	onCompleteMove,
	onAppointmentDragStart,
	onAppointmentDragEnd,
	doubleBookingMode = false
}: CalendarGridProps) {
	// State for tracking drag target position (for visual feedback)
	const [dragTargetSlot, setDragTargetSlot] = useState<{
		practitionerId: string;
		time: { hour: number; minute: number };
		date?: Date;
	} | null>(null);

	// Ref to track if a drag just completed (to prevent click from firing after drag)
	const justCompletedDrag = useRef(false);

	// Helper function to get appointments mapped to rooms
	const getAppointmentsForRooms = (appointments: Appointment[], shifts: Shift[]): Appointment[] => {
		return appointments.map(apt => {
			// If appointment has a room assigned, use it
			if (apt.roomId) {
				// Find practitioner name
				const practitioner = visiblePractitioners.find(p => p.id === apt.practitionerId)
				const practitionerName = practitioner?.name || 'Unknown'
				
				return {
					...apt,
					practitionerId: apt.roomId, // Use room ID as practitioner ID for display
					// Add practitioner name to the service name for clarity
					serviceName: `${apt.serviceName} (${practitionerName})`
				}
			}
			
			// If no room assigned, don't show the appointment in room view
			return null
		}).filter(Boolean) as Appointment[]
	}

	// Mouse handlers for appointment/break/shift creation (drag)
	const handleMouseDown = (e: React.MouseEvent, practitionerId: string, date?: Date) => {
		// Don't allow drag in 'none' mode
		if (createMode === 'none' && !shiftMode) return

		// Allow drag for appointments, breaks, or shifts
		// Note: For appointments, we allow drag-to-create with visual preview

		// Don't allow drag in week view for breaks
		if (createMode === 'break' && view === 'week') return

		// Don't start dragging if clicking on an appointment, break, or shift
		if ((e.target as HTMLElement).closest('[data-appointment]') ||
			(e.target as HTMLElement).closest('[data-break]') ||
			(e.target as HTMLElement).closest('[data-shift]')) {
			return
		}

		const time = getTimeFromY(
			e.clientY, 
			calendarRef.current?.getBoundingClientRect() || null, 
			timeSlotHeight,
			calendarSettings.startHour,
			calendarSettings.endHour,
			64 // Both views have 64px practitioner header
		)
		onDragging(true)
		onDragStart({ practitionerId, y: e.clientY, time })
		onDragEnd({ y: e.clientY, time })
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && dragStart) {
			const time = getTimeFromY(
				e.clientY,
				calendarRef.current?.getBoundingClientRect() || null,
				timeSlotHeight,
				calendarSettings.startHour,
				calendarSettings.endHour,
				64 // Both views have 64px practitioner header
			)
			onDragEnd({ y: e.clientY, time })
		}
	}

	const handleMouseUp = () => {
		if (isDragging && dragStart && dragEnd) {
			const startTime = dragStart.time
			const endTime = dragEnd.time

			const startMinutes = startTime.hour * 60 + startTime.minute
			const endMinutes = endTime.hour * 60 + endTime.minute
			const duration = Math.abs(endMinutes - startMinutes)

			if (duration >= 15) {
				const practitioner = visiblePractitioners.find(p => p.id === dragStart.practitionerId)

				if (practitioner) {
					// For appointments: always use where user CLICKED as start time
					// For shifts/breaks: use the earlier time as start (existing behavior)
					const useClickAsStart = createMode === 'appointment' && !shiftMode
					const finalStartTime = useClickAsStart ? startTime : (startMinutes < endMinutes ? startTime : endTime)
					const finalEndTime = useClickAsStart ? endTime : (startMinutes < endMinutes ? endTime : startTime)
					// For appointments: don't pass duration - let service selection determine it
					// For shifts/breaks: use exact duration from drag
					const finalDuration = duration

					// Mark that a drag just completed to prevent click handler from firing
					justCompletedDrag.current = true
					setTimeout(() => { justCompletedDrag.current = false }, 100)

					if (shiftMode) {
						// Create shift - use earlier time as start
						const shiftStart = startMinutes < endMinutes ? startTime : endTime
						const shiftEnd = startMinutes < endMinutes ? endTime : startTime
						onShiftDragComplete({
							practitionerId: practitioner.id,
							startTime: shiftStart,
							endTime: shiftEnd,
							date: selectedDate
						})
					} else if (createMode === 'appointment') {
						// Trigger appointment creation - use CLICK position as start time
						// Pass the raw drag duration for initial preview
						onTimeSlotClick(practitioner, selectedDate, startTime, finalDuration)
					} else {
						// Create break WITHOUT auto-adjustment
						const breakStartTime = new Date(selectedDate)
						breakStartTime.setHours(
							finalStartTime.hour,
							finalStartTime.minute,
							0, 0
						)

						const breakEndTime = new Date(breakStartTime)
						breakEndTime.setMinutes(breakEndTime.getMinutes() + finalDuration)

						// Check for conflicts with existing appointments
						const conflictingAppointments = appointments.filter(apt => {
							if (apt.practitionerId !== practitioner.id) return false
							if (apt.status === 'cancelled' || apt.status === 'deleted') return false

							// Check if appointment overlaps with the break time
							const aptStart = new Date(apt.startTime).getTime()
							const aptEnd = new Date(apt.endTime).getTime()
							const breakStart = breakStartTime.getTime()
							const breakEnd = breakEndTime.getTime()

							return (aptStart < breakEnd && aptEnd > breakStart)
						})

						if (conflictingAppointments.length > 0) {
							// Show warning but still create the break
							const conflictCount = conflictingAppointments.length
							const message = conflictCount === 1
								? `⚠️ Warning: 1 appointment exists during this time. Block created anyway.`
								: `⚠️ Warning: ${conflictCount} appointments exist during this time. Block created anyway.`
							showToast(message)
						}

						const newBreak: Break = {
							id: `break-${Date.now()}`,
							practitionerId: practitioner.id,
							practitionerName: practitioner.name,
							type: pendingBreakType,
							startTime: breakStartTime,
							endTime: breakEndTime,
							duration: finalDuration,
							isRecurring: false,
							availableForEmergencies: false
						}

						onBreakCreate(newBreak)
					}
				}
			}
		}

		onDragging(false)
		onDragStart(null)
		onDragEnd(null)
	}

	// Handle time slot click
	const handleTimeSlotClick = (e: React.MouseEvent, practitionerId: string, clickDate?: Date) => {
		// Skip if a drag just completed (drag already handled the action)
		if (justCompletedDrag.current) {
			return
		}

		// Don't do anything in 'none' mode
		if (createMode === 'none' && !shiftMode) {
			return
		}

		// Don't open if clicking on an existing appointment, break, shift, or highlight
		if ((e.target as HTMLElement).closest('[data-appointment]') ||
			(e.target as HTMLElement).closest('[data-break]') ||
			(e.target as HTMLElement).closest('[data-shift]') ||
			(e.target as HTMLElement).closest('[data-highlight]')) {
			return
		}

		// Only handle clicks when in appointment mode and not in shift mode
		if (createMode !== 'appointment' || shiftMode) return

		const time = getTimeFromY(
			e.clientY, 
			calendarRef.current?.getBoundingClientRect() || null, 
			timeSlotHeight,
			calendarSettings.startHour,
			calendarSettings.endHour,
			64 // Both views have 64px practitioner header
		)
		const practitioner = visiblePractitioners.find(p => p.id === practitionerId)

		if (practitioner) {
			onTimeSlotClick(practitioner, clickDate || selectedDate, time)
		}
	}

	// Handle drag and drop for waitlist patients and appointments
	const handleDragOver = (e: React.DragEvent, practitionerId: string, dropDate?: Date) => {
		// Always prevent default to allow drop
		e.preventDefault()
		e.stopPropagation()
		e.dataTransfer.dropEffect = 'copy'

		// Calculate target time from Y position for visual feedback
		const time = getTimeFromY(
			e.clientY,
			calendarRef.current?.getBoundingClientRect() || null,
			timeSlotHeight,
			calendarSettings.startHour,
			calendarSettings.endHour,
			64 // Both views have 64px practitioner header
		)

		// Update drag target for visual feedback
		setDragTargetSlot({
			practitionerId,
			time,
			date: dropDate
		})
	}

	// Clear drag target when leaving
	const handleDragLeave = (e: React.DragEvent) => {
		// Only clear if leaving the calendar area entirely
		const relatedTarget = e.relatedTarget as HTMLElement
		if (!relatedTarget || !calendarRef.current?.contains(relatedTarget)) {
			setDragTargetSlot(null)
		}
	}

	const handleDrop = (e: React.DragEvent, practitionerId: string, dropDate?: Date) => {
		e.preventDefault()
		e.stopPropagation()

		// Clear drag target visual feedback
		setDragTargetSlot(null)

		// Get the drag data
		const textData = e.dataTransfer.getData('text/plain')
		
		let parsedData: any = null
		try {
			if (textData) {
				parsedData = JSON.parse(textData)
			}
		} catch (error) {
			console.error('Failed to parse drag data:', error)
			return
		}

		// Check what type of data we have
		if (parsedData?.type === 'appointment') {
			try {
				const appointment = parsedData.data as Appointment
				const time = getTimeFromY(
					e.clientY, 
					calendarRef.current?.getBoundingClientRect() || null, 
					timeSlotHeight,
					calendarSettings.startHour,
					calendarSettings.endHour,
					64 // Both views have 64px practitioner header
				)
				
				// Use dropDate if provided (for week view), otherwise use selectedDate
				const appointmentDate = dropDate || selectedDate
				
				// Create new appointment times WITHOUT auto-adjustment
				const newStartTime = new Date(appointmentDate)
				newStartTime.setHours(time.hour, time.minute, 0, 0)
				
				const newEndTime = new Date(newStartTime)
				newEndTime.setMinutes(newEndTime.getMinutes() + appointment.duration)
				
				// Find the shift for the new practitioner to get room assignment
				const targetShift = getShiftForDate(practitionerId, appointmentDate)
				const targetRoomId = targetShift?.room
				
				// Check for conflicts before moving (including room conflicts)
				const conflicts = findAppointmentConflicts(
					{
						practitionerId: practitionerId,
						startTime: newStartTime,
						endTime: newEndTime,
						roomId: targetRoomId,
						postTreatmentTime: appointment.postTreatmentTime
					},
					appointments.filter(apt => apt.id !== appointment.id)
				)
				
				if (conflicts.length > 0) {
					const message = getConflictMessage(conflicts, targetRoomId)
					showToast(`⚠️ Cannot move: ${message}`)
					return
				}

				// Check for break/time block conflicts
				const breakConflicts = findBreakConflicts(
					{ practitionerId: practitionerId, startTime: newStartTime, endTime: newEndTime, postTreatmentTime: appointment.postTreatmentTime },
					breaks
				)

				if (breakConflicts.length > 0) {
					const breakMessage = getBreakConflictMessage(breakConflicts)
					showToast(`⚠️ Cannot move: ${breakMessage}`)
					return
				}

				// Update the appointment
				const updatedAppointment = {
					...appointment,
					practitionerId,
					startTime: newStartTime,
					endTime: newEndTime,
					roomId: targetRoomId // Update room assignment based on new practitioner's shift
				}
				
				// Call parent handler to update appointment
				onAppointmentDrop(updatedAppointment)
				
				// Show success notification
				showToast(`✓ Appointment moved successfully`)
			} catch (error) {
				console.error('Error processing appointment drop:', error)
			}
			return
		}

		// Process waitlist patient if we have the data
		if (parsedData?.type === 'waitlist-patient') {
			try {
				const patient = parsedData.data
				
				// Validate required fields
				if (!patient.name || !patient.requestedService || !patient.serviceDuration) {
					showToast('❌ Invalid patient data. Please try again.')
					return
				}
				const time = getTimeFromY(
					e.clientY, 
					calendarRef.current?.getBoundingClientRect() || null, 
					timeSlotHeight,
					calendarSettings.startHour,
					calendarSettings.endHour,
					64 // Both views have 64px practitioner header
				)

				// Use dropDate if provided (for week view), otherwise use selectedDate
				const appointmentDate = dropDate || selectedDate

				// Create appointment from waitlist patient WITHOUT auto-adjustment
				const startTime = new Date(appointmentDate)
				startTime.setHours(time.hour, time.minute, 0, 0)

				const endTime = new Date(startTime)
				endTime.setMinutes(endTime.getMinutes() + patient.serviceDuration)

				// Check for conflicts before creating the appointment
				const conflicts = findAppointmentConflicts(
					{
						practitionerId: practitionerId,
						startTime: startTime,
						endTime: endTime
					},
					appointments
				)

				if (conflicts.length > 0) {
					// Show conflict warning and don't create the appointment
					const message = getConflictMessage(conflicts)
					showToast(`⚠️ Cannot book: ${message}`)
					return
				}

				// Check for break/time block conflicts
				const breakConflicts = findBreakConflicts(
					{ practitionerId: practitionerId, startTime, endTime },
					breaks
				)

				if (breakConflicts.length > 0) {
					const breakMessage = getBreakConflictMessage(breakConflicts)
					showToast(`⚠️ Cannot book: ${breakMessage}`)
					return
				}

				// Color mapping for service categories
				const categoryColors = {
					injectables: '#8B5CF6',
					facial: '#F59E0B',
					laser: '#10B981',
					wellness: '#EC4899'
				}
				
				// Map waitlist categories to appointment categories
				const categoryMapping: Record<string, 'physiotherapy' | 'chiropractic' | 'aesthetics' | 'massage'> = {
					injectables: 'aesthetics',
					facial: 'aesthetics',
					laser: 'aesthetics',
					wellness: 'massage'
				}

				const newAppointment: Appointment = {
					id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					patientId: patient.id || `patient-${Date.now()}`,
					patientName: patient.name,
					serviceName: patient.requestedService,
					serviceCategory: categoryMapping[patient.serviceCategory] || 'aesthetics',
					practitionerId: practitionerId,
					startTime: startTime,
					endTime: endTime,
					status: 'scheduled' as const,
					color: categoryColors[patient.serviceCategory as keyof typeof categoryColors] || '#8B5CF6',
					duration: patient.serviceDuration,
					phone: patient.phone || '',
					email: patient.email || '',
					notes: patient.notes ? `Booked from waitlist. ${patient.notes}` : 'Booked from waitlist',
					createdAt: new Date(),
					updatedAt: new Date()
				}

				onAppointmentDrop(newAppointment)

				// Show success notification
				const practitioner = visiblePractitioners.find(p => p.id === practitionerId)
				showToast(`✓ ${patient.name} booked with ${practitioner?.name || 'practitioner'} for ${patient.requestedService}`)
				
				// Notify that the patient was booked (to remove from waitlist)
				if ((window as any).removeFromWaitlist) {
					(window as any).removeFromWaitlist(patient.id)
				}
			} catch (error) {
				console.error('Error processing waitlist drop:', error)
				showToast('❌ Error booking appointment. Please try again.')
			}
		} else {
		}
	}

	// Use visibleEntities if provided (for room view), otherwise use visiblePractitioners
	const entities = visibleEntities || visiblePractitioners.map(p => ({ id: p.id, name: p.name, type: 'practitioner' as const }))
	const isRoomView = calendarViewType === 'rooms'

	return (
		<div
			className="flex-1 flex"
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			{!entities || entities.length === 0 ? (
				<div className="flex-1 flex items-center justify-center text-gray-500">
					<div className="text-center">
						<div className="h-12 w-12 mx-auto mb-2 text-gray-300">
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<p className="text-sm">{isRoomView ? 'No rooms available' : 'No practitioners selected'}</p>
						<p className="text-xs mt-1">{isRoomView ? 'Configure rooms in settings' : 'Select practitioners from the sidebar to view their calendars'}</p>
					</div>
				</div>
			) : view === 'week' ? (
				<WeekView
					weekDates={weekDates}
					visiblePractitioners={isRoomView ? entities.map(e => ({ id: e.id, name: e.name, initials: e.name.substring(0, 2).toUpperCase() })) : visiblePractitioners}
					appointments={isRoomView ? getAppointmentsForRooms(appointments, allShifts || shifts) : appointments}
					breaks={isRoomView ? [] : breaks}
					shifts={isRoomView ? [] : shifts}
					calendarSettings={calendarSettings}
					timeSlotHeight={timeSlotHeight}
					showShiftsOnly={isRoomView ? false : showShiftsOnly}
					shiftMode={isRoomView ? false : shiftMode}
					moveMode={isRoomView ? false : moveMode}
					movingAppointment={isRoomView ? null : movingAppointment}
					continuousSlotBlocks={continuousSlotBlocks}
					selectedShift={selectedShift}
					today={today}
					isDraggingWaitlistPatient={isDraggingWaitlistPatient}
					dragTargetSlot={dragTargetSlot}
					getShiftForDate={getShiftForDate}
					onAppointmentClick={onAppointmentClick}
					onBreakClick={onBreakClick}
					onShiftClick={onShiftClick}
					onTimeSlotClick={handleTimeSlotClick}
					onSlotClick={onSlotClick}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onCompleteMove={onCompleteMove}
					onAppointmentDragStart={onAppointmentDragStart}
					onAppointmentDragEnd={onAppointmentDragEnd}
					doubleBookingMode={doubleBookingMode}
				/>
			) : (
				<DayView
					selectedDate={selectedDate}
					visiblePractitioners={isRoomView ? entities.map(e => ({ id: e.id, name: e.name, initials: e.name.substring(0, 2).toUpperCase() })) : visiblePractitioners}
					appointments={isRoomView ? getAppointmentsForRooms(appointments, allShifts || shifts) : appointments}
					breaks={isRoomView ? [] : breaks}
					shifts={isRoomView ? [] : shifts}
					calendarSettings={calendarSettings}
					timeSlotHeight={timeSlotHeight}
					showShiftsOnly={isRoomView ? false : showShiftsOnly}
					createMode={createMode}
					shiftMode={isRoomView ? false : shiftMode}
					moveMode={isRoomView ? false : moveMode}
					movingAppointment={isRoomView ? null : movingAppointment}
					isDragging={isDragging}
					dragStart={dragStart}
					dragEnd={dragEnd}
					isDraggingWaitlistPatient={isDraggingWaitlistPatient}
					dragTargetSlot={dragTargetSlot}
					continuousSlotBlocks={continuousSlotBlocks}
					selectedShift={selectedShift}
					today={today}
					getShiftForDate={getShiftForDate}
					appointmentPreview={appointmentPreview}
					onAppointmentClick={onAppointmentClick}
					onBreakClick={onBreakClick}
					onShiftClick={onShiftClick}
					onTimeSlotClick={handleTimeSlotClick}
					onSlotClick={onSlotClick}
					onMouseDown={handleMouseDown}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onCompleteMove={onCompleteMove}
					onAppointmentDragStart={onAppointmentDragStart}
					onAppointmentDragEnd={onAppointmentDragEnd}
					doubleBookingMode={doubleBookingMode}
				/>
			)}
		</div>
	)
}
