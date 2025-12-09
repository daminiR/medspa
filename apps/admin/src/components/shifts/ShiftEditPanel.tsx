import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import moment from 'moment'
import { Shift, ShiftFormData } from '@/types/shifts'
import { validateShiftTimes } from '@/utils/shiftHelpers'
import { practitioners } from '@/lib/data'
import { mockRooms } from '@/lib/mockResources'

interface ShiftEditPanelProps {
	isOpen: boolean
	onClose: () => void
	onSave: (formData: ShiftFormData) => void
	onDelete?: (shiftId: string, deleteAll: boolean) => void
	initialDate?: Date
	initialPractitionerId?: string
	initialStartTime?: { hour: number; minute: number }
	initialEndTime?: { hour: number; minute: number }
	editingShift?: Shift | null
}

export default function ShiftEditPanel({
	isOpen,
	onClose,
	onSave,
	onDelete,
	initialDate = new Date(),
	initialPractitionerId,
	initialStartTime,
	initialEndTime,
	editingShift
}: ShiftEditPanelProps) {
	const [formData, setFormData] = useState<ShiftFormData>({
		practitionerId: initialPractitionerId || practitioners[0]?.id || '',
		startTime: initialStartTime || { hour: 9, minute: 0 },
		endTime: initialEndTime || { hour: 17, minute: 0 },
		date: initialDate,
		repeat: 'no-repeat',
		repeatUntil: undefined,
		room: '',
		bookingOptions: 'bookable',
		notes: ''
	})

	useEffect(() => {
		if (editingShift) {
			setFormData({
				practitionerId: editingShift.practitionerId,
				startTime: {
					hour: editingShift.startAt.getHours(),
					minute: editingShift.startAt.getMinutes()
				},
				endTime: {
					hour: editingShift.endAt.getHours(),
					minute: editingShift.endAt.getMinutes()
				},
				date: editingShift.startAt,
				repeat: editingShift.repeat,
				repeatUntil: editingShift.repeatUntil,
				room: editingShift.room,
				bookingOptions: editingShift.bookingOptions,
				notes: editingShift.notes || ''
			})
		} else if (initialPractitionerId) {
			setFormData(prev => ({
				...prev,
				practitionerId: initialPractitionerId,
				startTime: initialStartTime || prev.startTime,
				endTime: initialEndTime || prev.endTime,
				date: initialDate
			}))
		}
	}, [editingShift, initialPractitionerId, initialStartTime, initialEndTime, initialDate])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateShiftTimes(formData.startTime, formData.endTime)) {
			alert('End time must be after start time')
			return
		}

		if (formData.repeat !== 'no-repeat' && !formData.repeatUntil) {
			alert('Please select an end date for recurring shifts')
			return
		}

		onSave(formData)
	}

	const generateTimeOptions = () => {
		const options = []
		for (let hour = 6; hour <= 22; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const time = moment().hours(hour).minutes(minute)
				options.push({
					value: { hour, minute },
					label: time.format('h:mm A')
				})
			}
		}
		return options
	}

	const timeOptions = generateTimeOptions()

	return (
		<div className={`fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
			}`}>
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="px-6 py-4 border-b flex items-center justify-between">
					<h2 className="text-lg font-semibold">
						{editingShift ? 'Edit Shift' : 'New Shift'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
					<div className="p-6 space-y-6">
						{/* Staff Member */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Staff Member
							</label>
							<select
								value={formData.practitionerId}
								onChange={(e) => setFormData({ ...formData, practitionerId: e.target.value })}
								className="w-full p-2 border rounded-md"
							>
								{practitioners.map(p => (
									<option key={p.id} value={p.id}>{p.name}</option>
								))}
							</select>
						</div>

						{/* Time */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">Time</h3>

							<div className="space-y-3">
								<div>
									<label className="block text-sm text-gray-600 mb-1">Start At</label>
									<select
										value={`${formData.startTime.hour}:${formData.startTime.minute}`}
										onChange={(e) => {
											const [hour, minute] = e.target.value.split(':').map(Number)
											setFormData({ ...formData, startTime: { hour, minute } })
										}}
										className="w-full p-2 border rounded-md"
									>
										{timeOptions.map(opt => (
											<option key={opt.label} value={`${opt.value.hour}:${opt.value.minute}`}>
												{opt.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">End At</label>
									<select
										value={`${formData.endTime.hour}:${formData.endTime.minute}`}
										onChange={(e) => {
											const [hour, minute] = e.target.value.split(':').map(Number)
											setFormData({ ...formData, endTime: { hour, minute } })
										}}
										className="w-full p-2 border rounded-md"
									>
										{timeOptions.map(opt => (
											<option key={opt.label} value={`${opt.value.hour}:${opt.value.minute}`}>
												{opt.label}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* Repeat */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">Repeat</h3>
							<select
								value={formData.repeat}
								onChange={(e) => setFormData({
									...formData,
									repeat: e.target.value as 'no-repeat' | 'weekly' | 'biweekly',
									repeatUntil: e.target.value === 'no-repeat' ? undefined : formData.repeatUntil
								})}
								className="w-full p-2 border rounded-md"
							>
								<option value="no-repeat">No Repeat</option>
								<option value="weekly">Every Week</option>
								<option value="biweekly">Every 2 Weeks</option>
							</select>

							{formData.repeat !== 'no-repeat' && (
								<div className="mt-3">
									<label className="block text-sm text-gray-600 mb-1">Repeat Until</label>
									<input
										type="date"
										value={formData.repeatUntil ? moment(formData.repeatUntil).format('YYYY-MM-DD') : ''}
										onChange={(e) => setFormData({
											...formData,
											repeatUntil: e.target.value ? new Date(e.target.value) : undefined
										})}
										className="w-full p-2 border rounded-md"
										required={formData.repeat !== 'no-repeat'}
									/>
								</div>
							)}
						</div>

						{/* Room */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">Room</h3>
							<select
								value={formData.room || ''}
								onChange={(e) => setFormData({ ...formData, room: e.target.value })}
								className="w-full p-2 border rounded-md"
							>
								<option value="">No room assigned</option>
								{mockRooms.filter(room => room.isActive).map(room => (
									<option key={room.id} value={room.id}>
										{room.name}
									</option>
								))}
							</select>
						</div>

						{/* Booking Options */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">Booking Options</h3>
							<div className="space-y-2">
								<label className="flex items-center">
									<input
										type="radio"
										name="bookingOptions"
										value="bookable"
										checked={formData.bookingOptions === 'bookable'}
										onChange={(e) => setFormData({ ...formData, bookingOptions: e.target.value as any })}
										className="mr-2 text-purple-600"
									/>
									<span className="text-sm">Bookable Online</span>
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="bookingOptions"
										value="not-bookable"
										checked={formData.bookingOptions === 'not-bookable'}
										onChange={(e) => setFormData({ ...formData, bookingOptions: e.target.value as any })}
										className="mr-2"
									/>
									<span className="text-sm">Not Bookable Online</span>
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="bookingOptions"
										value="contact-to-book"
										checked={formData.bookingOptions === 'contact-to-book'}
										onChange={(e) => setFormData({ ...formData, bookingOptions: e.target.value as any })}
										className="mr-2"
									/>
									<span className="text-sm">Contact us to Book Online</span>
								</label>
							</div>
						</div>

						{/* Notes */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
							<textarea
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								className="w-full p-2 border rounded-md"
								rows={3}
								placeholder="Add any notes..."
							/>
						</div>
					</div>
				</form>

				{/* Footer */}
				<div className="px-6 py-4 border-t space-y-3">
					{editingShift && onDelete && (
						<button
							type="button"
							onClick={() => {
								if (editingShift.seriesId) {
									// Show delete modal
									const deleteAll = window.confirm('Delete all shifts in this series?')
									onDelete(editingShift.id, deleteAll)
								} else {
									onDelete(editingShift.id, false)
								}
							}}
							className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
						>
							Delete
						</button>
					)}

					<div className="flex space-x-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							onClick={handleSubmit}
							className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
