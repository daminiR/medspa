import React, { useState, useRef, useEffect } from 'react'
import { Clock, ChevronDown, MapPin } from 'lucide-react'
import moment from 'moment'
import { ViewMode, CalendarViewType } from '@/types/calendar'

interface CalendarHeaderProps {
	selectedDate: Date
	view: ViewMode
	viewMode: 'all' | 'single'
	singlePractitionerId?: string | null
	weekDates: Date[]
	today: Date
	practitioners: any[]
	showWaitlist: boolean
	showShiftsOnly: boolean
	shiftMode: boolean
	waitlistCount?: number
	waitlistCountsByPractitioner?: Record<string, number>
	showResources?: boolean
	calendarViewType?: CalendarViewType
	onShowAll?: () => void
	onShowWaitlist: () => void
	onToggleShifts: () => void
	onShiftAction: (action: 'edit' | 'manage') => void
	onShowResources?: () => void
	onCalendarViewTypeChange?: (type: CalendarViewType) => void
}

export default function CalendarHeader({
	selectedDate,
	view,
	viewMode,
	singlePractitionerId,
	weekDates,
	today,
	practitioners,
	showWaitlist,
	showShiftsOnly,
	shiftMode,
	waitlistCount = 0,
	waitlistCountsByPractitioner = {},
	showResources = false,
	calendarViewType = 'practitioners',
	onShowAll,
	onShowWaitlist,
	onToggleShifts,
	onShiftAction,
	onShowResources,
	onCalendarViewTypeChange
}: CalendarHeaderProps) {
	const [showShiftDropdown, setShowShiftDropdown] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowShiftDropdown(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className="bg-white border-b">
			<div className="px-6 py-3 flex items-center justify-between">
				<div className="flex items-center space-x-6">
					<h2 className="text-2xl font-normal text-gray-900">
						{view === 'week'
							? `${moment(weekDates[0]).format('MMM D')} - ${moment(weekDates[weekDates.length - 1]).format('MMM D, YYYY')}`
							: moment(selectedDate).format('MMMM Do YYYY')
						}
					</h2>
					<div className="flex items-center space-x-4 text-sm">
						{view === 'day' && moment(selectedDate).isSame(today, 'day') && (
							<span className="text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">
								Today
							</span>
						)}
						<span className="text-gray-600">
							{view === 'week'
								? `Week of ${moment(weekDates[0]).format('MMM D, YYYY')}`
								: moment(selectedDate).format('ddd MMM D, YYYY')
							}
						</span>
						{viewMode === 'single' && singlePractitionerId && (
							<>
								<span className="text-gray-400">•</span>
								<button
									onClick={onShowAll}
									className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
								>
									Viewing: {practitioners.find(p => p.id === singlePractitionerId)?.name}
									<span className="ml-2 text-sm">→ Show all</span>
								</button>
							</>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-6">
					<button className="text-sm text-gray-700 hover:text-gray-900">
						Reminders
					</button>

					<button
						onClick={onShowWaitlist}
						className={`text-sm flex items-center relative px-3 py-1 rounded transition-colors ${showWaitlist
								? 'bg-purple-100 text-purple-700'
								: 'text-gray-700 hover:text-gray-900'
							}`}
					>
						<Clock className="h-4 w-4 mr-1" />
						Wait List
						{/* Badge showing waitlist count */}
						{waitlistCount > 0 && (
							<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
								{waitlistCount}
							</span>
						)}
					</button>

					<div className="flex items-center space-x-4">
						{/* Shifts Dropdown */}
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={() => setShowShiftDropdown(!showShiftDropdown)}
								className={`text-sm flex items-center px-3 py-1 rounded transition-colors border ${shiftMode
										? 'bg-orange-500 text-white border-orange-500'
										: showShiftsOnly
											? 'bg-purple-100 text-purple-700 border-purple-200'
											: 'text-gray-700 hover:text-gray-900 border-transparent hover:bg-gray-50'
									}`}
							>
								Shifts
								<ChevronDown className="h-3 w-3 ml-1" />
							</button>

							{showShiftDropdown && (
								<div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[200px]">
									<button
										onClick={() => {
											onShiftAction('edit')
											setShowShiftDropdown(false)
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
									>
										Edit Individual Shifts
									</button>
									<button
										onClick={() => {
											onShiftAction('manage')
											setShowShiftDropdown(false)
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
									>
										Manage Shifts
									</button>
									<div className="border-t my-1"></div>
									<button
										onClick={() => {
											onToggleShifts()
											setShowShiftDropdown(false)
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
									>
										<span>{showShiftsOnly ? 'Hide Shifts' : 'Show Shifts Only'}</span>
										{showShiftsOnly && <span className="text-purple-600">✓</span>}
									</button>
								</div>
							)}
						</div>

						<button 
							onClick={onShowResources}
							className={`text-sm flex items-center px-3 py-1 rounded transition-colors ${showResources 
								? 'bg-green-100 text-green-700' 
								: 'text-gray-700 hover:text-gray-900'
							}`}
						>
							Resources
							{showResources && <span className="ml-1 text-xs">✓</span>}
						</button>

						<button 
							onClick={() => onCalendarViewTypeChange?.(calendarViewType === 'rooms' ? 'practitioners' : 'rooms')}
							className={`text-sm flex items-center px-3 py-1 rounded transition-colors ${
								calendarViewType === 'rooms' 
									? 'bg-blue-100 text-blue-700' 
									: 'text-gray-700 hover:text-gray-900'
							}`}
						>
							<MapPin className="h-4 w-4 mr-1" />
							Rooms
							{calendarViewType === 'rooms' && <span className="ml-1 text-xs">✓</span>}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
