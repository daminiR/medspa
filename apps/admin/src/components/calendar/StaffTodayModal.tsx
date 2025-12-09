// src/components/calendar/StaffTodayModal.tsx
'use client'

import { X } from 'lucide-react'

interface StaffMember {
	id: string
	name: string
	initials: string
	discipline: string
	schedule: {
		start: string
		end: string
		breaks?: { start: string; end: string }[]
	}
	appointmentCount: number
	isWorking: boolean
}

interface StaffTodayModalProps {
	isOpen: boolean
	onClose: () => void
	date: Date
	staff: StaffMember[]
	onToggleStaff: (staffId: string) => void
	selectedStaffIds: string[]
}

export default function StaffTodayModal({
	isOpen,
	onClose,
	date,
	staff,
	onToggleStaff,
	selectedStaffIds
}: StaffTodayModalProps) {
	if (!isOpen) return null

	const workingStaff = staff.filter(s => s.isWorking)
	const offStaff = staff.filter(s => !s.isWorking)

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-gray-900">Staff Schedule</h2>
						<p className="text-sm text-gray-600">
							{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
						</p>
					</div>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
						<X className="h-5 w-5 text-gray-500" />
					</button>
				</div>

				<div className="p-6 overflow-y-auto">
					{/* Working Today */}
					<div className="mb-6">
						<h3 className="text-sm font-medium text-gray-900 mb-3">Working Today ({workingStaff.length})</h3>
						<div className="space-y-2">
							{workingStaff.map((member) => (
								<div
									key={member.id}
									className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedStaffIds.includes(member.id)
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-gray-300'
										}`}
									onClick={() => onToggleStaff(member.id)}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">
												{member.initials}
											</div>
											<div>
												<p className="font-medium text-gray-900">{member.name}</p>
												<p className="text-sm text-gray-600">{member.discipline}</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-gray-900">
												{member.schedule.start} - {member.schedule.end}
											</p>
											<p className="text-sm text-gray-600">
												{member.appointmentCount} appointments
											</p>
										</div>
									</div>
									{member.schedule.breaks && member.schedule.breaks.length > 0 && (
										<div className="mt-2 text-sm text-gray-500">
											Breaks: {member.schedule.breaks.map(b => `${b.start}-${b.end}`).join(', ')}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Not Working Today */}
					{offStaff.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-gray-900 mb-3">Not Working Today ({offStaff.length})</h3>
							<div className="space-y-2">
								{offStaff.map((member) => (
									<div
										key={member.id}
										className="p-4 border border-gray-200 rounded-lg opacity-50"
									>
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-medium">
												{member.initials}
											</div>
											<div>
												<p className="font-medium text-gray-900">{member.name}</p>
												<p className="text-sm text-gray-600">{member.discipline}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	)
}
