'use client'

import { useState } from 'react'
import { X, MapPin, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react'
import { mockRooms, mockResourceAssignments } from '@/lib/mockResources'
import { Room } from '@/types/resources'
import moment from 'moment'

interface RoomsPanelProps {
	isOpen: boolean
	onClose: () => void
	selectedDate: Date
	view: 'day' | 'week'
	weekDates: Date[]
}

export default function RoomsPanel({
	isOpen,
	onClose,
	selectedDate,
	view,
	weekDates
}: RoomsPanelProps) {
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
	const [showAddRoom, setShowAddRoom] = useState(false)
	const [editingRoom, setEditingRoom] = useState<Room | null>(null)
	
	// Form state for adding/editing rooms
	const [roomForm, setRoomForm] = useState({
		name: '',
		capacity: 1
	})

	// Get room availability for the selected date(s)
	const getRoomAvailability = (roomId: string) => {
		const dates = view === 'week' ? weekDates : [selectedDate]
		const availability: Record<string, boolean> = {}
		
		dates.forEach(date => {
			const dateStr = moment(date).format('YYYY-MM-DD')
			// Check if room has any appointments on this date
			// In a real app, this would check against actual appointments
			availability[dateStr] = true // For now, all rooms are available
		})
		
		return availability
	}

	const handleAddRoom = () => {
		if (!roomForm.name.trim()) return
		
		const newRoom: Room = {
			id: `room-${Date.now()}`,
			name: roomForm.name,
			locationId: 'loc-1', // Default location
			capacity: roomForm.capacity,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date()
		}
		
		// In a real app, this would be an API call
		mockRooms.push(newRoom)
		
		// Reset form
		setRoomForm({ name: '', capacity: 1 })
		setShowAddRoom(false)
	}

	const handleUpdateRoom = () => {
		if (!editingRoom || !roomForm.name.trim()) return
		
		// In a real app, this would be an API call
		const roomIndex = mockRooms.findIndex(r => r.id === editingRoom.id)
		if (roomIndex !== -1) {
			mockRooms[roomIndex] = {
				...editingRoom,
				name: roomForm.name,
				capacity: roomForm.capacity,
				updatedAt: new Date()
			}
		}
		
		setEditingRoom(null)
		setRoomForm({ name: '', capacity: 1 })
	}

	const handleDeleteRoom = (roomId: string) => {
		if (!confirm('Are you sure you want to delete this room?')) return
		
		// In a real app, this would be an API call
		const roomIndex = mockRooms.findIndex(r => r.id === roomId)
		if (roomIndex !== -1) {
			mockRooms.splice(roomIndex, 1)
		}
		
		if (selectedRoom?.id === roomId) {
			setSelectedRoom(null)
		}
	}

	const startEdit = (room: Room) => {
		setEditingRoom(room)
		setRoomForm({
			name: room.name,
			capacity: room.capacity
		})
	}

	const cancelEdit = () => {
		setEditingRoom(null)
		setRoomForm({ name: '', capacity: 1 })
	}

	return (
		<div className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
			isOpen ? 'translate-x-0' : 'translate-x-full'
		}`}>
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gray-50">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<MapPin className="h-5 w-5 mr-2 text-gray-600" />
							<h2 className="text-xl font-semibold">Rooms Management</h2>
						</div>
						<button
							onClick={onClose}
							className="p-1 hover:bg-gray-200 rounded-full transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					{/* Add Room Button */}
					<div className="p-4 border-b">
						{!showAddRoom ? (
							<button
								onClick={() => setShowAddRoom(true)}
								className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add New Room
							</button>
						) : (
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Room Name
									</label>
									<input
										type="text"
										value={roomForm.name}
										onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
										placeholder="e.g., Treatment Room 1"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										autoFocus
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Capacity
									</label>
									<input
										type="number"
										value={roomForm.capacity}
										onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
										min="1"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={handleAddRoom}
										disabled={!roomForm.name.trim()}
										className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
									>
										Add Room
									</button>
									<button
										onClick={() => {
											setShowAddRoom(false)
											setRoomForm({ name: '', capacity: 1 })
										}}
										className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
									>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Rooms List */}
					<div className="p-4 space-y-3">
						{mockRooms.filter(room => room.isActive).map(room => {
							const isEditing = editingRoom?.id === room.id
							const availability = getRoomAvailability(room.id)
							const isFullyAvailable = Object.values(availability).every(a => a)

							return (
								<div
									key={room.id}
									className={`border rounded-lg p-4 transition-all ${
										selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
									}`}
								>
									{isEditing ? (
										<div className="space-y-3">
											<input
												type="text"
												value={roomForm.name}
												onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												autoFocus
											/>
											<input
												type="number"
												value={roomForm.capacity}
												onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
												min="1"
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											/>
											<div className="flex gap-2">
												<button
													onClick={handleUpdateRoom}
													className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
												>
													Save
												</button>
												<button
													onClick={cancelEdit}
													className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
												>
													Cancel
												</button>
											</div>
										</div>
									) : (
										<div
											onClick={() => setSelectedRoom(room)}
											className="cursor-pointer"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3 className="font-medium text-gray-900">{room.name}</h3>
													<p className="text-sm text-gray-500 mt-1">
														Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
													</p>
													<div className="flex items-center mt-2">
														{isFullyAvailable ? (
															<div className="flex items-center text-green-600 text-sm">
																<Check className="h-4 w-4 mr-1" />
																Available
															</div>
														) : (
															<div className="flex items-center text-yellow-600 text-sm">
																<AlertCircle className="h-4 w-4 mr-1" />
																Partially Booked
															</div>
														)}
													</div>
												</div>
												<div className="flex items-center space-x-1 ml-4">
													<button
														onClick={(e) => {
															e.stopPropagation()
															startEdit(room)
														}}
														className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
													>
														<Edit2 className="h-4 w-4" />
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleDeleteRoom(room.id)
														}}
														className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</div>
										</div>
									)}
								</div>
							)
						})}

						{mockRooms.filter(room => room.isActive).length === 0 && (
							<div className="text-center py-8 text-gray-500">
								<MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
								<p className="text-sm">No rooms configured yet</p>
								<p className="text-xs mt-1">Add your first room to get started</p>
							</div>
						)}
					</div>

					{/* Selected Room Details */}
					{selectedRoom && (
						<div className="border-t bg-gray-50 p-4">
							<h3 className="font-medium text-gray-900 mb-3">Room Details</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Name:</span>
									<span className="font-medium">{selectedRoom.name}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Capacity:</span>
									<span className="font-medium">{selectedRoom.capacity}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Status:</span>
									<span className="font-medium text-green-600">Active</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Created:</span>
									<span className="font-medium">{moment(selectedRoom.createdAt).format('MMM D, YYYY')}</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}