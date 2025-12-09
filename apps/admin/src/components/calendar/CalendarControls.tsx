import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Coffee, Settings, MapPin, Send, UsersRound } from 'lucide-react'
import moment from 'moment'
import { ViewMode, CreateMode } from '@/types/calendar'

interface CalendarControlsProps {
	selectedDate: Date
	today: Date
	view: ViewMode
	createMode: CreateMode
	isShowingStaffToday: boolean
	workingTodayCount: number
	onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void
	onViewChange: (view: ViewMode) => void
	onCreateModeChange: (mode: CreateMode) => void
	onStaffToday: () => void
	onGoToDate: () => void
	onSettings: () => void
	onManageRooms?: () => void
	onExpressBooking?: () => void
	onGroupBooking?: () => void
}

export default function CalendarControls({
	selectedDate,
	today,
	view,
	createMode,
	isShowingStaffToday,
	workingTodayCount,
	onNavigate,
	onViewChange,
	onCreateModeChange,
	onStaffToday,
	onGoToDate,
	onSettings,
	onManageRooms,
	onExpressBooking,
	onGroupBooking
}: CalendarControlsProps) {
	return (
		<div className="bg-white border-t px-6 py-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-1">
						<button
							onClick={() => onNavigate('PREV')}
							className="p-1 hover:bg-gray-100 rounded"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							onClick={() => onNavigate('TODAY')}
							className={`px-3 py-1.5 text-sm font-medium rounded ${moment(selectedDate).isSame(today, 'day')
								? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
								: 'hover:bg-gray-100'
								}`}
						>
							Today
						</button>
						<button
							onClick={() => onNavigate('NEXT')}
							className="p-1 hover:bg-gray-100 rounded"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>

					<div className="flex items-center border rounded-md">
						<button
							onClick={() => onViewChange('day')}
							className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'day'
								? 'bg-purple-600 text-white'
								: 'text-gray-700 hover:bg-gray-100'
								}`}
						>
							Day
						</button>
						<button
							onClick={() => onViewChange('week')}
							className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'week'
								? 'bg-purple-600 text-white'
								: 'text-gray-700 hover:bg-gray-100'
								}`}
						>
							Week
						</button>
					</div>

					{/* Appointment Mode Button - Break moved to top command bar */}
					<button
						onClick={() => onCreateModeChange('appointment')}
						className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center border rounded-md ${createMode === 'appointment'
							? 'bg-purple-600 text-white'
							: 'text-gray-700 hover:bg-gray-100'
							}`}
					>
						<CalendarIcon className="h-4 w-4 mr-1" />
						Appointment
					</button>

					{/* Express Booking Button */}
					{onExpressBooking && (
						<button
							onClick={onExpressBooking}
							className="px-3 py-1.5 text-sm font-medium transition-colors flex items-center border rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
						>
							<Send className="h-4 w-4 mr-1" />
							Express Book
						</button>
					)}

					{/* Group Booking Button */}
					{onGroupBooking && (
						<button
							onClick={onGroupBooking}
							className="px-3 py-1.5 text-sm font-medium transition-colors flex items-center border rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
						>
							<UsersRound className="h-4 w-4 mr-1" />
							Book Group
						</button>
					)}

					{/* Staff Today button */}
					<button
						onClick={onStaffToday}
						className={`flex items-center text-sm hover:bg-gray-50 px-3 py-1.5 rounded ${isShowingStaffToday ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:text-gray-900'
							}`}
					>
						<Users className="h-4 w-4 mr-1" />
						<span>Staff Today ({workingTodayCount})</span>
						{isShowingStaffToday && <span className="ml-1 text-xs">✓</span>}
					</button>
				</div>

				<div className="flex items-center space-x-3">
					<button
						onClick={onGoToDate}
						className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border rounded hover:bg-gray-50"
					>
						<CalendarIcon className="h-4 w-4 mr-2" />
						Go To Date
					</button>

					<button
						onClick={onSettings}
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
					>
						<Settings className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	)
}
