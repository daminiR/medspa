// src/components/breaks/BreakDetails.tsx
'use client'

import { useState } from 'react'
import { X, Coffee, Clock, Calendar, User, AlertCircle, Repeat } from 'lucide-react'
import moment from 'moment'

interface Break {
	id: string
	practitionerId: string
	practitionerName: string
	type: 'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other'
	startTime: Date
	endTime: Date
	duration: number
	isRecurring: boolean
	recurringDays?: number[] // days of week (0-6)
	availableForEmergencies: boolean
	notes?: string
}

interface BreakDetailsProps {
	breakItem: Break
	onClose: () => void
	onUpdate?: (breakId: string, updates: Partial<Break>) => void
	onDelete?: (breakId: string) => void
}

const breakTypes = [
	{ id: 'lunch', label: 'Lunch Break', icon: '🍽️', color: '#FFB74D' },
	{ id: 'meeting', label: 'Team Meeting', icon: '👥', color: '#64B5F6' },
	{ id: 'personal', label: 'Personal Time', icon: '👤', color: '#BA68C8' },
	{ id: 'out_of_office', label: 'Out of Office', icon: '🏖️', color: '#E57373' },
	{ id: 'training', label: 'Training', icon: '📚', color: '#81C784' },
	{ id: 'other', label: 'Other', icon: '📝', color: '#9E9E9E' }
]

export default function BreakDetails({ breakItem: initialBreak, onClose, onUpdate, onDelete }: BreakDetailsProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [breakData, setBreakData] = useState(initialBreak)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	const breakType = breakTypes.find(t => t.id === breakData.type) || breakTypes[5]
	const formatTime = (date: Date) => moment(date).format('h:mm A')
	const formatDate = (date: Date) => moment(date).format('ddd, MMM D')
	const headerColor = breakType.color || '#6B7280'

	const handleSave = () => {
		onUpdate?.(breakData.id, breakData)
		setIsEditing(false)
	}

	const handleDelete = () => {
		onDelete?.(breakData.id)
		onClose()
	}

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	return (
		<div className="h-full flex flex-col bg-white">
			{/* Header */}
			<div className="text-white p-4" style={{ backgroundColor: headerColor }}>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center space-x-2">
						<span className="text-2xl">{breakType.icon}</span>
						<h2 className="text-xl font-semibold">{breakType.label}</h2>
					</div>
					<button
						onClick={onClose}
						className="p-1 hover:bg-white/20 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex items-center text-white/90 text-sm">
					<User className="h-4 w-4 mr-1" />
					<span>{breakData.practitionerName}</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4">
				{/* Time Information */}
				<div className="mb-6">
					<div className="flex items-center text-gray-600 mb-2">
						<Calendar className="h-4 w-4 mr-2" />
						<span className="text-sm">{formatDate(breakData.startTime)}</span>
					</div>
					<div className="flex items-center text-gray-900">
						<Clock className="h-4 w-4 mr-2 text-gray-400" />
						<span className="font-medium">
							{formatTime(breakData.startTime)} - {formatTime(breakData.endTime)}
						</span>
						<span className="text-gray-500 ml-2">({breakData.duration} min)</span>
					</div>
				</div>

				{isEditing ? (
					<div className="space-y-4">
						{/* Break Type Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Break Type
							</label>
							<div className="grid grid-cols-2 gap-2">
								{breakTypes.map(type => (
									<button
										key={type.id}
										onClick={() => setBreakData({ ...breakData, type: type.id as Break['type'] })}
										className={`p-3 rounded-lg border-2 transition-all ${breakData.type === type.id
												? 'border-purple-600 bg-purple-50'
												: 'border-gray-200 hover:border-gray-300'
											}`}
									>
										<span className="text-xl mb-1">{type.icon}</span>
										<div className="text-sm font-medium">{type.label}</div>
									</button>
								))}
							</div>
						</div>

						{/* Recurring Option */}
						<div className="border-t pt-4">
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={breakData.isRecurring}
									onChange={(e) => setBreakData({ ...breakData, isRecurring: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
								<span className="text-sm font-medium text-gray-700">
									<Repeat className="h-4 w-4 inline mr-1" />
									Recurring break
								</span>
							</label>

							{breakData.isRecurring && (
								<div className="mt-3 ml-6">
									<p className="text-xs text-gray-600 mb-2">Repeat on:</p>
									<div className="flex space-x-1">
										{weekDays.map((day, index) => (
											<button
												key={day}
												onClick={() => {
													const days = breakData.recurringDays || []
													if (days.includes(index)) {
														setBreakData({
															...breakData,
															recurringDays: days.filter(d => d !== index)
														})
													} else {
														setBreakData({
															...breakData,
															recurringDays: [...days, index].sort()
														})
													}
												}}
												className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${breakData.recurringDays?.includes(index)
														? 'bg-purple-600 text-white'
														: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
													}`}
											>
												{day}
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Emergency Availability */}
						<div className="border-t pt-4">
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={breakData.availableForEmergencies}
									onChange={(e) => setBreakData({
										...breakData,
										availableForEmergencies: e.target.checked
									})}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
								<span className="text-sm font-medium text-gray-700">
									<AlertCircle className="h-4 w-4 inline mr-1 text-amber-500" />
									Available for emergencies
								</span>
							</label>
							<p className="text-xs text-gray-500 ml-6 mt-1">
								Can be contacted for urgent patient needs
							</p>
						</div>

						{/* Notes */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Notes (Optional)
							</label>
							<textarea
								value={breakData.notes || ''}
								onChange={(e) => setBreakData({ ...breakData, notes: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								rows={3}
								placeholder="Add any additional details..."
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex space-x-3 pt-4">
							<button
								onClick={handleSave}
								className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
							>
								Save Changes
							</button>
							<button
								onClick={() => {
									setBreakData(initialBreak)
									setIsEditing(false)
								}}
								className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{/* Quick Info */}
						{breakData.isRecurring && (
							<div className="bg-purple-50 rounded-lg p-3">
								<div className="flex items-center text-sm text-purple-800">
									<Repeat className="h-4 w-4 mr-2" />
									<span className="font-medium">Recurring Break</span>
								</div>
								{breakData.recurringDays && (
									<p className="text-xs text-purple-600 mt-1 ml-6">
										Every {breakData.recurringDays.map(d => weekDays[d]).join(', ')}
									</p>
								)}
							</div>
						)}

						{breakData.availableForEmergencies && (
							<div className="bg-amber-50 rounded-lg p-3">
								<div className="flex items-center text-sm text-amber-800">
									<AlertCircle className="h-4 w-4 mr-2" />
									<span>Available for emergencies</span>
								</div>
							</div>
						)}

						{breakData.notes && (
							<div>
								<h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
								<p className="text-sm text-gray-600">{breakData.notes}</p>
							</div>
						)}

						{/* Edit Button */}
						<button
							onClick={() => setIsEditing(true)}
							className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
						>
							Edit Break Details
						</button>

						{/* Delete Button */}
						{!showDeleteConfirm ? (
							<button
								onClick={() => setShowDeleteConfirm(true)}
								className="w-full text-red-600 text-sm hover:text-red-700 transition-colors"
							>
								Remove Break
							</button>
						) : (
							<div className="bg-red-50 rounded-lg p-3">
								<p className="text-sm text-red-800 mb-2">
									Are you sure you want to remove this break?
								</p>
								<div className="flex space-x-2">
									<button
										onClick={handleDelete}
										className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
									>
										Yes, Remove
									</button>
									<button
										onClick={() => setShowDeleteConfirm(false)}
										className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
