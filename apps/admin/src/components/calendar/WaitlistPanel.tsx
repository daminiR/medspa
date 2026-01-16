// src/components/calendar/WaitlistPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Clock, User, Phone, Calendar, AlertCircle, Sparkles, ChevronDown, ChevronRight, Search, Filter, Plus, Edit2, Trash2, Zap, Crown, Award, Medal } from 'lucide-react'
import moment from 'moment'
import AddWaitlistModal from '../waitlist/AddWaitlistModal'
import { WaitlistTier, WaitlistOfferStatus } from '@/lib/waitlist'
import { WaitlistPatient, mockWaitlistPatients } from '@/lib/data/waitlist'

interface WaitlistPanelProps {
	isOpen: boolean
	onClose: () => void
	practitioners: Array<{ id: string; name: string; initials: string }>
	onBookPatient: (patient: WaitlistPatient, practitionerId: string, startTime: Date) => void
	onDragStart?: () => void
	onDragEnd?: () => void
	onPatientBooked?: (patientId: string) => void
	onSendOffer?: (patient: WaitlistPatient) => void
}

export default function WaitlistPanel({ isOpen, onClose, practitioners, onBookPatient, onDragStart, onDragEnd, onPatientBooked, onSendOffer }: WaitlistPanelProps) {
	const [waitlistPatients, setWaitlistPatients] = useState<WaitlistPatient[]>(mockWaitlistPatients)
	const [searchTerm, setSearchTerm] = useState('')
	const [filterPractitioner, setFilterPractitioner] = useState<string>('all')
	const [filterPriority, setFilterPriority] = useState<string>('all')
	const [filterTier, setFilterTier] = useState<string>('all')
	const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null)
	const [draggedPatient, setDraggedPatient] = useState<WaitlistPatient | null>(null)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingPatient, setEditingPatient] = useState<WaitlistPatient | null>(null)
	
	// Listen for successful bookings and remove patient from waitlist
	useEffect(() => {
		if (onPatientBooked) {
			// This will be called when a patient is successfully booked
			const handlePatientBooked = (patientId: string) => {
				setWaitlistPatients(prev => prev.filter(p => p.id !== patientId))
			}
			// Store the handler so we can use it
			(window as any).removeFromWaitlist = handlePatientBooked
		}
	}, [onPatientBooked])

	// Filter patients based on search and filters
	const filteredPatients = waitlistPatients.filter(patient => {
		const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.phone.includes(searchTerm) ||
			patient.requestedService.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesPractitioner = filterPractitioner === 'all' || patient.practitionerId === filterPractitioner
		const matchesPriority = filterPriority === 'all' || patient.priority === filterPriority
		const matchesTier = filterTier === 'all' || patient.tier === filterTier

		return matchesSearch && matchesPractitioner && matchesPriority && matchesTier
	})

	// Tier counts for filter badges
	const tierCounts = {
		platinum: waitlistPatients.filter(p => p.tier === 'platinum').length,
		gold: waitlistPatients.filter(p => p.tier === 'gold').length,
		silver: waitlistPatients.filter(p => p.tier === 'silver').length
	}

	// Get tier icon
	const getTierIcon = (tier?: WaitlistTier) => {
		switch (tier) {
			case 'platinum': return <Crown className="h-3 w-3 text-purple-600" />
			case 'gold': return <Award className="h-3 w-3 text-yellow-500" />
			case 'silver': return <Medal className="h-3 w-3 text-gray-400" />
			default: return null
		}
	}

	// Get tier badge styling
	const getTierBadgeStyle = (tier?: WaitlistTier) => {
		switch (tier) {
			case 'platinum': return 'bg-purple-100 text-purple-700 border-purple-200'
			case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
			case 'silver': return 'bg-gray-100 text-gray-600 border-gray-200'
			default: return 'bg-gray-100 text-gray-600 border-gray-200'
		}
	}

	// Get offer status badge
	const getOfferStatusBadge = (status?: WaitlistOfferStatus) => {
		switch (status) {
			case 'pending':
				return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Pending</span>
			case 'accepted':
				return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Accepted</span>
			case 'declined':
				return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Declined</span>
			case 'expired':
				return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Expired</span>
			default:
				return null
		}
	}

	// Group by priority
	const groupedPatients = {
		high: filteredPatients.filter(p => p.priority === 'high'),
		medium: filteredPatients.filter(p => p.priority === 'medium'),
		low: filteredPatients.filter(p => p.priority === 'low')
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high': return 'text-red-600 bg-red-50 border-red-200'
			case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
			case 'low': return 'text-green-600 bg-green-50 border-green-200'
			default: return 'text-gray-600 bg-gray-50 border-gray-200'
		}
	}

	const getServiceIcon = (category: string) => {
		switch (category) {
			case 'injectables': return '💉'
			case 'facial': return '✨'
			case 'laser': return '⚡'
			case 'wellness': return '💚'
			default: return '📋'
		}
	}

	const formatWaitTime = (waitingSince: Date) => {
		const now = moment()
		const waitStart = moment(waitingSince)
		const duration = moment.duration(now.diff(waitStart))

		if (duration.asDays() >= 1) {
			return `${Math.floor(duration.asDays())}d ${duration.hours()}h`
		} else if (duration.asHours() >= 1) {
			return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`
		} else {
			return `${duration.minutes()}m`
		}
	}

	const handleDragStart = (e: React.DragEvent, patient: WaitlistPatient) => {
		setDraggedPatient(patient)
		e.dataTransfer.effectAllowed = 'copy'
		
		// Convert dates to ISO strings for proper serialization
		const patientForTransfer = {
			...patient,
			availabilityStart: patient.availabilityStart.toISOString(),
			availabilityEnd: patient.availabilityEnd.toISOString(),
			waitingSince: patient.waitingSince.toISOString()
		}
		
		// Use only text/plain to ensure compatibility
		const patientData = JSON.stringify({ type: 'waitlist-patient', data: patientForTransfer })
		e.dataTransfer.setData('text/plain', patientData)

		// Add visual feedback
		const dragImage = document.createElement('div')
		dragImage.className = 'bg-purple-600 text-white px-3 py-2 rounded shadow-lg'
		dragImage.innerHTML = `
			<div class="flex items-center space-x-2">
				<span>${getServiceIcon(patient.serviceCategory)}</span>
				<span>${patient.name}</span>
			</div>
			<div class="text-xs opacity-90">${patient.requestedService} • ${patient.serviceDuration}min</div>
		`
		dragImage.style.position = 'fixed'
		dragImage.style.top = '-100px'
		dragImage.style.left = '-100px'
		dragImage.style.pointerEvents = 'none'
		document.body.appendChild(dragImage)
		e.dataTransfer.setDragImage(dragImage, 0, 0)
		setTimeout(() => document.body.removeChild(dragImage), 0)
		
		// Notify parent that dragging started
		onDragStart?.()
	}

	const handleDragEnd = () => {
		setDraggedPatient(null)
		// Notify parent that dragging ended
		onDragEnd?.()
	}

	const handleQuickBook = (patient: WaitlistPatient) => {
		// Find next available slot for this patient
		const now = new Date()
		const practitioner = practitioners.find(p => p.id === patient.practitionerId) || practitioners[0]
		
		// Create a booking for the next available time (simplified for demo)
		const startTime = new Date(now)
		startTime.setHours(startTime.getHours() + 1, 0, 0, 0) // Next hour
		
		onBookPatient(patient, practitioner.id, startTime)
		setWaitlistPatients(prev => prev.filter(p => p.id !== patient.id))
		
		// Also trigger the onPatientBooked callback if provided
		if (onPatientBooked) {
			onPatientBooked(patient.id)
		}
	}

	const handleRemoveFromWaitlist = (patientId: string) => {
		if (confirm('Are you sure you want to remove this patient from the waitlist?')) {
			setWaitlistPatients(prev => prev.filter(p => p.id !== patientId))
		}
	}

	const handleEditPatient = (patient: WaitlistPatient) => {
		setEditingPatient(patient)
		setShowAddModal(true)
	}

	const handleSavePatient = (patientData: any) => {
		if (editingPatient) {
			// Update existing patient
			setWaitlistPatients(prev => prev.map(p => 
				p.id === editingPatient.id ? { ...p, ...patientData } : p
			))
		} else {
			// Add new patient
			setWaitlistPatients(prev => [...prev, patientData])
		}
		setEditingPatient(null)
		setShowAddModal(false)
	}

	if (!isOpen) return null

	return (
		<div className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-full max-w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'
			}`}>
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center space-x-2">
							<Clock className="h-6 w-6" />
							<h2 className="text-xl font-semibold">Waitlist</h2>
							<span className="bg-white/20 px-2 py-1 rounded-full text-sm">
								{waitlistPatients.length} patients
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => {
									setEditingPatient(null)
									setShowAddModal(true)
								}}
								className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm font-medium"
							>
								<Plus className="h-4 w-4" />
								<span>Add</span>
							</button>
							<button
								onClick={onClose}
								className="p-1 hover:bg-white/20 rounded transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-3 gap-3 text-sm">
						<div className="bg-white/10 rounded p-2 text-center">
							<div className="font-semibold">{groupedPatients.high.length}</div>
							<div className="text-xs opacity-90">High Priority</div>
						</div>
						<div className="bg-white/10 rounded p-2 text-center">
							<div className="font-semibold">{waitlistPatients.filter(p => p.hasCompletedForms).length}</div>
							<div className="text-xs opacity-90">Forms Ready</div>
						</div>
						<div className="bg-white/10 rounded p-2 text-center">
							<div className="font-semibold">${waitlistPatients.reduce((sum, p) => sum + (p.deposit || 0), 0)}</div>
							<div className="text-xs opacity-90">In Deposits</div>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="p-4 border-b bg-gray-50">
					<div className="flex items-center space-x-2 mb-3">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search patients or services..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						</div>
						<button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
							<Filter className="h-4 w-4" />
						</button>
					</div>

					<div className="flex flex-wrap gap-2">
						<select
							value={filterPractitioner}
							onChange={(e) => setFilterPractitioner(e.target.value)}
							className="text-sm border border-gray-300 rounded px-2 py-1"
						>
							<option value="all">All Practitioners</option>
							{practitioners.map(p => (
								<option key={p.id} value={p.id}>{p.name}</option>
							))}
						</select>
						<select
							value={filterPriority}
							onChange={(e) => setFilterPriority(e.target.value)}
							className="text-sm border border-gray-300 rounded px-2 py-1"
						>
							<option value="all">All Priorities</option>
							<option value="high">High Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="low">Low Priority</option>
						</select>
					</div>

					{/* Tier Filter with Count Badges */}
					<div className="flex flex-wrap gap-2 mt-2">
						<button
							onClick={() => setFilterTier('all')}
							className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
								filterTier === 'all'
									? 'bg-purple-600 text-white'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
							}`}
						>
							All ({waitlistPatients.length})
						</button>
						<button
							onClick={() => setFilterTier('platinum')}
							className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${
								filterTier === 'platinum'
									? 'bg-purple-600 text-white'
									: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
							}`}
						>
							<Crown className="h-3 w-3" />
							Platinum ({tierCounts.platinum})
						</button>
						<button
							onClick={() => setFilterTier('gold')}
							className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${
								filterTier === 'gold'
									? 'bg-purple-600 text-white'
									: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
							}`}
						>
							<Award className="h-3 w-3" />
							Gold ({tierCounts.gold})
						</button>
						<button
							onClick={() => setFilterTier('silver')}
							className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${
								filterTier === 'silver'
									? 'bg-purple-600 text-white'
									: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
							}`}
						>
							<Medal className="h-3 w-3" />
							Silver ({tierCounts.silver})
						</button>
					</div>
				</div>

				{/* Instructions */}
				<div className="px-4 py-2 bg-purple-50 text-purple-700 text-sm flex items-center">
					<Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
					<span>Drag patients to calendar slots or use quick book for next available</span>
				</div>

				{/* Patient List */}
				<div className="flex-1 overflow-y-auto p-4">
					{['high', 'medium', 'low'].map(priority => {
						const patients = groupedPatients[priority as keyof typeof groupedPatients]
						if (patients.length === 0) return null

						return (
							<div key={priority} className="mb-6">
								<h3 className="text-sm font-medium text-gray-700 mb-2 capitalize flex items-center">
									<span className={`w-2 h-2 rounded-full mr-2 ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
										}`} />
									{priority} Priority ({patients.length})
								</h3>

								<div className="space-y-2">
									{patients.map(patient => {
										const isExpanded = expandedPatientId === patient.id
										const practitioner = practitioners.find(p => p.id === patient.practitionerId)

										return (
											<div
												key={patient.id}
												draggable
												onDragStart={(e) => handleDragStart(e, patient)}
												onDragEnd={handleDragEnd}
												className={`border rounded-lg p-3 cursor-move hover:shadow-md transition-all transform hover:scale-[1.02] ${getPriorityColor(patient.priority)
													} ${draggedPatient?.id === patient.id ? 'opacity-50 scale-95' : ''} ${patient.pendingOffer ? 'ring-2 ring-purple-400' : ''}`}
												title="Drag to calendar to book appointment"
											>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														{/* Patient Header */}
														<div className="flex items-center flex-wrap gap-2 mb-1">
															<span className="text-lg">{getServiceIcon(patient.serviceCategory)}</span>
															<h4 className="font-medium text-gray-900">{patient.name}</h4>
															{/* Tier Badge */}
															{patient.tier && (
																<span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${getTierBadgeStyle(patient.tier)}`}>
																	{getTierIcon(patient.tier)}
																	{patient.tier.charAt(0).toUpperCase() + patient.tier.slice(1)}
																</span>
															)}
															{/* Offer Status Badge */}
															{patient.offerStatus && getOfferStatusBadge(patient.offerStatus)}
															{/* Pending Offer Pulse Indicator */}
															{patient.pendingOffer && (
																<span className="animate-pulse inline-flex h-3 w-3 rounded-full bg-purple-400" title="Pending offer" />
															)}
															{patient.hasCompletedForms && (
																<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
																	Forms ✓
																</span>
															)}
															{patient.deposit && (
																<span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
																	${patient.deposit} paid
																</span>
															)}
														</div>

														{/* Service Info */}
														<div className="text-sm text-gray-600 mb-1">
															<span className="font-medium">{patient.requestedService}</span>
															<span className="text-gray-400 mx-1">•</span>
															<span>{patient.serviceDuration} min</span>
															{practitioner && (
																<>
																	<span className="text-gray-400 mx-1">•</span>
																	<span>Prefers {practitioner.name}</span>
																</>
															)}
														</div>

														{/* Availability */}
														<div className="flex items-center text-xs text-gray-500">
															<Clock className="h-3 w-3 mr-1" />
															Available {moment(patient.availabilityStart).format('h:mm A')} - {moment(patient.availabilityEnd).format('h:mm A')}
															<span className="text-gray-400 mx-2">|</span>
															Waiting {formatWaitTime(patient.waitingSince)}
														</div>

														{/* Last Offer Timestamp */}
														{patient.lastOfferAt && (
															<div className="text-xs text-gray-400 mt-1">
																Last offer: {moment(patient.lastOfferAt).fromNow()}
																{patient.offerCount && patient.offerCount > 0 && (
																	<span className="ml-2">({patient.offerCount} offer{patient.offerCount > 1 ? 's' : ''} sent)</span>
																)}
															</div>
														)}

														{/* Expandable Details */}
														{isExpanded && (
															<div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
																<div className="flex items-center text-sm">
																	<Phone className="h-3 w-3 mr-2 text-gray-400" />
																	<span>{patient.phone}</span>
																</div>
																{patient.notes && (
																	<div className="text-sm text-gray-600 bg-white/50 rounded p-2">
																		<span className="font-medium">Notes:</span> {patient.notes}
																	</div>
																)}
															</div>
														)}
													</div>

													{/* Actions */}
													<div className="flex flex-col items-end space-y-1 ml-3">
														<button
															onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
															className="p-1 hover:bg-white/50 rounded transition-colors"
															title={isExpanded ? "Collapse" : "Expand"}
														>
															{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
														</button>
														<div className="flex space-x-1">
															{/* Send SMS Offer Button */}
															<button
																onClick={() => onSendOffer?.(patient)}
																className="p-1.5 rounded-md hover:bg-purple-100 text-purple-600 transition-colors"
																title="Send SMS Offer"
															>
																<Zap className="h-4 w-4" />
															</button>
															<button
																onClick={() => handleEditPatient(patient)}
																className="p-1 hover:bg-white/50 rounded transition-colors text-gray-600 hover:text-gray-800"
																title="Edit"
															>
																<Edit2 className="h-3 w-3" />
															</button>
															<button
																onClick={() => handleRemoveFromWaitlist(patient.id)}
																className="p-1 hover:bg-white/50 rounded transition-colors text-gray-600 hover:text-red-600"
																title="Remove"
															>
																<Trash2 className="h-3 w-3" />
															</button>
														</div>
														<button
															onClick={() => handleQuickBook(patient)}
															className="text-xs bg-white/70 hover:bg-white text-purple-700 px-2 py-1 rounded font-medium transition-colors"
															title="Book next available slot"
														>
															Book
														</button>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)
					})}

					{filteredPatients.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							<Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
							<p>No patients match your filters</p>
						</div>
					)}
				</div>
			</div>

			{/* Add/Edit Waitlist Modal */}
			<AddWaitlistModal
				isOpen={showAddModal}
				onClose={() => {
					setShowAddModal(false)
					setEditingPatient(null)
				}}
				practitioners={practitioners}
				onSave={handleSavePatient}
				editingPatient={editingPatient}
			/>
		</div>
	)
}
