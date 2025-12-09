// src/components/layout/Sidebar.tsx
'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, MapPin, Plus, Syringe, Sparkles, Heart, Zap, Stethoscope, Users, User, Search, Calendar, X } from 'lucide-react'
import { practitioners, getServicesForPractitioner, type Service } from '@/lib/data'

interface SidebarProps {
	isOpen?: boolean
	selectedPractitionerIds?: string[]
	onPractitionerClick?: (practitionerId: string) => void
	onAddPractitioner?: (practitionerId: string) => void
	onRemovePractitioner?: (practitionerId: string) => void
	onViewProfile?: (practitionerId: string) => void
	onServiceSelect?: (practitionerId: string, service: Service) => void
	onClearSlotFinder?: () => void
}

// Med spa specialization categories with icons
const specializationCategories = [
	{
		id: 'all',
		name: 'All Specialties',
		icon: Users,
		specializations: []
	},
	{
		id: 'injectables',
		name: 'Injectables',
		icon: Syringe,
		specializations: ['Botox', 'Dermal Fillers', 'Lip Enhancement', 'Facial Contouring', 'PDO Threads']
	},
	{
		id: 'skin-treatments',
		name: 'Skin Treatments',
		icon: Sparkles,
		specializations: ['Chemical Peels', 'Microneedling', 'HydraFacial', 'LED Therapy', 'Acne Treatment', 'Rosacea']
	},
	{
		id: 'laser',
		name: 'Laser Services',
		icon: Zap,
		specializations: ['Laser Hair Removal', 'IPL Photofacial', 'Skin Tightening', 'Tattoo Removal', 'Laser Resurfacing']
	},
	{
		id: 'wellness',
		name: 'Wellness',
		icon: Heart,
		specializations: ['IV Therapy', 'Vitamin Injections', 'Weight Management', 'Deep Tissue Massage', 'Relaxation Therapy', 'Hot Stone Massage']
	},
	{
		id: 'medical',
		name: 'Medical Services',
		icon: Stethoscope,
		specializations: ['Medical Dermatology', 'Skin Cancer Screening', 'Surgical Consultations', 'Scar Revision', 'Body Contouring']
	}
]

export default function Sidebar({
	isOpen = true,
	selectedPractitionerIds = [],
	onPractitionerClick,
	onAddPractitioner,
	onRemovePractitioner,
	onViewProfile,
	onServiceSelect,
	onClearSlotFinder
}: SidebarProps) {
	const [locationOpen, setLocationOpen] = useState(true)
	const [selectedLocation, setSelectedLocation] = useState('the-village')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [categoriesOpen, setCategoriesOpen] = useState(true)
	const [hoveredPractitioner, setHoveredPractitioner] = useState<string | null>(null)

	// Slot finder state
	const [expandedPractitioner, setExpandedPractitioner] = useState<string | null>(null)
	const [selectedService, setSelectedService] = useState<{ practitionerId: string; service: Service } | null>(null)
	const serviceListRef = useRef<HTMLDivElement>(null)

	// Filter practitioners based on selected category
	const filteredPractitioners = useMemo(() => {
		if (!practitioners || practitioners.length === 0) return []
		
		if (selectedCategory === 'all') {
			return practitioners
		}

		const category = specializationCategories.find(cat => cat.id === selectedCategory)
		if (!category) return practitioners

		return practitioners.filter(practitioner =>
			practitioner?.specializations?.some(spec =>
				category.specializations.includes(spec)
			)
		)
	}, [selectedCategory])

	// Group practitioners by discipline
	const practitionersByDiscipline = useMemo(() => {
		if (!filteredPractitioners || filteredPractitioners.length === 0) return {}
		
		const grouped = filteredPractitioners.reduce((acc, practitioner) => {
			if (!practitioner?.discipline) return acc
			
			const discipline = practitioner.discipline
			if (!acc[discipline]) {
				acc[discipline] = []
			}
			acc[discipline].push(practitioner)
			return acc
		}, {} as Record<string, typeof practitioners>)

		return grouped
	}, [filteredPractitioners])

	// Handle clicking slot finder icon
	const handleSlotFinderClick = (e: React.MouseEvent, practitionerId: string) => {
		e.stopPropagation()

		if (expandedPractitioner === practitionerId) {
			// Close if already open
			setExpandedPractitioner(null)
			setSelectedService(null)
			onClearSlotFinder?.()
		} else {
			// Open new practitioner's services
			setExpandedPractitioner(practitionerId)
			setSelectedService(null)
			onClearSlotFinder?.()
		}
	}

	// Handle service selection
	const handleServiceClick = (practitionerId: string, service: Service) => {
		const newSelection = { practitionerId, service }
		setSelectedService(newSelection)
		onServiceSelect?.(practitionerId, service)
	}

	// Close services when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (serviceListRef.current && !serviceListRef.current.contains(event.target as Node)) {
				// Don't close if clicking on the calendar (let them click on slots)
				const isCalendarClick = (event.target as HTMLElement).closest('.calendar-grid')
				if (!isCalendarClick) {
					setExpandedPractitioner(null)
					setSelectedService(null)
					onClearSlotFinder?.()
				}
			}
		}

		if (expandedPractitioner) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [expandedPractitioner, onClearSlotFinder])

	if (!isOpen) return (
		<div className="w-16 bg-white h-full flex flex-col items-center py-4">
			<div className="space-y-4">
				{(practitioners || []).filter(p => p?.status === 'active').slice(0, 5).map(practitioner => (
					<div
						key={`collapsed-${practitioner.id}`}
						className="relative"
						title={practitioner?.name || 'Unknown'}
					>
						<div
							className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer transition-all hover:scale-110 ${selectedPractitionerIds.includes(practitioner?.id)
								? 'bg-purple-600 ring-2 ring-purple-200'
								: 'bg-gray-400'
								}`}
							onClick={() => onPractitionerClick?.(practitioner?.id)}
						>
							{practitioner?.initials || '?'}
						</div>
					</div>
				))}
			</div>
		</div>
	)

	return (
		<aside className="w-96 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)] sticky top-16">
			{/* Location Selector */}
			<div className="p-4 border-b">
				<button
					onClick={() => setLocationOpen(!locationOpen)}
					className="w-full flex items-center justify-between text-sm font-medium text-gray-900"
				>
					<div className="flex items-center">
						<MapPin className="h-4 w-4 mr-2 text-gray-400" />
						Location
					</div>
					<ChevronDown className={`h-4 w-4 transition-transform ${locationOpen ? '' : '-rotate-90'}`} />
				</button>
				{locationOpen && (
					<select
						className="mt-2 w-full border border-gray-300 rounded-md text-sm p-2"
						value={selectedLocation}
						onChange={(e) => setSelectedLocation(e.target.value)}
					>
						<option value="the-village">The Village</option>
						<option value="downtown">Downtown Location</option>
						<option value="westside">West Side Clinic</option>
					</select>
				)}
			</div>

			{/* Specialties Filter */}
			<div className="p-4 border-b">
				<button
					onClick={() => setCategoriesOpen(!categoriesOpen)}
					className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3"
				>
					<div className="flex items-center">
						<Sparkles className="h-4 w-4 mr-2 text-gray-400" />
						Specialties
					</div>
					<ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? '' : '-rotate-90'}`} />
				</button>

				{categoriesOpen && (
					<div className="space-y-1">
						{specializationCategories.map((category) => {
							const Icon = category.icon
							const count = category.id === 'all'
								? (practitioners?.length || 0)
								: (practitioners?.filter(p =>
									p?.specializations?.some(spec =>
										category.specializations.includes(spec)
									)
								)?.length || 0)

							return (
								<button
									key={`category-${category.id}`}
									onClick={() => setSelectedCategory(category.id)}
									className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${selectedCategory === category.id
										? 'bg-purple-50 text-purple-700'
										: 'hover:bg-gray-50 text-gray-700'
										}`}
								>
									<div className="flex items-center">
										<Icon className="h-4 w-4 mr-2" />
										<span>{category.name}</span>
									</div>
									<span className="text-xs text-gray-500">{count}</span>
								</button>
							)
						})}
					</div>
				)}
			</div>

			{/* Practitioners List */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-4">
					<h3 className="text-sm font-medium text-gray-900 mb-3">
						{selectedCategory === 'all' ? 'All Practitioners' :
							`${specializationCategories.find(c => c.id === selectedCategory)?.name} Specialists`}
					</h3>

					{Object.entries(practitionersByDiscipline).map(([discipline, disciplinePractitioners]) => (
						<div key={`discipline-${discipline}`} className="mb-4">
							<h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
								{discipline}
							</h4>
							<div className="space-y-2">
								{(disciplinePractitioners || []).map((practitioner) => {
									if (!practitioner) return null
									
									const isSelected = selectedPractitionerIds.includes(practitioner.id)
									const isHovered = hoveredPractitioner === practitioner.id
									const isExpanded = expandedPractitioner === practitioner.id
									const services = getServicesForPractitioner(practitioner.id) || []

									return (
										<div
											key={`practitioner-${practitioner.id}`}
											className="relative"
											ref={isExpanded ? serviceListRef : undefined}
										>
											<div
												className="relative group"
												onMouseEnter={() => setHoveredPractitioner(practitioner.id)}
												onMouseLeave={() => setHoveredPractitioner(null)}
											>
												<div
													className={`flex items-center p-2 rounded-md cursor-pointer transition-colors relative ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
														}`}
													onClick={() => onPractitionerClick?.(practitioner.id)}
												>
													<div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium relative ${practitioner?.status === 'active' ? 'bg-purple-600' :
														practitioner?.status === 'on_leave' ? 'bg-yellow-500' : 'bg-gray-400'
														}`}>
														{practitioner?.initials || '?'}
														{isSelected && (
															<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
														)}
													</div>
													<div className="ml-3 flex-1">
														<p className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
															{practitioner?.name || 'Unknown'}
														</p>
														<p className="text-xs text-gray-500 truncate">
															{practitioner?.specializations?.slice(0, 2).join(', ') || 'No specializations'}
															{practitioner?.specializations && practitioner.specializations.length > 2 && '...'}
														</p>
													</div>

													{/* Always show icons for active practitioners */}
													{practitioner?.status === 'active' ? (
														<div className="flex items-center space-x-1 mr-2">
															<button
																onClick={(e) => handleSlotFinderClick(e, practitioner.id)}
																className={`p-1.5 rounded transition-all ${isExpanded ? 'bg-purple-100' : isHovered ? 'bg-gray-100' : 'hover:bg-gray-100'
																	}`}
																title="Find available slots"
															>
																<Search className={`h-4 w-4 transition-colors ${isExpanded ? 'text-purple-600' : isHovered ? 'text-purple-600' : 'text-gray-400'
																	}`} />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	onViewProfile?.(practitioner.id)
																}}
																className={`p-1.5 rounded transition-all ${isHovered ? 'bg-gray-100' : 'hover:bg-gray-100'
																	}`}
																title="View Profile"
															>
																<User className={`h-4 w-4 transition-colors ${isHovered ? 'text-purple-600' : 'text-gray-400'
																	}`} />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation()
																	if (isSelected) {
																		onRemovePractitioner?.(practitioner.id)
																	} else {
																		onAddPractitioner?.(practitioner.id)
																	}
																}}
																className={`p-1.5 rounded transition-all ${isHovered ? 'bg-gray-100' : 'hover:bg-gray-100'
																	}`}
																title={isSelected ? 'Remove from calendar' : 'Add to calendar'}
															>
																<Plus className={`h-4 w-4 transition-all ${isSelected
																	? 'rotate-45 text-red-500 hover:text-red-600'
																	: 'text-green-500 hover:text-green-600'
																	} ${!isHovered && 'opacity-60'}`} />
															</button>
														</div>
													) : (
														<span className="text-xs text-gray-400 mr-2">
															{practitioner?.status === 'on_leave' ? 'Leave' : 'Off'}
														</span>
													)}
												</div>
											</div>

											{/* Expanded Services List */}
											{isExpanded && (
												<div className="mt-2 ml-12 mr-2 p-3 bg-gray-50 rounded-md border border-gray-200">
													<div className="flex items-center justify-between mb-2">
														<h5 className="text-xs font-medium text-gray-700">Available Services</h5>
														<button
															onClick={() => {
																setExpandedPractitioner(null)
																setSelectedService(null)
																onClearSlotFinder?.()
															}}
															className="p-0.5 hover:bg-gray-200 rounded"
														>
															<X className="h-3 w-3 text-gray-400" />
														</button>
													</div>
													{selectedService?.practitionerId === practitioner.id && (
														<div className="mb-2 p-2 bg-purple-100 rounded text-xs text-purple-700">
															<div className="font-medium">{selectedService.service.name}</div>
															<div className="text-purple-600">Finding {selectedService.service.duration} min slots...</div>
														</div>
													)}
													<div className="space-y-1 max-h-48 overflow-y-auto">
														{(services || []).map((service) => (
															<button
																key={`service-${practitioner.id}-${service.id}`}
																onClick={() => handleServiceClick(practitioner.id, service)}
																className={`w-full text-left p-2 rounded text-xs transition-colors ${selectedService?.practitionerId === practitioner.id &&
																	selectedService?.service.id === service.id
																	? 'bg-purple-200 text-purple-900'
																	: 'hover:bg-gray-100'
																	}`}
															>
																<div className="flex items-center justify-between">
																	<div className="flex-1">
																		<div className="font-medium">{service.name}</div>
																		<div className="flex items-center gap-2">
																			<span className="text-gray-500">{service.duration} min</span>
																			{service.tags && service.tags.length > 0 && (
																				<div className="flex items-center" title={`Requires: ${service.tags.join(', ')}`}>
																					<svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
																					</svg>
																					<span className="text-[10px] text-amber-600 ml-0.5">{service.tags.length}</span>
																				</div>
																			)}
																		</div>
																	</div>
																	<div className="font-medium">${service.price}</div>
																</div>
															</button>
														))}
													</div>
												</div>
											)}
										</div>
									)
								})}
							</div>
						</div>
					))}

					{filteredPractitioners.length === 0 && (
						<p className="text-sm text-gray-500 text-center py-4">
							No practitioners found for selected specialty
						</p>
					)}
				</div>
			</div>
		</aside>
	)
}
