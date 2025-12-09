'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, User, Phone, Mail, AlertCircle, Clock } from 'lucide-react'
import { PatientListItem } from '@/types/patient'
import { searchPatients } from '@/lib/data/patients'

interface PatientSearchProps {
  onPatientSelect?: (patient: PatientListItem) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export default function PatientSearch({
  onPatientSelect,
  placeholder = 'Search patients by name, email, phone, or patient number...',
  autoFocus = false,
  className = ''
}: PatientSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PatientListItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentPatientSearches')
    if (recent) {
      setRecentSearches(JSON.parse(recent))
    }
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Perform search
  useEffect(() => {
    if (query.length > 0) {
      const searchResults = searchPatients(query)
      setResults(searchResults.slice(0, 5)) // Limit to 5 results
      setIsOpen(true)
      setSelectedIndex(0)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          selectPatient(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Handle patient selection
  const selectPatient = (patient: PatientListItem) => {
    // Add to recent searches
    const newRecent = [
      `${patient.firstName} ${patient.lastName}`,
      ...recentSearches.filter(s => s !== `${patient.firstName} ${patient.lastName}`)
    ].slice(0, 5)
    
    setRecentSearches(newRecent)
    localStorage.setItem('recentPatientSearches', JSON.stringify(newRecent))
    
    // Clear and close
    setQuery('')
    setIsOpen(false)
    
    // Callback
    onPatientSelect?.(patient)
  }

  // Handle recent search click
  const handleRecentSearch = (search: string) => {
    setQuery(search)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Search Results ({results.length})
                </p>
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {results.map((patient, index) => (
                  <li
                    key={patient.id}
                    onClick={() => selectPatient(patient)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-purple-50 border-l-2 border-purple-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                              {patient.preferredName && (
                                <span className="text-gray-500 text-sm ml-1">
                                  ({patient.preferredName})
                                </span>
                              )}
                            </p>
                            {patient.hasAlerts && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="font-mono">#{patient.patientNumber}</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      {patient.lastVisit && (
                        <div className="text-xs text-gray-500">
                          <p>Last visit</p>
                          <p className="font-medium">
                            {new Date(patient.lastVisit).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {results.length === 5 && (
                <div className="px-3 py-2 bg-gray-50 border-t text-center">
                  <p className="text-xs text-gray-500">
                    Showing first 5 results. Type more to narrow search.
                  </p>
                </div>
              )}
            </>
          ) : query.length > 0 ? (
            <div className="px-4 py-8 text-center">
              <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No patients found</p>
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Trigger new patient modal
                }}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Add new patient →
              </button>
            </div>
          ) : recentSearches.length > 0 ? (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </p>
              </div>
              <ul className="py-1">
                {recentSearches.map((search, index) => (
                  <li
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    {search}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}