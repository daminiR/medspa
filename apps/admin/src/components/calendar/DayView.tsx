import React from 'react'
import moment from 'moment'
import { Coffee, AlertCircle } from 'lucide-react'
import { Appointment, Break } from '@/lib/data'
import { CalendarSettings, ContinuousSlotBlock, DragState } from '@/types/calendar'
import { Shift } from '@/types/shifts'
import { getShiftBlockStyle, getDragSelectionStyle, getTimeFromY } from '@/utils/calendarHelpers'
import { calculateAppointmentLayouts } from '@/utils/appointmentLayout'
import BreakSlot from './BreakSlot'
import AvailableSlotBlock from './AvailableSlotBlock'
import AppointmentSlot from './AppointmentSlot'
import ShiftBlock from '../shifts/ShiftBlock'
import PostTreatmentBlock from './PostTreatmentBlock'
import { services } from '@/lib/data'

interface DayViewProps {
	selectedDate: Date
	visiblePractitioners: any[]
	appointments: Appointment[]
	breaks: Break[]
	shifts: Shift[]
	calendarSettings: CalendarSettings
	timeSlotHeight: number
	showShiftsOnly: boolean
	createMode: 'appointment' | 'break'
	shiftMode: boolean
	moveMode: boolean
	movingAppointment: Appointment | null
	isDragging: boolean
	dragStart: DragState | null
	dragEnd: { y: number; time: { hour: number; minute: number } } | null
	isDraggingWaitlistPatient: boolean
	continuousSlotBlocks: ContinuousSlotBlock[]
	selectedShift: Shift | null
	today: Date
	getShiftForDate: (practitionerId: string, date: Date) => any
	getAllShiftsForDate?: (practitionerId: string, date: Date) => Shift[]
	onAppointmentClick: (appointment: Appointment) => void
	onBreakClick: (breakItem: Break) => void
	onShiftClick: (shift: Shift) => void
	onTimeSlotClick: (e: React.MouseEvent, practitionerId: string) => void
	onSlotClick: (slot: any) => void
	onMouseDown: (e: React.MouseEvent, practitionerId: string) => void
	onDragOver: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent, practitionerId: string) => void
	onCompleteMove?: (practitionerId: string, date: Date, time: { hour: number; minute: number }) => void
	onAppointmentDragStart?: (appointment: Appointment) => void
	onAppointmentDragEnd?: () => void
	doubleBookingMode?: boolean
}

export default function DayView({
	selectedDate,
	visiblePractitioners,
	appointments,
	breaks,
	shifts,
	calendarSettings,
	timeSlotHeight,
	showShiftsOnly,
	createMode,
	shiftMode,
	moveMode,
	movingAppointment,
	isDragging,
	dragStart,
	dragEnd,
	isDraggingWaitlistPatient,
	continuousSlotBlocks,
	selectedShift,
	today,
	getShiftForDate,
	getAllShiftsForDate,
	onAppointmentClick,
	onBreakClick,
	onShiftClick,
	onTimeSlotClick,
	onSlotClick,
	onMouseDown,
	onDragOver,
	onDrop,
	onCompleteMove,
	onAppointmentDragStart,
	onAppointmentDragEnd,
	doubleBookingMode
}: DayViewProps) {
	// Safety check for undefined or empty practitioners
	if (!visiblePractitioners || visiblePractitioners.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-gray-500">
				<div className="text-center">
					<p className="text-sm">No practitioners selected</p>
				</div>
			</div>
		)
	}

	// Safe arrays
	const safeAppointments = appointments || []
	const safeBreaks = breaks || []
	const safeShifts = shifts || []
	const safeContinuousSlotBlocks = continuousSlotBlocks || []

	return (
		<div className="flex flex-1">
			{visiblePractitioners.map((practitioner) => {
				const hasStaggerBooking = practitioner.staggerOnlineBooking && practitioner.staggerOnlineBooking > 0
				
				return (
					<div key={practitioner.id} className="flex-1 min-w-[200px] border-r border-gray-200 relative group">
						{/* Stagger booking visual indicator */}
						{hasStaggerBooking && (
							<div className="absolute inset-0 pointer-events-none z-0">
								{/* Subtle diagonal lines pattern */}
								<svg width="100%" height="100%" className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300">
									<defs>
										<pattern id={`diag-${practitioner.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
											<path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="#3B82F6" strokeWidth="1"/>
										</pattern>
									</defs>
									<rect width="100%" height="100%" fill={`url(#diag-${practitioner.id})`} />
								</svg>
							</div>
						)}
						{/* Time Grid - no header here since it's handled by parent */}
						<div
							className="relative bg-white"
						onClick={(e) => {
							if (moveMode && movingAppointment && onCompleteMove) {
								// In move mode, calculate the time from Y position and complete the move
								const rect = e.currentTarget.getBoundingClientRect()
								const time = getTimeFromY(
									e.clientY, 
									rect, 
									timeSlotHeight,
									calendarSettings.startHour,
									calendarSettings.endHour,
									0 // No header offset in day view grid
								)
								onCompleteMove(practitioner.id, selectedDate, time)
							} else {
								onTimeSlotClick(e, practitioner.id)
							}
						}}
						onMouseDown={(e) => onMouseDown(e, practitioner.id)}
						onDragOver={onDragOver}
						onDragEnter={(e) => e.preventDefault()}
						onDrop={(e) => onDrop(e, practitioner.id)}
						style={{
							height: `${timeSlotHeight * (calendarSettings.endHour - calendarSettings.startHour)}px`,
							cursor: moveMode ? 'crosshair' :
								shiftMode && !isDragging ? 'crosshair' :
								createMode === 'appointment' && !shiftMode ? 'pointer' :
									createMode === 'break' && !isDragging ? 'crosshair' : 'default'
						}}
					>
						{/* Drop zone indicator */}
						{isDraggingWaitlistPatient && (
							<div className="absolute inset-0 z-5" style={{ pointerEvents: 'none' }}>
								<div className="absolute inset-0 bg-purple-100 bg-opacity-20 border-2 border-dashed border-purple-400 rounded-lg m-1 animate-pulse">
									<div className="absolute inset-x-0 top-4 text-center">
										<div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs inline-flex items-center shadow-lg">
											<AlertCircle className="h-3 w-3 mr-1" />
											Drop patient here
										</div>
									</div>
									<div className="absolute inset-x-0 bottom-4 text-center">
										<div className="bg-white bg-opacity-90 text-purple-700 px-2 py-1 rounded text-xs inline-block shadow">
											{practitioner.name}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Grid lines - every 15 minutes */}
						{Array.from({ length: (calendarSettings.endHour - calendarSettings.startHour) * 4 }, (_, i) => (
							<div
								key={i}
								className="absolute left-0 right-0 border-b"
								style={{
									top: `${i * (timeSlotHeight / 4)}px`,
									borderColor: i % 4 === 0 ? '#e5e7eb' : '#f3f4f6'
								}}
							/>
						))}

						{/* Non-shift hours overlay (gray out times outside shift) */}
						{(() => {
							const allShifts = getAllShiftsForDate ? getAllShiftsForDate(practitioner.id, selectedDate) : []
							const singleShift = getShiftForDate(practitioner.id, selectedDate)
							const shiftsToProcess = allShifts.length > 0 ? allShifts : (singleShift ? [singleShift] : [])
							
							if (shiftsToProcess.length === 0 || showShiftsOnly) return null

							// Sort shifts by start time
							const sortedShifts = [...shiftsToProcess].sort((a, b) => {
								const aStart = a.startAt ? a.startAt.getTime() : ((a as any).startHour * 60 + ((a as any).startMinute || 0))
								const bStart = b.startAt ? b.startAt.getTime() : ((b as any).startHour * 60 + ((b as any).startMinute || 0))
								return aStart - bStart
							})

							const overlays = []

							// Gray out area before first shift
							const firstShift = sortedShifts[0]
							let firstShiftStartHour, firstShiftStartMinute
							if (firstShift.startAt) {
								firstShiftStartHour = firstShift.startAt.getHours()
								firstShiftStartMinute = firstShift.startAt.getMinutes()
							} else {
								firstShiftStartHour = (firstShift as any).startHour
								firstShiftStartMinute = (firstShift as any).startMinute || 0
							}
							
							const beforeFirstShiftHeight = ((firstShiftStartHour - calendarSettings.startHour) * timeSlotHeight + (firstShiftStartMinute / 60) * timeSlotHeight)
							if (beforeFirstShiftHeight > 0) {
								overlays.push(
									<div
										key="before-first-shift"
										className="absolute left-0 right-0 bg-gray-100 opacity-50 pointer-events-none"
										style={{
											top: 0,
											height: `${beforeFirstShiftHeight}px`,
											zIndex: 2
										}}
									/>
								)
							}

							// Gray out gaps between shifts
							for (let i = 0; i < sortedShifts.length - 1; i++) {
								const currentShift = sortedShifts[i]
								const nextShift = sortedShifts[i + 1]
								
								let currentEndHour, currentEndMinute, nextStartHour, nextStartMinute
								
								if (currentShift.endAt) {
									currentEndHour = currentShift.endAt.getHours()
									currentEndMinute = currentShift.endAt.getMinutes()
								} else {
									currentEndHour = (currentShift as any).endHour
									currentEndMinute = (currentShift as any).endMinute || 0
								}
								
								if (nextShift.startAt) {
									nextStartHour = nextShift.startAt.getHours()
									nextStartMinute = nextShift.startAt.getMinutes()
								} else {
									nextStartHour = (nextShift as any).startHour
									nextStartMinute = (nextShift as any).startMinute || 0
								}
								
								const gapTop = ((currentEndHour - calendarSettings.startHour) * timeSlotHeight + (currentEndMinute / 60) * timeSlotHeight)
								const gapBottom = ((nextStartHour - calendarSettings.startHour) * timeSlotHeight + (nextStartMinute / 60) * timeSlotHeight)
								const gapHeight = gapBottom - gapTop
								
								if (gapHeight > 0) {
									overlays.push(
										<div
											key={`gap-${i}`}
											className="absolute left-0 right-0 bg-gray-100 opacity-50 pointer-events-none"
											style={{
												top: `${gapTop}px`,
												height: `${gapHeight}px`,
												zIndex: 2
											}}
										/>
									)
								}
							}

							// Gray out area after last shift
							const lastShift = sortedShifts[sortedShifts.length - 1]
							let lastShiftEndHour, lastShiftEndMinute
							if (lastShift.endAt) {
								lastShiftEndHour = lastShift.endAt.getHours()
								lastShiftEndMinute = lastShift.endAt.getMinutes()
							} else {
								lastShiftEndHour = (lastShift as any).endHour
								lastShiftEndMinute = (lastShift as any).endMinute || 0
							}
							
							const afterLastShiftTop = ((lastShiftEndHour - calendarSettings.startHour) * timeSlotHeight + (lastShiftEndMinute / 60) * timeSlotHeight)
							const afterLastShiftHeight = ((calendarSettings.endHour - calendarSettings.startHour) * timeSlotHeight) - afterLastShiftTop
							
							if (afterLastShiftHeight > 0) {
								overlays.push(
									<div
										key="after-last-shift"
										className="absolute left-0 right-0 bg-gray-100 opacity-50 pointer-events-none"
										style={{
											top: `${afterLastShiftTop}px`,
											height: `${afterLastShiftHeight}px`,
											zIndex: 2
										}}
									/>
								)
							}

							return <>{overlays}</>
						})()}

						{/* Shift blocks - render only subtle background when not in shift mode/showShiftsOnly */}
						{!shiftMode && !showShiftsOnly && (() => {
							const allShifts = getAllShiftsForDate ? getAllShiftsForDate(practitioner.id, selectedDate) : []
							const singleShift = getShiftForDate(practitioner.id, selectedDate)
							const shiftsToRender = allShifts.length > 0 ? allShifts : (singleShift ? [singleShift] : [])
							
							if (shiftsToRender.length === 0) return null
							
							return shiftsToRender.map((shift, index) => (
								<div
									key={`shift-bg-${index}`}
									className="absolute left-0 right-0 pointer-events-none"
									style={{
										...getShiftBlockStyle(shift, timeSlotHeight, 0.05, calendarSettings.startHour),
										zIndex: 0
									}}
								/>
							))
						})()}

						{/* Current time indicator (only for today) */}
						{moment(selectedDate).isSame(today, 'day') && (() => {
							const currentHour = 14
							const currentMinute = 30
							if (currentHour >= calendarSettings.startHour && currentHour < calendarSettings.endHour) {
								const topOffset = ((currentHour - calendarSettings.startHour) * timeSlotHeight + (currentMinute / 60) * timeSlotHeight)
								return (
									<div
										className="absolute left-0 right-0 h-0.5 bg-red-500 pointer-events-none z-20"
										style={{ top: `${topOffset}px` }}
									>
										<div className="absolute -left-2 -top-1 w-2 h-2 bg-red-500 rounded-full" />
									</div>
								)
							}
							return null
						})()}

						{/* Continuous slot blocks overlay for day view */}
						{safeContinuousSlotBlocks
							.filter(block =>
								block && block.practitionerId === practitioner.id &&
								moment(block.date).isSame(selectedDate, 'day')
							)
							.map((block, index) => (
								<AvailableSlotBlock
									key={`block-${index}`}
									block={block}
									timeSlotHeight={timeSlotHeight}
									onSlotClick={onSlotClick}
									style={{
										left: '4px',
										right: '4px'
									}}
								/>
							))}

						{/* Drag Selection (for breaks or shifts) */}
						{isDragging && dragStart?.practitionerId === practitioner.id && (createMode === 'break' || shiftMode) && (
							<div
								className={`absolute ${shiftMode ? 'bg-purple-400' : 'bg-gray-400'} opacity-50 rounded pointer-events-none`}
								style={getDragSelectionStyle(dragStart, dragEnd, timeSlotHeight, calendarSettings.startHour)}
							>
								<div className="p-1 text-xs text-white font-medium flex items-center">
									{shiftMode ? (
										<span>New Shift</span>
									) : (
										<>
											<Coffee className="h-3 w-3 mr-1" />
											{(() => {
												if (!dragStart || !dragEnd) return ''
												const startMinutes = dragStart.time.hour * 60 + dragStart.time.minute
												const endMinutes = dragEnd.time.hour * 60 + dragEnd.time.minute
												const duration = Math.abs(endMinutes - startMinutes)
												return `${duration} min break`
											})()}
										</>
									)}
								</div>
							</div>
						)}

						{/* Shifts - only render when showShiftsOnly is true or in shift mode */}
						{(showShiftsOnly || shiftMode) && safeShifts.length > 0 && safeShifts
							.filter(shift =>
								shift && shift.practitionerId === practitioner.id &&
								moment(shift.startAt).isSame(selectedDate, 'day')
							)
							.map((shift) => (
								<ShiftBlock
									key={shift.id}
									shift={shift}
									timeSlotHeight={timeSlotHeight}
									isSelected={selectedShift?.id === shift.id}
									showDetails={true}
									prominentDisplay={showShiftsOnly || shiftMode}
									onClick={() => onShiftClick(shift)}
									style={{
										...getShiftBlockStyle(shift, timeSlotHeight, 1, calendarSettings.startHour),
										left: '4px',
										right: '4px'
									}}
								/>
							))}

						{/* Appointments */}
						{!showShiftsOnly && (() => {
							// Filter appointments for this practitioner
							const practitionerAppointments = safeAppointments.filter(apt => {
								if (!apt || apt.practitionerId !== practitioner.id || !moment(apt.startTime).isSame(selectedDate, 'day')) {
									return false
								}
								// Filter out cancelled appointments if showCancelledAppointments is false
								if (!calendarSettings.showCancelledAppointments && apt.status === 'cancelled') {
									return false
								}
								// Filter out deleted appointments if showDeletedAppointments is false
								if (!calendarSettings.showDeletedAppointments && apt.status === 'deleted') {
									return false
								}
								return true
							})

							// Calculate layouts for overlapping appointments
							const appointmentsWithLayout = calculateAppointmentLayouts(practitionerAppointments)
							
							// Check if there are any overlapping appointments
							const hasOverlappingAppointments = appointmentsWithLayout.some(apt => 
								apt.layoutPosition && apt.layoutPosition.width.includes('%') && parseInt(apt.layoutPosition.width) < 100
							)

							return (
								<>
									{/* Overlapping appointments indicator */}
									{hasOverlappingAppointments && hasStaggerBooking && (
										<div 
											className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm animate-pulse"
											style={{ zIndex: 30 }}
											title="This practitioner has overlapping appointments in different rooms"
										>
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
											</svg>
											Staggered
										</div>
									)}
									{appointmentsWithLayout.map((appointment) => {
										const appointmentEndHour = moment(appointment.endTime).hours()
										const appointmentEndMinutes = moment(appointment.endTime).minutes()
										const postTreatmentTop = ((appointmentEndHour - calendarSettings.startHour) * 60 + appointmentEndMinutes) / 60 * timeSlotHeight
										
										return (
									<React.Fragment key={appointment.id}>
										<AppointmentSlot
											appointment={appointment}
											timeSlotHeight={timeSlotHeight}
											calendarSettings={calendarSettings}
											onClick={(e) => onAppointmentClick(appointment)}
											onDragStart={onAppointmentDragStart}
											onDragEnd={onAppointmentDragEnd}
											doubleBookingMode={doubleBookingMode}
											style={{
												left: appointment.layoutPosition?.left || '4px',
												width: appointment.layoutPosition?.width || 'calc(100% - 8px)',
												right: appointment.layoutPosition ? 'auto' : '4px',
												zIndex: appointment.layoutPosition?.zIndex || 10
											}}
										/>
										{appointment.postTreatmentTime && (
											<div
												className="absolute"
												style={{
													top: `${postTreatmentTop}px`,
													left: appointment.layoutPosition?.left || '4px',
													width: appointment.layoutPosition?.width || 'calc(100% - 8px)',
													right: appointment.layoutPosition ? 'auto' : '4px',
													zIndex: (appointment.layoutPosition?.zIndex || 10) - 5
												}}
											>
												<PostTreatmentBlock
													duration={appointment.postTreatmentTime}
													practitionerName={practitioner.name}
													serviceName={appointment.serviceName}
												/>
											</div>
										)}
									</React.Fragment>
									)
								})}
								</>
							)
						})()}

						{/* Breaks */}
						{!showShiftsOnly && safeBreaks
							.filter(breakItem =>
								breakItem && breakItem.practitionerId === practitioner.id &&
								moment(breakItem.startTime).isSame(selectedDate, 'day')
							)
							.map((breakItem) => (
								<BreakSlot
									key={breakItem.id}
									breakItem={breakItem}
									timeSlotHeight={timeSlotHeight}
									calendarSettings={calendarSettings}
									onClick={(e) => onBreakClick(breakItem)}
									style={{
										left: '4px',
										right: '4px'
									}}
								/>
							))}
					</div>
				</div>
				)
			})}
		</div>
	)
}
