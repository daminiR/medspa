// src/components/calendar/GoToDateModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import moment from 'moment'

interface GoToDateModalProps {
	isOpen: boolean
	onClose: () => void
	onSelectDate: (date: Date) => void
	currentDate: Date
}

export default function GoToDateModal({ isOpen, onClose, onSelectDate, currentDate }: GoToDateModalProps) {
	const [selectedDate, setSelectedDate] = useState(currentDate)
	const [displayMonth, setDisplayMonth] = useState(moment(currentDate))

	useEffect(() => {
		if (isOpen) {
			setSelectedDate(currentDate)
			setDisplayMonth(moment(currentDate))
		}
	}, [isOpen, currentDate])

	if (!isOpen) return null

	const startOfMonth = displayMonth.clone().startOf('month')
	const endOfMonth = displayMonth.clone().endOf('month')
	const startOfWeek = startOfMonth.clone().startOf('week')
	const endOfWeek = endOfMonth.clone().endOf('week')

	const weeks = []
	const day = startOfWeek.clone()

	while (day.isSameOrBefore(endOfWeek)) {
		const week = []
		for (let i = 0; i < 7; i++) {
			week.push(day.clone())
			day.add(1, 'day')
		}
		weeks.push(week)
	}

	const handleSelectDate = (date: moment.Moment) => {
		const newDate = date.toDate()
		setSelectedDate(newDate)
		onSelectDate(newDate)
		onClose()
	}

	const handlePrevMonth = () => {
		setDisplayMonth(displayMonth.clone().subtract(1, 'month'))
	}

	const handleNextMonth = () => {
		setDisplayMonth(displayMonth.clone().add(1, 'month'))
	}

	const handleToday = () => {
		const today = new Date()
		setSelectedDate(today)
		onSelectDate(today)
		onClose()
	}

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-25 z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[calc(100vw-32px)] max-w-[384px]">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-lg font-semibold">Go to Date</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Calendar */}
				<div className="p-4">
					{/* Month Navigation */}
					<div className="flex items-center justify-between mb-4">
						<button
							onClick={handlePrevMonth}
							className="p-1 hover:bg-gray-100 rounded"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<h4 className="text-lg font-medium">
							{displayMonth.format('MMMM YYYY')}
						</h4>
						<button
							onClick={handleNextMonth}
							className="p-1 hover:bg-gray-100 rounded"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>

					{/* Day Headers */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
							<div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
								{day}
							</div>
						))}
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1">
						{weeks.map((week, weekIndex) => (
							week.map((day, dayIndex) => {
								const isCurrentMonth = day.isSame(displayMonth, 'month')
								const isSelected = day.isSame(selectedDate, 'day')
								const isToday = day.isSame(moment(), 'day')
								const isCurrent = day.isSame(currentDate, 'day')

								return (
									<button
										key={`${weekIndex}-${dayIndex}`}
										onClick={() => handleSelectDate(day)}
										className={`
											p-2 text-sm rounded hover:bg-gray-100 transition-colors relative
											${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
											${isSelected ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
											${isToday && !isSelected ? 'font-bold text-purple-600' : ''}
											${isCurrent && !isSelected ? 'ring-2 ring-purple-300' : ''}
										`}
									>
										{day.format('D')}
										{isToday && (
											<div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
										)}
									</button>
								)
							})
						))}
					</div>

					{/* Quick Actions */}
					<div className="flex items-center justify-between mt-4 pt-4 border-t">
						<button
							onClick={handleToday}
							className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
						>
							Today
						</button>
						<div className="flex space-x-2">
							<button
								onClick={onClose}
								className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									onSelectDate(selectedDate)
									onClose()
								}}
								className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
							>
								Go to Date
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
