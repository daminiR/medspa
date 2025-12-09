// src/components/layout/DashboardLayout.tsx
'use client'

import { useState } from 'react'
import TopNav from './TopNav'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
	children: React.ReactNode
	showSidebar?: boolean
	title?: string
	subtitle?: string
}

export default function DashboardLayout({ 
	children, 
	showSidebar = true, 
	title,
	subtitle 
}: DashboardLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(true)

	return (
		<div className="min-h-screen bg-gray-50">
			<TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
			
			<div className="flex">
				{showSidebar && (
					<div className={`transition-all duration-300 ${
						sidebarOpen ? 'w-64' : 'w-0'
					} overflow-hidden`}>
						<Sidebar isOpen={sidebarOpen} />
					</div>
				)}
				
				<main className={`flex-1 min-h-[calc(100vh-64px)] transition-all duration-300 ${
					showSidebar && sidebarOpen ? 'ml-0' : 'ml-0'
				}`}>
					{(title || subtitle) && (
						<div className="bg-white border-b border-gray-200 px-6 py-4">
							{title && (
								<h1 className="text-2xl font-bold text-gray-900">{title}</h1>
							)}
							{subtitle && (
								<p className="text-sm text-gray-600 mt-1">{subtitle}</p>
							)}
						</div>
					)}
					
					<div className="p-6">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}
