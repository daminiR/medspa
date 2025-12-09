// src/components/appointments/AppointmentModal.tsx
'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, Phone, Mail, FileText, AlertCircle, ChevronRight, ChevronLeft, Check, CreditCard, Heart, Pill, ShieldCheck } from 'lucide-react'
import moment from 'moment'

interface AppointmentModalProps {
	isOpen: boolean
	onClose: () => void
	practitioner: {
		id: string
		name: string
		initials: string
	}
	selectedDate: Date
	startTime: {
		hour: number
		minute: number
	}
	duration: number
	onSave: (appointmentData: any) => void
	getShiftForDate: (practitionerId: string, date: Date) => {
		startHour: number
		startMinute: number
		endHour: number
		endMinute: number
	} | null
}

// Services with medical spa specific details
const services = [
	{
		id: '1',
		name: 'Botox Treatment',
		duration: 30,
		price: 350,
		color: '#8B5CF6',
		category: 'injectables',
		description: 'Neuromodulator for fine lines and wrinkles',
		deposit: 100
	},
	{
		id: '2',
		name: 'Lip Filler',
		duration: 45,
		price: 650,
		color: '#EC4899',
		category: 'injectables',
		description: 'Hyaluronic acid dermal filler for lip enhancement',
		deposit: 150
	},
	{
		id: '3',
		name: 'Chemical Peel',
		duration: 60,
		price: 200,
		color: '#F59E0B',
		category: 'facial',
		description: 'Medical-grade chemical exfoliation',
		deposit: 50
	},
	{
		id: '4',
		name: 'Laser Hair Removal',
		duration: 30,
		price: 150,
		color: '#10B981',
		category: 'laser',
		description: 'Permanent hair reduction treatment',
		deposit: 50
	},
	{
		id: '5',
		name: 'IPL Photo Facial',
		duration: 45,
		price: 300,
		color: '#3B82F6',
		category: 'laser',
		description: 'Intense pulsed light for pigmentation',
		deposit: 75
	},
]

// Existing patients in the system
const existingPatients = [
	{
		id: '1',
		name: 'Sarah Johnson',
		phone: '(555) 123-4567',
		email: 'sarah.johnson@example.com',
		dob: '1985-03-15',
		lastVisit: '2023-07-10',
		hasCompletedForms: true
	},
	{
		id: '2',
		name: 'Emma Wilson',
		phone: '(555) 234-5678',
		email: 'emma.wilson@example.com',
		dob: '1990-08-22',
		lastVisit: '2023-06-25',
		hasCompletedForms: true
	},
]

export default function AppointmentModal({
	isOpen,
	onClose,
	practitioner,
	selectedDate,
	startTime,
	duration,
	onSave,
	getShiftForDate
}: AppointmentModalProps) {
	// Multi-step form state
	const [currentStep, setCurrentStep] = useState(1)
	const totalSteps = 4

	// Patient selection state
	const [patientType, setPatientType] = useState<'existing' | 'new'>('existing')
	const [selectedPatient, setSelectedPatient] = useState<typeof existingPatients[0] | null>(null)
	const [patientSearch, setPatientSearch] = useState('')

	// New patient form state
	const [newPatientData, setNewPatientData] = useState({
		firstName: '',
		lastName: '',
		dob: '',
		phone: '',
		email: '',
		emergencyContact: '',
		emergencyPhone: '',
		howHeard: ''
	})

	// Medical history state
	const [medicalHistory, setMedicalHistory] = useState({
		pregnant: false,
		breastfeeding: false,
		allergies: [] as string[],
		medications: [] as string[],
		conditions: [] as string[],
		previousTreatments: [] as string[],
		hasHadFillers: false,
		hasHadBotox: false,
		lastBotoxDate: '',
		lastFillerDate: ''
	})

	// Service and consent state
	const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)
	const [consents, setConsents] = useState({
		treatmentConsent: false,
		photoConsent: false,
		communicationConsent: false,
		cancellationPolicy: false
	})

	// Payment state
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'financing'>('card')
	const [depositPaid, setDepositPaid] = useState(false)
	const [notes, setNotes] = useState('')

	// Common medical conditions for checkboxes
	const commonConditions = [
		'Diabetes',
		'High Blood Pressure',
		'Heart Disease',
		'Autoimmune Disorder',
		'Bleeding Disorder',
		'Keloid Scarring',
		'Active Acne',
		'Rosacea',
		'Eczema',
		'Cold Sores'
	]

	const commonAllergies = [
		'Lidocaine',
		'Latex',
		'Antibiotics',
		'Aspirin',
		'Shellfish',
		'Iodine'
	]

	// Filter patients based on search
	const filteredPatients = existingPatients.filter(patient =>
		patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
		patient.phone.includes(patientSearch) ||
		patient.email.toLowerCase().includes(patientSearch.toLowerCase())
	)

	// Calculate end time
	const endTime = new Date(selectedDate)
	endTime.setHours(startTime.hour, startTime.minute, 0, 0)
	endTime.setMinutes(endTime.getMinutes() + (selectedService?.duration || duration))

	const formatTime = (date: Date) => moment(date).format('h:mm A')

	// Age calculation for verification
	const calculateAge = (dob: string) => {
		return moment().diff(moment(dob), 'years')
	}

	// Validation functions
	const validateStep = (step: number) => {
		switch (step) {
			case 1:
				if (patientType === 'existing') {
					return selectedPatient !== null
				} else {
					return newPatientData.firstName && newPatientData.lastName &&
						newPatientData.dob && newPatientData.phone && newPatientData.email
				}
			case 2:
				return selectedService !== null
			case 3:
				// Check for contraindications
				const age = patientType === 'existing' && selectedPatient
					? calculateAge(selectedPatient.dob)
					: calculateAge(newPatientData.dob)

				if (selectedService?.category === 'injectables' && age < 22) {
					alert('Patient must be at least 22 years old for dermal fillers per FDA guidelines')
					return false
				}

				if (medicalHistory.pregnant || medicalHistory.breastfeeding) {
					alert('Treatment cannot be performed on pregnant or breastfeeding patients')
					return false
				}

				return Object.values(consents).every(consent => consent === true)
			case 4:
				return depositPaid
			default:
				return true
		}
	}

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		setCurrentStep(currentStep - 1)
	}

	const handleSave = () => {
		const patient = patientType === 'existing'
			? selectedPatient
			: {
				name: `${newPatientData.firstName} ${newPatientData.lastName}`,
				...newPatientData
			}

		onSave({
			patient,
			service: selectedService,
			practitioner,
			startTime,
			medicalHistory,
			consents,
			paymentMethod,
			depositAmount: selectedService?.deposit || 0,
			notes
		})
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold">Patient Information</h3>

						{/* Patient Type Selection */}
						<div className="flex space-x-4">
							<button
								onClick={() => setPatientType('existing')}
								className={`flex-1 p-3 rounded-lg border-2 transition-all ${patientType === 'existing'
									? 'border-purple-600 bg-purple-50'
									: 'border-gray-200'
									}`}
							>
								<div className="font-medium">Existing Patient</div>
								<div className="text-sm text-gray-500">Select from database</div>
							</button>
							<button
								onClick={() => setPatientType('new')}
								className={`flex-1 p-3 rounded-lg border-2 transition-all ${patientType === 'new'
									? 'border-purple-600 bg-purple-50'
									: 'border-gray-200'
									}`}
							>
								<div className="font-medium">New Patient</div>
								<div className="text-sm text-gray-500">Create new profile</div>
							</button>
						</div>

						{patientType === 'existing' ? (
							<div className="space-y-3">
								<input
									type="text"
									placeholder="Search patients..."
									value={patientSearch}
									onChange={(e) => setPatientSearch(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>

								<div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
									{filteredPatients.map(patient => (
										<button
											key={patient.id}
											onClick={() => setSelectedPatient(patient)}
											className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${selectedPatient?.id === patient.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
												}`}
										>
											<div className="flex justify-between items-start">
												<div>
													<div className="font-medium">{patient.name}</div>
													<div className="text-sm text-gray-500">
														{patient.phone} • DOB: {moment(patient.dob).format('MM/DD/YYYY')}
													</div>
													<div className="text-sm text-gray-500">{patient.email}</div>
												</div>
												{patient.hasCompletedForms && (
													<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
														Forms on file
													</span>
												)}
											</div>
										</button>
									))}
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<input
										type="text"
										placeholder="First Name *"
										value={newPatientData.firstName}
										onChange={(e) => setNewPatientData({ ...newPatientData, firstName: e.target.value })}
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
									<input
										type="text"
										placeholder="Last Name *"
										value={newPatientData.lastName}
										onChange={(e) => setNewPatientData({ ...newPatientData, lastName: e.target.value })}
										className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>

								<input
									type="date"
									placeholder="Date of Birth *"
									value={newPatientData.dob}
									onChange={(e) => setNewPatientData({ ...newPatientData, dob: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>

								<input
									type="tel"
									placeholder="Phone Number *"
									value={newPatientData.phone}
									onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>

								<input
									type="email"
									placeholder="Email Address *"
									value={newPatientData.email}
									onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>

								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-700">Emergency Contact</label>
									<input
										type="text"
										placeholder="Emergency Contact Name"
										value={newPatientData.emergencyContact}
										onChange={(e) => setNewPatientData({ ...newPatientData, emergencyContact: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
									<input
										type="tel"
										placeholder="Emergency Contact Phone"
										value={newPatientData.emergencyPhone}
										onChange={(e) => setNewPatientData({ ...newPatientData, emergencyPhone: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>

								<select
									value={newPatientData.howHeard}
									onChange={(e) => setNewPatientData({ ...newPatientData, howHeard: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option value="">How did you hear about us?</option>
									<option value="google">Google Search</option>
									<option value="instagram">Instagram</option>
									<option value="referral">Friend/Family Referral</option>
									<option value="walkby">Walked By</option>
									<option value="other">Other</option>
								</select>
							</div>
						)}
					</div>
				)

			case 2:
				return (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold">Select Treatment</h3>

						<div className="space-y-3">
							{services.map(service => (
								<button
									key={service.id}
									onClick={() => setSelectedService(service)}
									className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedService?.id === service.id
										? 'border-purple-600 bg-purple-50'
										: 'border-gray-200 hover:border-gray-300'
										}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<div
													className="w-4 h-4 rounded"
													style={{ backgroundColor: service.color }}
												/>
												<span className="font-medium">{service.name}</span>
												<span className="text-xs bg-gray-100 px-2 py-1 rounded">
													{service.category}
												</span>
											</div>
											<p className="text-sm text-gray-600 mt-1">{service.description}</p>
											<div className="flex items-center space-x-4 mt-2 text-sm">
												<span className="flex items-center">
													<Clock className="h-4 w-4 mr-1 text-gray-400" />
													{service.duration} min
												</span>
												<span className="font-medium">${service.price}</span>
												<span className="text-gray-500">
													Deposit: ${service.deposit}
												</span>
											</div>
										</div>
									</div>
								</button>
							))}
						</div>

						{selectedService && (
							<div className="bg-blue-50 rounded-lg p-4">
								<div className="flex items-center text-sm text-blue-800">
									<Clock className="h-4 w-4 mr-2" />
									<span>
										{formatTime(new Date(new Date(selectedDate).setHours(startTime.hour, startTime.minute)))} - {formatTime(endTime)}
										{' '}({selectedService.duration} minutes)
									</span>
								</div>
							</div>
						)}
					</div>
				)

			case 3:
				return (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold">Medical History & Consent</h3>

						{/* Critical Questions */}
						<div className="bg-red-50 rounded-lg p-4 space-y-3">
							<h4 className="font-medium text-red-900 flex items-center">
								<AlertCircle className="h-5 w-5 mr-2" />
								Important Health Questions
							</h4>
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={medicalHistory.pregnant}
									onChange={(e) => setMedicalHistory({ ...medicalHistory, pregnant: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
								<span className="text-sm">Are you currently pregnant?</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={medicalHistory.breastfeeding}
									onChange={(e) => setMedicalHistory({ ...medicalHistory, breastfeeding: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
								/>
								<span className="text-sm">Are you currently breastfeeding?</span>
							</label>
						</div>

						{/* Medical Conditions */}
						<div>
							<h4 className="font-medium mb-3">Do you have any of these conditions?</h4>
							<div className="grid grid-cols-2 gap-2">
								{commonConditions.map(condition => (
									<label key={condition} className="flex items-center space-x-2">
										<input
											type="checkbox"
											checked={medicalHistory.conditions.includes(condition)}
											onChange={(e) => {
												if (e.target.checked) {
													setMedicalHistory({
														...medicalHistory,
														conditions: [...medicalHistory.conditions, condition]
													})
												} else {
													setMedicalHistory({
														...medicalHistory,
														conditions: medicalHistory.conditions.filter(c => c !== condition)
													})
												}
											}}
											className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
										/>
										<span className="text-sm">{condition}</span>
									</label>
								))}
							</div>
						</div>

						{/* Allergies */}
						<div>
							<h4 className="font-medium mb-3">Any allergies to:</h4>
							<div className="grid grid-cols-2 gap-2">
								{commonAllergies.map(allergy => (
									<label key={allergy} className="flex items-center space-x-2">
										<input
											type="checkbox"
											checked={medicalHistory.allergies.includes(allergy)}
											onChange={(e) => {
												if (e.target.checked) {
													setMedicalHistory({
														...medicalHistory,
														allergies: [...medicalHistory.allergies, allergy]
													})
												} else {
													setMedicalHistory({
														...medicalHistory,
														allergies: medicalHistory.allergies.filter(a => a !== allergy)
													})
												}
											}}
											className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
										/>
										<span className="text-sm">{allergy}</span>
									</label>
								))}
							</div>
						</div>

						{/* Previous Treatments */}
						{selectedService?.category === 'injectables' && (
							<div className="space-y-3">
								<h4 className="font-medium">Previous Injectable Treatments</h4>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={medicalHistory.hasHadBotox}
										onChange={(e) => setMedicalHistory({ ...medicalHistory, hasHadBotox: e.target.checked })}
										className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
									/>
									<span className="text-sm">Have you had Botox before?</span>
								</label>
								{medicalHistory.hasHadBotox && (
									<input
										type="date"
										placeholder="Last Botox treatment date"
										value={medicalHistory.lastBotoxDate}
										onChange={(e) => setMedicalHistory({ ...medicalHistory, lastBotoxDate: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								)}
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={medicalHistory.hasHadFillers}
										onChange={(e) => setMedicalHistory({ ...medicalHistory, hasHadFillers: e.target.checked })}
										className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
									/>
									<span className="text-sm">Have you had dermal fillers before?</span>
								</label>
								{medicalHistory.hasHadFillers && (
									<input
										type="date"
										placeholder="Last filler treatment date"
										value={medicalHistory.lastFillerDate}
										onChange={(e) => setMedicalHistory({ ...medicalHistory, lastFillerDate: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								)}
							</div>
						)}

						{/* Consent Forms */}
						<div className="space-y-3">
							<h4 className="font-medium">Required Consents</h4>
							<label className="flex items-start space-x-2">
								<input
									type="checkbox"
									checked={consents.treatmentConsent}
									onChange={(e) => setConsents({ ...consents, treatmentConsent: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
								/>
								<span className="text-sm">
									I consent to the treatment and understand the risks, benefits, and potential complications
								</span>
							</label>
							<label className="flex items-start space-x-2">
								<input
									type="checkbox"
									checked={consents.photoConsent}
									onChange={(e) => setConsents({ ...consents, photoConsent: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
								/>
								<span className="text-sm">
									I consent to clinical photography for medical records (not for marketing)
								</span>
							</label>
							<label className="flex items-start space-x-2">
								<input
									type="checkbox"
									checked={consents.communicationConsent}
									onChange={(e) => setConsents({ ...consents, communicationConsent: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
								/>
								<span className="text-sm">
									I consent to receive appointment reminders and follow-up communications
								</span>
							</label>
							<label className="flex items-start space-x-2">
								<input
									type="checkbox"
									checked={consents.cancellationPolicy}
									onChange={(e) => setConsents({ ...consents, cancellationPolicy: e.target.checked })}
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
								/>
								<span className="text-sm">
									I understand the 48-hour cancellation policy and agree to the terms
								</span>
							</label>
						</div>
					</div>
				)

			case 4:
				return (
					<div className="space-y-6">
						<h3 className="text-lg font-semibold">Payment & Confirmation</h3>

						{/* Appointment Summary */}
						<div className="bg-gray-50 rounded-lg p-4 space-y-3">
							<h4 className="font-medium">Appointment Summary</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Patient:</span>
									<span className="font-medium">
										{patientType === 'existing'
											? selectedPatient?.name
											: `${newPatientData.firstName} ${newPatientData.lastName}`}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Treatment:</span>
									<span className="font-medium">{selectedService?.name}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Provider:</span>
									<span className="font-medium">{practitioner.name}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Date & Time:</span>
									<span className="font-medium">
										{moment(selectedDate).format('MMM DD, YYYY')} at {formatTime(new Date(new Date(selectedDate).setHours(startTime.hour, startTime.minute)))}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Duration:</span>
									<span className="font-medium">{selectedService?.duration} minutes</span>
								</div>
							</div>
						</div>

						{/* Payment Method */}
						<div>
							<h4 className="font-medium mb-3">Payment Method</h4>
							<div className="space-y-2">
								<label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										value="card"
										checked={paymentMethod === 'card'}
										onChange={(e) => setPaymentMethod(e.target.value as any)}
										className="text-purple-600 focus:ring-purple-500"
									/>
									<CreditCard className="h-5 w-5 mx-3 text-gray-400" />
									<span>Credit/Debit Card</span>
								</label>
								<label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										value="cash"
										checked={paymentMethod === 'cash'}
										onChange={(e) => setPaymentMethod(e.target.value as any)}
										className="text-purple-600 focus:ring-purple-500"
									/>
									<span className="mx-3">💵</span>
									<span>Cash</span>
								</label>
								<label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										value="financing"
										checked={paymentMethod === 'financing'}
										onChange={(e) => setPaymentMethod(e.target.value as any)}
										className="text-purple-600 focus:ring-purple-500"
									/>
									<span className="mx-3">🏦</span>
									<span>CareCredit / Financing</span>
								</label>
							</div>
						</div>

						{/* Deposit */}
						<div className="bg-yellow-50 rounded-lg p-4">
							<div className="flex items-start space-x-3">
								<AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
								<div className="flex-1">
									<h4 className="font-medium text-yellow-900">Deposit Required</h4>
									<p className="text-sm text-yellow-800 mt-1">
										A deposit of ${selectedService?.deposit || 0} is required to confirm this appointment.
										This will be applied to your treatment cost.
									</p>
									<label className="flex items-center space-x-2 mt-3">
										<input
											type="checkbox"
											checked={depositPaid}
											onChange={(e) => setDepositPaid(e.target.checked)}
											className="rounded border-yellow-600 text-purple-600 focus:ring-purple-500"
										/>
										<span className="text-sm font-medium">
											Process ${selectedService?.deposit || 0} deposit
										</span>
									</label>
								</div>
							</div>
						</div>

						{/* Pre-Treatment Instructions */}
						<div className="bg-blue-50 rounded-lg p-4">
							<h4 className="font-medium text-blue-900 mb-2">Pre-Treatment Instructions</h4>
							<ul className="text-sm text-blue-800 space-y-1">
								{selectedService?.category === 'injectables' && (
									<>
										<li>• Avoid blood thinners (aspirin, ibuprofen) for 5-7 days before</li>
										<li>• No alcohol 24 hours before treatment</li>
										<li>• Come with a clean face, no makeup</li>
									</>
								)}
								{selectedService?.category === 'laser' && (
									<>
										<li>• Avoid sun exposure for 4-6 weeks before</li>
										<li>• No self-tanning products for 2 weeks</li>
										<li>• Shave treatment area 24 hours before</li>
									</>
								)}
								{selectedService?.category === 'facial' && (
									<>
										<li>• Discontinue retinoids 3-5 days before</li>
										<li>• Avoid exfoliating products 48 hours before</li>
										<li>• Inform us of any active breakouts</li>
									</>
								)}
							</ul>
						</div>

						{/* Notes */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Additional Notes
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Any special requests or concerns..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								rows={3}
							/>
						</div>
					</div>
				)
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">New Appointment</h2>
						<div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
							<span className="flex items-center">
								<User className="h-4 w-4 mr-1" />
								{practitioner.name}
							</span>
							<span className="flex items-center">
								<Calendar className="h-4 w-4 mr-1" />
								{moment(selectedDate).format('ddd, MMM D')}
							</span>
							<span className="flex items-center">
								<Clock className="h-4 w-4 mr-1" />
								{formatTime(new Date(new Date(selectedDate).setHours(startTime.hour, startTime.minute)))}
							</span>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded-full transition-colors"
					>
						<X className="h-5 w-5 text-gray-400" />
					</button>
				</div>

				{/* Shift Info Banner */}
				{practitioner && (() => {
					const shift = getShiftForDate(practitioner.id, selectedDate)
					if (!shift) return null

					return (
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-3 m-6 mb-0">
							<div className="flex items-center text-sm text-purple-800">
								<Clock className="h-4 w-4 mr-2" />
								<span className="font-medium">{practitioner.name}'s hours today:</span>
								<span className="ml-2">
									{shift.startHour}:{shift.startMinute.toString().padStart(2, '0')} - {shift.endHour}:{shift.endMinute.toString().padStart(2, '0')}
								</span>
							</div>
						</div>
					)
				})()}

				{/* Progress Bar */}
				<div className="px-6 pt-4">
					<div className="flex items-center justify-between mb-2">
						{[1, 2, 3, 4].map((step) => (
							<div key={step} className="flex items-center">
								<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
									? 'bg-purple-600 text-white'
									: 'bg-gray-200 text-gray-600'
									}`}>
									{currentStep > step ? <Check className="h-5 w-5" /> : step}
								</div>
								{step < 4 && (
									<div className={`w-full h-1 mx-2 ${currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
										}`} />
								)}
							</div>
						))}
					</div>
					<div className="flex justify-between text-xs text-gray-600">
						<span>Patient</span>
						<span>Treatment</span>
						<span>Medical</span>
						<span>Payment</span>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
					{renderStepContent()}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between p-6 border-t bg-gray-50">
					<button
						onClick={currentStep === 1 ? onClose : handleBack}
						className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
					>
						{currentStep === 1 ? 'Cancel' : 'Back'}
					</button>

					<div className="text-sm text-gray-500">
						Step {currentStep} of {totalSteps}
					</div>

					{currentStep < totalSteps ? (
						<button
							onClick={handleNext}
							disabled={!validateStep(currentStep)}
							className={`px-6 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${validateStep(currentStep)
								? 'bg-purple-600 text-white hover:bg-purple-700'
								: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
						>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</button>
					) : (
						(() => {
							const endTimeHour = startTime.hour + Math.floor((selectedService?.duration || duration) / 60)
							const endTimeMinute = startTime.minute + ((selectedService?.duration || duration) % 60)
							const shift = getShiftForDate(practitioner.id, selectedDate)

							if (shift) {
								const shiftEndMinutes = shift.endHour * 60 + shift.endMinute
								const appointmentEndMinutes = startTime.hour * 60 + startTime.minute + (selectedService?.duration || duration)

								if (appointmentEndMinutes > shiftEndMinutes) {
									return (
										<button
											onClick={handleSave}
											disabled={!validateStep(currentStep)}
											className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${validateStep(currentStep)
												? 'bg-purple-600 text-white hover:bg-purple-700'
												: 'bg-gray-300 text-gray-500 cursor-not-allowed'
												}`}
										>
											Book Appointment (will adjust to {shift.endHour}:{shift.endMinute.toString().padStart(2, '0')})
										</button>
									)
								}
							}

							return (
								<button
									onClick={handleSave}
									disabled={!validateStep(currentStep)}
									className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${validateStep(currentStep)
										? 'bg-purple-600 text-white hover:bg-purple-700'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
										}`}
								>
									Book Appointment
								</button>
							)
						})()
					)}
				</div>
			</div>
		</div>
	)
}
