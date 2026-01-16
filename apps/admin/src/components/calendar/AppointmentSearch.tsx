'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Calendar, Clock, User } from 'lucide-react';
import moment from 'moment';
import { Appointment } from '@/lib/data';

interface AppointmentSearchProps {
  appointments: Appointment[];
  onAppointmentSelect: (appointment: Appointment) => void;
  onNavigateToDate: (date: Date) => void;
}

interface SearchResult extends Appointment {
  matchType: 'patient' | 'service' | 'practitioner';
  matchText: string;
}

export default function AppointmentSearch({
  appointments,
  onAppointmentSelect,
  onNavigateToDate,
}: AppointmentSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Filter to non-cancelled/deleted appointments
    const activeAppointments = appointments.filter(
      apt => apt.status !== 'cancelled' && apt.status !== 'deleted'
    );

    for (const apt of activeAppointments) {
      // Match patient name
      if (apt.patientName.toLowerCase().includes(query)) {
        results.push({
          ...apt,
          matchType: 'patient',
          matchText: apt.patientName,
        });
        continue;
      }

      // Match service name
      if (apt.serviceName.toLowerCase().includes(query)) {
        results.push({
          ...apt,
          matchType: 'service',
          matchText: apt.serviceName,
        });
        continue;
      }

      // Match phone (if searching for numbers)
      if (apt.phone && apt.phone.includes(query.replace(/\D/g, ''))) {
        results.push({
          ...apt,
          matchType: 'patient',
          matchText: apt.phone,
        });
        continue;
      }
    }

    // Sort by date (upcoming first, then recent past)
    const now = new Date();
    return results
      .sort((a, b) => {
        const aFuture = a.startTime >= now;
        const bFuture = b.startTime >= now;

        if (aFuture && !bFuture) return -1;
        if (!aFuture && bFuture) return 1;

        if (aFuture && bFuture) {
          return a.startTime.getTime() - b.startTime.getTime();
        }
        return b.startTime.getTime() - a.startTime.getTime();
      })
      .slice(0, 10); // Limit to 10 results
  }, [appointments, searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    onNavigateToDate(result.startTime);
    onAppointmentSelect(result);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const colors: Record<Appointment['status'], string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      arrived: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-orange-100 text-orange-700',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-yellow-100 text-yellow-700',
      deleted: 'bg-gray-100 text-gray-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button / Input */}
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="Search appointments (⌘K)"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm hidden md:inline">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded">
            ⌘K
          </kbd>
        </button>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-300 rounded-lg shadow-sm w-64">
          <Search className="h-4 w-4 text-purple-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Patient, service, phone..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && searchQuery.length >= 2 && (
        <div className="absolute top-full mt-2 right-0 w-[calc(100vw-32px)] max-w-[384px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No appointments found for "{searchQuery}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  {/* Color indicator */}
                  <div
                    className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: result.color }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Patient name and status */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {result.patientName}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadge(result.status)}`}>
                        {result.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Service */}
                    <div className="text-sm text-gray-600 truncate">
                      {result.serviceName}
                    </div>

                    {/* Date and time */}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {moment(result.startTime).format('ddd, MMM D')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {moment(result.startTime).format('h:mm A')}
                      </span>
                    </div>
                  </div>

                  {/* Match indicator */}
                  {result.matchType === 'service' && (
                    <span className="text-xs text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      service
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
