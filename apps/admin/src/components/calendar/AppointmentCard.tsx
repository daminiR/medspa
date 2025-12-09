import React from 'react'
import moment from 'moment'
import { Coffee, AlertCircle } from 'lucide-react'
import { Appointment, Break } from '@/lib/data'
import { CalendarSettings, ContinuousSlotBlock, DragState } from '@/types/calendar'
import { getShiftBlockStyle, getDragSelectionStyle } from '@/utils/calendarHelpers'
import AppointmentSlot from './AppointmentSlot'  // Fixed: Import AppointmentSlot instead of itself
import BreakSlot from './BreakSlot'
import AvailableSlotBlock from './AvailableSlotBlock'

interface DayViewProps {
	selectedDate: Date
	visiblePractitioners: any[]
	appointments: Appointment[]
	breaks: Break[]
	calendarSettings: CalendarSettings
	timeSlotHeight: number
	showShiftsOnly: boolean
	createMode: 'appointment' | 'break'
	isDragging: boolean
	dragStart: DragState | null
	dragEnd: { y: number; time: { hour: number; minute: number } } | null
	isDraggingWaitlistPatient: boolean
	continuousSlotBlocks: ContinuousSlotBlock[]
	today: Date
	getShiftForDate: (practitionerId: string, date: Date) => any
	onAppointmentClick: (appointment: Appointment) => void
	onBreakClick: (breakItem: Break) => void
	onTimeSlotClick: (e: React.MouseEvent, practitionerId: string) => void
	onSlotClick: (slot: any) => void
	onMouseDown: (e: React.MouseEvent, practitionerId: string) => void
	onDragOver: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent, practitionerId: string) => void
}

export default function DayView({
	selectedDate,
	visiblePractitioners,
	appointments,
	breaks,
	calendarSettings,
	timeSlotHeight,
	showShiftsOnly,
	createMode,
	isDragging,
	dragStart,
	dragEnd,
	isDraggingWaitlistPatient,
	continuousSlotBlocks,
	today,
	getShiftForDate,
	onAppointmentClick,
	onBreakClick,
	onTimeSlotClick,
	onSlotClick,
	onMouseDown,
	onDragOver,
	onDrop
}: DayViewProps) {
	return (
		<>
			{visiblePractitioners.map((practitioner) => (
				<div key={practitioner.id} className="flex-1 min-w-[200px] border-r border-gray-200">
					{/* Practitioner Header */}
					<div className="h-16 border-b border-gray-200 bg-gray-50 flex items-center justify-center px-2">
						<div className="flex items-center space-x-2">
							{calendarSettings.showStaffPhotos ? (
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
									{practitioner.initials}
								</div>
							) : (
								<div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-medium">
									{practitioner.initials}
								</div>
							)}
							<span className={`${calendarSettings.compactView ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>
								{practitioner.name}
							</span>
						</div>
					</div>

					{/* Time Grid */}
					<div
						className="relative bg-white"
						onClick={(e) => onTimeSlotClick(e, practitioner.id)}
						onMouseDown={(e) => onMouseDown(e, practitioner.id)}
						onDragOver={onDragOver}
						onDrop={(e) => onDrop(e, practitioner.id)}
						style={{
							height: `${timeSlotHeight * 13}px`,
							cursor: createMode === 'appointment' ? 'pointer' : createMode === 'break' && !isDragging ? 'crosshair' : 'default'
						}}
					>
						{/* Drop zone indicator */}
						{isDraggingWaitlistPatient && (
							<div className="absolute inset-0 pointer-events-none z-5">
								<div className="absolute inset-0 bg-purple-100 bg-opacity-20 border-2 border-dashed border-purple-400 rounded-lg m-1">
									<div className="absolute inset-x-0 top-4 text-center">
										<div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs inline-flex items-center shadow-lg">
											<AlertCircle className="h-3 w-3 mr-1" />
											Drop to book here
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Grid lines - every 15 minutes */}
						{Array.from({ length: 52 }, (_, i) => (
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
							const shift = getShiftForDate(practitioner.id, selectedDate)
							if (!shift || showShiftsOnly) return null

							// Create overlays for before and after shift
							const beforeShiftHeight = ((shift.startHour - 8) * timeSlotHeight + (shift.startMinute / 60) * timeSlotHeight)
							const afterShiftTop = ((shift.endHour - 8) * timeSlotHeight + (shift.endMinute / 60) * timeSlotHeight)
							const afterShiftHeight = (12 * timeSlotHeight) - afterShiftTop // Until 8 PM

							return (
								<>
									{/* Before shift overlay */}
									{beforeShiftHeight > 0 && (
										<div
											className="absolute left-0 right-0 bg-gray-100 opacity-50 pointer-events-none"
											style={{
												top: 0,
												height: `${beforeShiftHeight}px`,
												zIndex: 2
											}}
										/>
									)}
									{/* After shift overlay */}
									{afterShiftHeight > 0 && (
										<div
											className="absolute left-0 right-0 bg-gray-100 opacity-50 pointer-events-none"
											style={{
												top: `${afterShiftTop}px`,
												height: `${afterShiftHeight}px`,
												zIndex: 2
											}}
										/>
									)}
								</>
							)
						})()}

						{/* Shift background */}
						{(() => {
							const shift = getShiftForDate(practitioner.id, selectedDate)
							if (!shift) return null

							return (
								<div
									className="absolute left-0 right-0 pointer-events-none"
									style={{
										...getShiftBlockStyle(shift, timeSlotHeight, showShiftsOnly ? 1 : 0.1),
										zIndex: 1
									}}
								>
									{showShiftsOnly && (
										<div className="h-full flex items-center justify-center text-white font-medium">
											{shift.startHour}:{shift.startMinute.toString().padStart(2, '0')} - {shift.endHour}:{shift.endMinute.toString().padStart(2, '0')}
										</div>
									)}
								</div>
							)
						})()}

						{/* Current time indicator (only for today) */}
						{moment(selectedDate).isSame(today, 'day') && (() => {
							const currentHour = 14
							const currentMinute = 30
							if (currentHour >= 8 && currentHour < 20) {
								const topOffset = ((currentHour - 8) * timeSlotHeight + (currentMinute / 60) * timeSlotHeight)
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
						{continuousSlotBlocks
							.filter(block =>
								block.practitionerId === practitioner.id &&
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

						{/* Drag Selection (only for breaks) */}
						{isDragging && dragStart?.practitionerId === practitioner.id && createMode === 'break' && (
							<div
								className="absolute bg-gray-400 opacity-50 rounded pointer-events-none"
								style={getDragSelectionStyle(dragStart, dragEnd, timeSlotHeight)}
							>
								<div className="p-1 text-xs text-white font-medium flex items-center">
									<Coffee className="h-3 w-3 mr-1" />
									{(() => {
										if (!dragStart || !dragEnd) return ''
										const startMinutes = dragStart.time.hour * 60 + dragStart.time.minute
										const endMinutes = dragEnd.time.hour * 60 + dragEnd.time.minute
										const duration = Math.abs(endMinutes - startMinutes)
										return `${duration} min break`
									})()}
								</div>
							</div>
						)}

						{/* Appointments - Now using AppointmentSlot */}
						{!showShiftsOnly && appointments
							.filter(apt => apt.practitionerId === practitioner.id && moment(apt.startTime).isSame(selectedDate, 'day'))
							.map((appointment) => (
								<AppointmentSlot
									key={appointment.id}
									appointment={appointment}
									timeSlotHeight={timeSlotHeight}
									calendarSettings={calendarSettings}
									onClick={(e, apt) => onAppointmentClick(appointment)}
									style={{
										left: '4px',
										right: '4px'
									}}
								/>
							))}

						{/* Breaks */}
						{!showShiftsOnly && breaks
							.filter(breakItem =>
								breakItem.practitionerId === practitioner.id &&
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
			))}
		</>
	)
}
