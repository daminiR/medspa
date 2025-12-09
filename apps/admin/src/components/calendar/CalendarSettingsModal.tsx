// src/components/calendar/CalendarSettingsModal.tsx
'use client'

import { useState } from 'react'
import { X, User, Calendar, Users, ZoomIn, Clock, Eye, Palette, Grid3x3 } from 'lucide-react'

interface CalendarSettings {
	showStaffPhotos: boolean
	showWeekends: boolean
	groupByDiscipline: boolean
	zoomLevel: number // 80, 90, 100, 110, 120
	showServiceIcons: boolean
	showDuration: boolean
	compactView: boolean
	timeSlotHeight: string // 'small', 'medium', 'large'
	colorByService: boolean
	showPhoneNumbers: boolean
	autoRefresh: boolean
	refreshInterval: number // minutes
	startHour: number
	endHour: number
	showCancelledAppointments: boolean
	showDeletedAppointments: boolean
}

interface CalendarSettingsModalProps {
	isOpen: boolean
	onClose: () => void
	settings: CalendarSettings
	onUpdateSettings: (settings: CalendarSettings) => void
}

export default function CalendarSettingsModal({
	isOpen,
	onClose,
	settings,
	onUpdateSettings
}: CalendarSettingsModalProps) {
	const [localSettings, setLocalSettings] = useState(settings)

	if (!isOpen) return null

	const handleToggle = (key: keyof CalendarSettings) => {
		const newSettings = { ...localSettings, [key]: !localSettings[key] }
		setLocalSettings(newSettings)
		onUpdateSettings(newSettings)
	}

	const handleZoomChange = (zoom: number) => {
		const newSettings = { ...localSettings, zoomLevel: zoom }
		setLocalSettings(newSettings)
		onUpdateSettings(newSettings)
	}

	const handleTimeSlotHeight = (height: string) => {
		const newSettings = { ...localSettings, timeSlotHeight: height }
		setLocalSettings(newSettings)
		onUpdateSettings(newSettings)
	}

	const handleRefreshInterval = (interval: number) => {
		const newSettings = { ...localSettings, refreshInterval: interval }
		setLocalSettings(newSettings)
		onUpdateSettings(newSettings)
	}

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-25 z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[500px] max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-lg font-semibold">Calendar Settings</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{/* Display Settings */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
							<Eye className="h-4 w-4 mr-2" />
							Display Settings
						</h4>
						<div className="space-y-3">
							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<User className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Show Staff Photos</div>
										<div className="text-xs text-gray-500">Display profile photos instead of initials</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showStaffPhotos}
									onChange={() => handleToggle('showStaffPhotos')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<Calendar className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Show Weekends</div>
										<div className="text-xs text-gray-500">Include Saturday and Sunday in week view</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showWeekends}
									onChange={() => handleToggle('showWeekends')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<Users className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Group by Discipline</div>
										<div className="text-xs text-gray-500">Organize practitioners by their specialties</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.groupByDiscipline}
									onChange={() => handleToggle('groupByDiscipline')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<Grid3x3 className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Compact View</div>
										<div className="text-xs text-gray-500">Reduce spacing for more appointments</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.compactView}
									onChange={() => handleToggle('compactView')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<Eye className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Show Cancelled Appointments</div>
										<div className="text-xs text-gray-500">Display cancelled appointments on the calendar</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showCancelledAppointments}
									onChange={() => handleToggle('showCancelledAppointments')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div className="flex items-center">
									<Eye className="h-4 w-4 mr-3 text-gray-400" />
									<div>
										<div className="text-sm font-medium">Show Deleted Appointments</div>
										<div className="text-xs text-gray-500">Display deleted appointments on the calendar</div>
									</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showDeletedAppointments}
									onChange={() => handleToggle('showDeletedAppointments')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>
						</div>
					</div>

					{/* Zoom Settings */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
							<ZoomIn className="h-4 w-4 mr-2" />
							Zoom Level
						</h4>
						<div className="flex items-center space-x-2">
							{[80, 90, 100, 110, 120].map(zoom => (
								<button
									key={zoom}
									onClick={() => handleZoomChange(zoom)}
									className={`px-3 py-1.5 text-sm rounded transition-colors ${localSettings.zoomLevel === zoom
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
										}`}
								>
									{zoom}%
								</button>
							))}
						</div>
					</div>

					{/* Time Slot Settings */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
							<Clock className="h-4 w-4 mr-2" />
							Time Slot Height
						</h4>
						<div className="flex items-center space-x-2">
							{['small', 'medium', 'large'].map(height => (
								<button
									key={height}
									onClick={() => handleTimeSlotHeight(height)}
									className={`px-3 py-1.5 text-sm rounded capitalize transition-colors ${localSettings.timeSlotHeight === height
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
										}`}
								>
									{height}
								</button>
							))}
						</div>
					</div>

					{/* Appointment Display */}
					<div className="mb-6">
						<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
							<Palette className="h-4 w-4 mr-2" />
							Appointment Display
						</h4>
						<div className="space-y-3">
							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div>
									<div className="text-sm font-medium">Show Service Icons</div>
									<div className="text-xs text-gray-500">Display icons for different services</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showServiceIcons}
									onChange={() => handleToggle('showServiceIcons')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div>
									<div className="text-sm font-medium">Show Duration</div>
									<div className="text-xs text-gray-500">Display appointment duration on calendar</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showDuration}
									onChange={() => handleToggle('showDuration')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div>
									<div className="text-sm font-medium">Color by Service Type</div>
									<div className="text-xs text-gray-500">Use different colors for each service</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.colorByService}
									onChange={() => handleToggle('colorByService')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>

							<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
								<div>
									<div className="text-sm font-medium">Show Phone Numbers</div>
									<div className="text-xs text-gray-500">Display patient phone numbers</div>
								</div>
								<input
									type="checkbox"
									checked={localSettings.showPhoneNumbers}
									onChange={() => handleToggle('showPhoneNumbers')}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
							</label>
						</div>
					</div>

					{/* Auto Refresh */}
					<div className="mb-6">
						<label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
							<div>
								<div className="text-sm font-medium">Auto Refresh</div>
								<div className="text-xs text-gray-500">Automatically refresh calendar data</div>
							</div>
							<input
								type="checkbox"
								checked={localSettings.autoRefresh}
								onChange={() => handleToggle('autoRefresh')}
								className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
							/>
						</label>

						{localSettings.autoRefresh && (
							<div className="mt-3 ml-3">
								<label className="text-sm text-gray-700">Refresh every:</label>
								<select
									value={localSettings.refreshInterval}
									onChange={(e) => handleRefreshInterval(parseInt(e.target.value))}
									className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
								>
									<option value={1}>1 minute</option>
									<option value={5}>5 minutes</option>
									<option value={10}>10 minutes</option>
									<option value={15}>15 minutes</option>
									<option value={30}>30 minutes</option>
								</select>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="border-t p-4 flex justify-between">
					<button
						onClick={() => {
							// Reset to defaults
							const defaults: CalendarSettings = {
								showStaffPhotos: false,
								showWeekends: true,
								groupByDiscipline: false,
								zoomLevel: 100,
								showServiceIcons: true,
								showDuration: true,
								compactView: false,
								timeSlotHeight: 'medium',
								colorByService: true,
								showPhoneNumbers: false,
								autoRefresh: false,
								refreshInterval: 5,
								startHour: 8,
								endHour: 20,
								showCancelledAppointments: false,
								showDeletedAppointments: false
							}
							setLocalSettings(defaults)
							onUpdateSettings(defaults)
						}}
						className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
					>
						Reset to Defaults
					</button>
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
					>
						Done
					</button>
				</div>
			</div>
		</>
	)
}
