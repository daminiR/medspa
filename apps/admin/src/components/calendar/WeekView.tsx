import React from 'react'
import moment from 'moment'
import { Appointment, Break } from '@/lib/data'
import { CalendarSettings, ContinuousSlotBlock } from '@/types/calendar'
import { Shift } from '@/types/shifts'
import { getShiftBlockStyle, getTimeFromY } from '@/utils/calendarHelpers'
import BreakSlot from './BreakSlot'
import AvailableSlotBlock from './AvailableSlotBlock'
import AppointmentSlot from './AppointmentSlot'
import ShiftBlock from '../shifts/ShiftBlock'

interface WeekViewProps {
	weekDates: Date[]
	visiblePractitioners: any[]
	appointments: Appointment[]
	breaks: Break[]
	shifts: Shift[]
	calendarSettings: CalendarSettings
	timeSlotHeight: number
	showShiftsOnly: boolean
	shiftMode: boolean
	moveMode: boolean
	movingAppointment: Appointment | null
	continuousSlotBlocks: ContinuousSlotBlock[]
	selectedShift: Shift | null
	today: Date
	isDraggingWaitlistPatient: boolean
	dragTargetSlot: { practitionerId: string; time: { hour: number; minute: number }; date?: Date } | null
	getShiftForDate: (practitionerId: string, date: Date) => any
	getAllShiftsForDate?: (practitionerId: string, date: Date) => Shift[]
	onAppointmentClick: (appointment: Appointment) => void
	onBreakClick: (breakItem: Break) => void
	onShiftClick: (shift: Shift) => void
	onTimeSlotClick: (e: React.MouseEvent, practitionerId: string, date: Date) => void
	onSlotClick: (slot: any) => void
	onDragOver: (e: React.DragEvent, practitionerId: string, dropDate?: Date) => void
	onDragLeave: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent, practitionerId: string, date: Date) => void
	onCompleteMove?: (practitionerId: string, date: Date, time: { hour: number; minute: number }) => void
	onAppointmentDragStart?: (appointment: Appointment) => void
	onAppointmentDragEnd?: () => void
	doubleBookingMode?: boolean
}

export default function WeekView({
	weekDates,
	visiblePractitioners,
	appointments,
	breaks,
	shifts,
	calendarSettings,
	timeSlotHeight,
	showShiftsOnly,
	shiftMode,
	moveMode,
	movingAppointment,
	continuousSlotBlocks,
	selectedShift,
	today,
	isDraggingWaitlistPatient,
	dragTargetSlot,
	getShiftForDate,
	getAllShiftsForDate,
	onAppointmentClick,
	onBreakClick,
	onShiftClick,
	onTimeSlotClick,
	onSlotClick,
	onDragOver,
	onDragLeave,
	onDrop,
	onCompleteMove,
	onAppointmentDragStart,
	onAppointmentDragEnd,
	doubleBookingMode
}: WeekViewProps) {
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

	// Additional safety for arrays
	const safePractitioners = visiblePractitioners || []
	const safeWeekDates = weekDates || []
	const safeAppointments = appointments || []
	const safeBreaks = breaks || []
	const safeShifts = shifts || []
	const safeContinuousSlotBlocks = continuousSlotBlocks || []

	return (
		<div className="flex flex-1">
			{safeWeekDates.map((date, dateIndex) => {
				const isToday = moment(date).isSame(today, 'day')
				const isWeekend = moment(date).day() === 0 || moment(date).day() === 6
				const dayAppointments = (safeAppointments || []).filter(apt =>
					apt && moment(apt.startTime).isSame(date, 'day')
				)
				const dayBreaks = (safeBreaks || []).filter(brk =>
					brk && moment(brk.startTime).isSame(date, 'day')
				)
				const dayShifts = (safeShifts || []).filter(shift =>
					shift && moment(shift.startAt).isSame(date, 'day')
				)

				return (
					<div key={dateIndex} className="flex-1 min-w-[180px] border-r border-gray-200">
						{/* Day Header */}
						<div className={`h-16 border-b border-gray-200 ${isToday ? 'bg-orange-50' : 'bg-gray-50'} flex flex-col items-center justify-center px-2`}>
							<div className="text-xs font-medium text-gray-500">
								{moment(date).format('ddd')}
							</div>
							<div className={`text-lg font-medium ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
								{moment(date).format('D')}
							</div>
						</div>

						{/* Time Grid for this day */}
						<div
							className="relative bg-white select-none"
							style={{ height: `${timeSlotHeight * (calendarSettings.endHour - calendarSettings.startHour)}px`, cursor: shiftMode ? 'default' : (moveMode ? 'crosshair' : 'pointer') }}
							onClick={(e) => {
								if (shiftMode) return
								
								// For week view, determine which practitioner column was clicked
								const rect = e.currentTarget.getBoundingClientRect()
								const relativeX = e.clientX - rect.left
								const columnWidth = rect.width / safePractitioners.length
								const practitionerIndex = Math.floor(relativeX / columnWidth)
								const practitioner = safePractitioners[practitionerIndex]

								if (practitioner) {
									if (moveMode && movingAppointment && onCompleteMove) {
										// In move mode, calculate the time and complete the move
										const time = getTimeFromY(
											e.clientY, 
											rect, 
											timeSlotHeight,
											calendarSettings.startHour,
											calendarSettings.endHour,
											64 // 64px header in week view
										)
										onCompleteMove(practitioner.id, date, time)
									} else {
										onTimeSlotClick(e, practitioner.id, date)
									}
								}
							}}
							onDragOver={(e) => {
								// Determine which practitioner column is being hovered
								const rect = e.currentTarget.getBoundingClientRect()
								const relativeX = e.clientX - rect.left
								const columnWidth = rect.width / safePractitioners.length
								const practitionerIndex = Math.floor(relativeX / columnWidth)
								const practitioner = safePractitioners[practitionerIndex]

								if (practitioner) {
									onDragOver(e, practitioner.id, date)
								}
							}}
							onDragLeave={onDragLeave}
							onDrop={(e) => {
								// For week view, we need to determine which practitioner column was dropped on
								const rect = e.currentTarget.getBoundingClientRect()
								const relativeX = e.clientX - rect.left
								const columnWidth = rect.width / safePractitioners.length
								const practitionerIndex = Math.floor(relativeX / columnWidth)
								const practitioner = safePractitioners[practitionerIndex]

								if (practitioner) {
									onDrop(e, practitioner.id, date)
								}
							}}
						>
							{/* Drop zone indicator for week view */}
							{isDraggingWaitlistPatient && (
								<div className="absolute inset-0 bg-purple-100 bg-opacity-20 pointer-events-none z-5 border-2 border-dashed border-purple-300 animate-pulse">
									<div className="absolute inset-x-0 top-2 text-center">
										<div className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs inline-flex items-center shadow">
											Drop to book
										</div>
									</div>
								</div>
							)}

							{/* Appointment drag target indicator for week view */}
							{dragTargetSlot && dragTargetSlot.date && moment(dragTargetSlot.date).isSame(date, 'day') && (
								<div
									className="absolute bg-purple-100 border-2 border-dashed border-purple-500 rounded-md z-50 pointer-events-none shadow-lg"
									style={{
										left: `${(safePractitioners.findIndex(p => p.id === dragTargetSlot.practitionerId) / safePractitioners.length) * 100}%`,
										width: `${100 / safePractitioners.length}%`,
										top: `${((dragTargetSlot.time.hour - calendarSettings.startHour) * 60 + dragTargetSlot.time.minute) * (timeSlotHeight / 60)}px`,
										height: `${timeSlotHeight / 2}px`,
									}}
								>
									<div className="absolute inset-x-0 top-0.5 text-center">
										<span className="text-xs font-semibold text-purple-700 bg-white px-1.5 py-0.5 rounded shadow">
											{dragTargetSlot.time.hour.toString().padStart(2, '0')}:{dragTargetSlot.time.minute.toString().padStart(2, '0')}
										</span>
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

							{/* Current time indicator (only for today) - unified gray line */}
							{isToday && (() => {
								const currentHour = new Date().getHours()
								const currentMinute = new Date().getMinutes()
								if (currentHour >= calendarSettings.startHour && currentHour < calendarSettings.endHour) {
									const topOffset = ((currentHour - calendarSettings.startHour) * timeSlotHeight + (currentMinute / 60) * timeSlotHeight)
									return (
										<div
											className="absolute left-0 right-0 pointer-events-none z-20"
											style={{ top: `${topOffset}px` }}
										>
											{/* Indicator dot on left edge */}
											<div className="absolute -left-1 -top-1.5 w-3 h-3 bg-slate-500 rounded-full border-2 border-white shadow-sm" />
											{/* Line spanning column */}
											<div className="absolute left-0 right-0 h-0.5 bg-slate-500" />
										</div>
									)
								}
								return null
							})()}

							{/* Shift blocks when showShiftsOnly is true - show with details */}
							{showShiftsOnly && safePractitioners.map((practitioner, practIndex) => {
								// Get all shifts for this practitioner on this date
								const practitionerShifts = dayShifts.filter(shift => shift.practitionerId === practitioner.id)
								if (practitionerShifts.length === 0) return null

								const columnWidth = 100 / safePractitioners.length
								const leftOffset = practIndex * columnWidth

								return practitionerShifts.map((shift) => {
									const shiftStyle = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarSettings.startHour)
									return (
										<ShiftBlock
											key={`shift-only-${shift.id}`}
											shift={shift}
											timeSlotHeight={timeSlotHeight}
											isSelected={selectedShift?.id === shift.id}
											showDetails={true}
											prominentDisplay={true}
											onClick={() => onShiftClick(shift)}
											style={{
												...shiftStyle,
												left: `${leftOffset}%`,
												width: `${columnWidth - 2}%`,
												marginLeft: '1px',
												marginRight: '1px',
												zIndex: 2
											}}
										/>
									)
								})
							})}

							{/* Continuous slot blocks for week view */}
							{safePractitioners.map((practitioner, practIndex) => {
								const practitionerBlocks = safeContinuousSlotBlocks.filter(
									block => block.practitionerId === practitioner.id &&
										moment(block.date).isSame(date, 'day')
								)

								const columnWidth = 100 / safePractitioners.length
								const leftOffset = practIndex * columnWidth

								return practitionerBlocks.map((block, blockIndex) => (
									<AvailableSlotBlock
										key={`block-week-${practitioner.id}-${blockIndex}`}
										block={block}
										timeSlotHeight={timeSlotHeight}
										onSlotClick={onSlotClick}
										style={{
											left: `${leftOffset}%`,
											width: `${columnWidth - 2}%`,
											marginLeft: '1px',
											marginRight: '1px'
										}}
										compact
									/>
								))
							})}

							{/* Shifts, Appointments and Breaks for all practitioners on this day */}
							{safePractitioners.map((practitioner, practIndex) => {
								if (!practitioner) return null

								const practitionerShifts = dayShifts.filter(
									shift => shift && shift.practitionerId === practitioner.id
								)
								const practitionerAppointments = (dayAppointments || []).filter(
									apt => {
										if (!apt || apt.practitionerId !== practitioner.id) {
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
									}
								)
								const practitionerBreaks = (dayBreaks || []).filter(
									brk => brk && brk.practitionerId === practitioner.id
								)

								const columnWidth = 100 / safePractitioners.length
								const leftOffset = practIndex * columnWidth

								// Get shifts for this practitioner on this day
								const allShifts = getAllShiftsForDate ? getAllShiftsForDate(practitioner.id, date) : []
								const singleShift = getShiftForDate(practitioner.id, date)
								const shiftsToRender = allShifts.length > 0 ? allShifts : (singleShift ? [singleShift] : [])

								return (
									<React.Fragment key={`practitioner-${practitioner.id}-${dateIndex}`}>
										{/* Shift backgrounds (visible when not in shift mode) */}
										{!showShiftsOnly && !shiftMode && shiftsToRender.map((shift, shiftIndex) => {
											const shiftStyle = getShiftBlockStyle(shift, timeSlotHeight, 0.08, calendarSettings.startHour)
											return (
												<React.Fragment key={`shift-bg-${shiftIndex}`}>
													{/* Subtle background */}
													<div
														className="absolute pointer-events-none"
														style={{
															...shiftStyle,
															left: `${leftOffset}%`,
															width: `${columnWidth}%`,
															zIndex: 0,
															borderLeft: '2px solid #a78bfa'
														}}
													/>
													{/* Start line - darker purple (brand-aligned) */}
													<div
														className="absolute pointer-events-none"
														style={{
															top: shiftStyle.top,
															left: `${leftOffset}%`,
															width: `${columnWidth}%`,
															height: '2px',
															backgroundColor: '#7c3aed',
															zIndex: 2
														}}
													/>
													{/* End line - lighter lavender (brand-aligned) */}
													<div
														className="absolute pointer-events-none"
														style={{
															top: `calc(${shiftStyle.top} + ${shiftStyle.height} - 2px)`,
															left: `${leftOffset}%`,
															width: `${columnWidth}%`,
															height: '2px',
															backgroundColor: '#c4b5fd',
															zIndex: 2
														}}
													/>
												</React.Fragment>
											)
										})}

										{/* Shifts - only show when showShiftsOnly is true or in shift mode */}
										{(showShiftsOnly || shiftMode) && practitionerShifts && practitionerShifts.length > 0 && practitionerShifts.map((shift) => (
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
													left: `${leftOffset}%`,
													width: `${columnWidth - 2}%`,
													marginLeft: '1px',
													marginRight: '1px'
												}}
											/>
										))}

										{/* Appointments */}
										{!showShiftsOnly && practitionerAppointments && practitionerAppointments.length > 0 && practitionerAppointments.map((appointment) => (
											<AppointmentSlot
												key={appointment.id}
												appointment={appointment}
												timeSlotHeight={timeSlotHeight}
												calendarSettings={calendarSettings}
												practitionerInitials={practitioner.initials}
												onClick={(e) => onAppointmentClick(appointment)}
												onDragStart={onAppointmentDragStart}
												onDragEnd={onAppointmentDragEnd}
												doubleBookingMode={doubleBookingMode}
												style={{
													left: `${leftOffset}%`,
													width: `${columnWidth - 2}%`,
													marginLeft: '1px',
													marginRight: '1px'
												}}
											/>
										))}

										{/* Breaks */}
										{!showShiftsOnly && practitionerBreaks && practitionerBreaks.length > 0 && practitionerBreaks.map((breakItem) => (
											<BreakSlot
												key={breakItem.id}
												breakItem={breakItem}
												timeSlotHeight={timeSlotHeight}
												calendarSettings={calendarSettings}
												practitionerInitials={practitioner.initials}
												onClick={(e) => onBreakClick(breakItem)}
												style={{
													left: `${leftOffset}%`,
													width: `${columnWidth - 2}%`,
													marginLeft: '1px',
													marginRight: '1px'
												}}
											/>
										))}
									</React.Fragment>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
