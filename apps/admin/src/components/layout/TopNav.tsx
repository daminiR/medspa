// src/components/layout/TopNav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, FileText, CreditCard, BarChart3, Settings, HelpCircle, ChevronDown, Search, Menu } from 'lucide-react'

const navigation = [
	{ name: 'Day', href: '/calendar/day', icon: Calendar },
	{ name: 'Schedule', href: '/calendar/schedule', icon: Calendar },
	{ name: 'Patients', href: '/patients', icon: Users },
	{ name: 'Staff', href: '/staff', icon: Users },
	{ name: 'Billing', href: '/billing', icon: CreditCard },
	{ name: 'Reports', href: '/reports', icon: BarChart3 },
	{ name: 'Settings', href: '/settings', icon: Settings },
]

interface TopNavProps {
	onMenuClick?: () => void
}

export default function TopNav({ onMenuClick }: TopNavProps) {
	const pathname = usePathname()
	const [clinicDropdownOpen, setClinicDropdownOpen] = useState(false)

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-40">
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left section */}
					<div className="flex items-center space-x-4">
						{/* Menu toggle */}
						{onMenuClick && (
							<button
								onClick={onMenuClick}
								className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
							>
								<Menu className="h-5 w-5 text-gray-600" />
							</button>
						)}
						{/* Clinic Selector */}
						<div className="relative">
							<button
								onClick={() => setClinicDropdownOpen(!clinicDropdownOpen)}
								className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50"
							>
								<div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
									<span className="text-white text-sm font-bold">MS</span>
								</div>
								<div className="text-left">
									<p className="text-sm font-medium text-gray-900">Luxe Medical Spa</p>
									<p className="text-xs text-gray-500">Beverly Hills</p>
								</div>
								<ChevronDown className="h-4 w-4 text-gray-400" />
							</button>
						</div>

						{/* Main Navigation */}
						<nav className="hidden md:flex space-x-1">
							{navigation.map((item) => {
								const isActive = pathname?.startsWith(item.href)
								return (
									<Link
										key={item.name}
										href={item.href}
										className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
											? 'bg-purple-50 text-purple-700'
											: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
											}`}
									>
										{item.name}
									</Link>
								)
							})}
						</nav>
					</div>

					{/* Right section */}
					<div className="flex items-center space-x-4">
						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="search"
								placeholder="Patient Search..."
								className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
							/>
						</div>

						{/* Help */}
						<button className="p-2 text-gray-400 hover:text-gray-600">
							<HelpCircle className="h-5 w-5" />
						</button>

						{/* User */}
						<button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
							<img
								src="https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff"
								alt="User"
								className="h-8 w-8 rounded-full"
							/>
							<span className="text-sm font-medium text-gray-700">Admin User</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	)
}
