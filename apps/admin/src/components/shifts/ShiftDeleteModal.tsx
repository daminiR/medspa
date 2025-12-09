import React from 'react'

interface ShiftDeleteModalProps {
	isOpen: boolean
	onClose: () => void
	onDeleteSingle: () => void
	onDeleteAll: () => void
	shiftInfo: {
		date: string
		time: string
	}
}

export default function ShiftDeleteModal({
	isOpen,
	onClose,
	onDeleteSingle,
	onDeleteAll,
	shiftInfo
}: ShiftDeleteModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full">
				<h3 className="text-lg font-semibold mb-2">This shift is part of a series</h3>
				<p className="text-gray-600 mb-6">Do you want to remove only this shift, or remove this and all future shifts?</p>

				<div className="space-y-3">
					<button
						onClick={onDeleteSingle}
						className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
					>
						<div className="font-medium">Only This Shift</div>
						<div className="text-sm text-gray-500">{shiftInfo.date} at {shiftInfo.time}</div>
					</button>

					<button
						onClick={onDeleteAll}
						className="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50"
					>
						<div className="font-medium">All Shifts</div>
						<div className="text-sm text-gray-500">All shifts in this series</div>
					</button>

					<button
						onClick={onClose}
						className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	)
}
