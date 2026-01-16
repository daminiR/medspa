'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ChevronDown,
  Settings,
  Search,
  MapPin,
  Users,
  Clock,
  Coffee,
  Send,
  UsersRound,
  ListTodo,
  DoorOpen,
  Package,
  CalendarPlus,
  Ban,
  Move,
  Filter,
  Sparkles,
  Footprints,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import moment from 'moment';
import { ViewMode, CreateMode, BreakType, CalendarViewType } from '@/types/calendar';
import { locations, BREAK_COLORS, Appointment } from '@/lib/data';
import AppointmentSearch from './AppointmentSearch';

interface CalendarToolbarProps {
  // Date & Navigation
  selectedDate: Date;
  today: Date;
  view: ViewMode;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onViewChange: (view: ViewMode) => void;
  onGoToDate: () => void;

  // Location
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;

  // Create Mode
  createMode: CreateMode;
  onCreateModeChange: (mode: CreateMode) => void;
  pendingBreakType?: BreakType;

  // Booking Actions
  onNewAppointment: () => void;
  onWalkIn?: () => void;
  onExpressBooking?: () => void;
  onGroupBooking?: () => void;
  onAddBreak: (type: 'lunch' | 'break' | 'meeting') => void;
  onBlockTime?: () => void;

  // Move Mode
  moveMode?: boolean;
  onToggleMoveMode?: () => void;

  // Search
  onFindSlot?: () => void;

  // Settings
  onSettings: () => void;

  // Side Panels
  staffCount: number;
  waitlistCount: number;
  isStaffPanelOpen: boolean;
  isWaitlistOpen: boolean;
  isRoomsPanelOpen: boolean;
  isResourcesPanelOpen: boolean;
  isGroupsPanelOpen: boolean;
  onToggleStaffPanel: () => void;
  onToggleWaitlist: () => void;
  onToggleRoomsPanel: () => void;
  onToggleResourcesPanel: () => void;
  onToggleGroupsPanel: () => void;

  // Service Filter
  selectedServiceCategory?: string | null;
  onServiceCategoryChange?: (category: string | null) => void;

  // Global Search
  appointments?: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
  onNavigateToDate?: (date: Date) => void;

  // Calendar View Type (practitioners vs rooms)
  calendarViewType?: CalendarViewType;
  onCalendarViewTypeChange?: (type: CalendarViewType) => void;

  // Double Booking Override Mode
  // When active, allows booking conflicting appointments
  doubleBookingMode?: boolean;
  onToggleDoubleBookingMode?: () => void;

  // Print & Export
  onPrint?: () => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

export default function CalendarToolbar({
  selectedDate,
  today,
  view,
  onNavigate,
  onViewChange,
  onGoToDate,
  selectedLocation,
  onLocationChange,
  createMode,
  onCreateModeChange,
  pendingBreakType = 'personal',
  onNewAppointment,
  onWalkIn,
  onExpressBooking,
  onGroupBooking,
  onAddBreak,
  onBlockTime,
  moveMode,
  onToggleMoveMode,
  onFindSlot,
  onSettings,
  staffCount,
  waitlistCount,
  isStaffPanelOpen,
  isWaitlistOpen,
  isRoomsPanelOpen,
  isResourcesPanelOpen,
  isGroupsPanelOpen,
  onToggleStaffPanel,
  onToggleWaitlist,
  onToggleRoomsPanel,
  onToggleResourcesPanel,
  onToggleGroupsPanel,
  selectedServiceCategory,
  onServiceCategoryChange,
  appointments,
  onAppointmentSelect,
  onNavigateToDate,
  calendarViewType = 'practitioners',
  onCalendarViewTypeChange,
  doubleBookingMode,
  onToggleDoubleBookingMode,
  onPrint,
  onExportCSV,
  onExportExcel,
}: CalendarToolbarProps) {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const bookMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bookMenuRef.current && !bookMenuRef.current.contains(event.target as Node)) {
        setIsBookMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToday = moment(selectedDate).isSame(today, 'day');
  const dateDisplay = moment(selectedDate).format('ddd, MMM D, YYYY');

  return (
    <div className="bg-white border-b px-2 sm:px-4 py-2 shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between min-w-max">
        {/* Left Section: Location + Navigation + View + Date */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Location Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4 text-gray-500" />
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer pr-6"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Category Filter */}
          {onServiceCategoryChange && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <select
                value={selectedServiceCategory || ''}
                onChange={(e) => onServiceCategoryChange(e.target.value || null)}
                className={`text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 ${
                  selectedServiceCategory ? 'text-purple-700' : 'text-gray-700'
                }`}
              >
                <option value="">All Services</option>
                <option value="aesthetics">Aesthetics</option>
                <option value="physiotherapy">Physiotherapy</option>
                <option value="chiropractic">Chiropractic</option>
                <option value="massage">Massage</option>
              </select>
            </div>
          )}

          <div className="h-6 w-px bg-gray-200" />

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('PREV')}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isToday
                  ? 'bg-purple-100 text-purple-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Next"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewChange('day')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewChange('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>

          {/* Calendar View Type Toggle (Practitioners vs Rooms) */}
          {onCalendarViewTypeChange && (
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => onCalendarViewTypeChange('practitioners')}
                className={`flex items-center gap-1 px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
                  calendarViewType === 'practitioners'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View by Practitioners"
              >
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Staff</span>
              </button>
              <button
                onClick={() => onCalendarViewTypeChange('rooms')}
                className={`flex items-center gap-1 px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
                  calendarViewType === 'rooms'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="View by Rooms"
              >
                <DoorOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Rooms</span>
              </button>
            </div>
          )}

          {/* Date Display */}
          <button
            onClick={onGoToDate}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
            {dateDisplay}
          </button>
        </div>

        {/* Center Section: Key Actions for Phone/Walk-in Workflows */}
        <div className="flex items-center gap-2">
          {/* New Appointment - Toggle button for appointment creation mode */}
          <button
            onClick={() => {
              if (createMode === 'appointment') {
                // Exit appointment mode
                onCreateModeChange('none');
              } else {
                // Enter appointment mode
                onCreateModeChange('appointment');
                onNewAppointment();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              createMode === 'appointment'
                ? 'bg-purple-700 text-white ring-2 ring-purple-300'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
            title={createMode === 'appointment' ? 'Click to exit appointment mode' : 'Click to create appointment'}
          >
            {createMode === 'appointment' ? (
              <>
                <Ban className="h-4 w-4" />
                Exit Mode
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                New Appointment
              </>
            )}
          </button>

          {/* Walk-In Button - Quick add walk-in patients */}
          {onWalkIn && (
            <button
              onClick={onWalkIn}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm bg-amber-500 text-white hover:bg-amber-600"
              title="Add walk-in patient"
            >
              <Footprints className="h-4 w-4" />
              Walk-In
            </button>
          )}

          {/* Exit Break Mode button - shown when in break mode */}
          {createMode === 'break' && (
            <button
              onClick={() => onCreateModeChange('none')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ring-2"
              style={{
                backgroundColor: BREAK_COLORS[pendingBreakType]?.stripe || '#9E9E9E',
                color: 'white',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--tw-ring-color' as any]: BREAK_COLORS[pendingBreakType]?.bg || '#E0E0E0'
              }}
              title="Click to exit break mode"
            >
              <Ban className="h-4 w-4" />
              Exit {BREAK_COLORS[pendingBreakType]?.label || 'Break'} Mode
            </button>
          )}

          {/* Find Slot - For phone calls: "Do you have anything Tuesday?" */}
          {onFindSlot && (
            <button
              onClick={onFindSlot}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              Find Slot
            </button>
          )}

          {/* More booking options dropdown */}
          <div className="relative" ref={bookMenuRef}>
            <button
              onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                isBookMenuOpen
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="More options"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isBookMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBookMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {/* Special Booking Types */}
                {onExpressBooking && (
                  <button
                    onClick={() => {
                      onExpressBooking();
                      setIsBookMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium">Express Book</div>
                      <div className="text-xs text-gray-500">Send SMS link</div>
                    </div>
                  </button>
                )}

                {onGroupBooking && (
                  <button
                    onClick={() => {
                      onGroupBooking();
                      setIsBookMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <UsersRound className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium">Group Booking</div>
                      <div className="text-xs text-gray-500">Bridal party, couples</div>
                    </div>
                  </button>
                )}

                <div className="border-t border-gray-100 my-2" />

                {/* Move Appointments */}
                {onToggleMoveMode && (
                  <button
                    onClick={() => {
                      onToggleMoveMode();
                      setIsBookMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      moveMode
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
                    }`}
                  >
                    <Move className="h-4 w-4" />
                    <div>
                      <div className="text-sm font-medium">
                        {moveMode ? 'Exit Move Mode' : 'Move Appointment'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {moveMode ? 'Click to stop moving' : 'Drag to reschedule'}
                      </div>
                    </div>
                  </button>
                )}

                </div>
            )}
          </div>
        </div>

        {/* Right Section: Panels + Settings */}
        <div className="flex items-center gap-2">

          {/* Panel Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleStaffPanel}
              className={`relative p-2 rounded-md transition-colors ${
                isStaffPanelOpen
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Staff"
            >
              <Users className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {staffCount}
              </span>
            </button>

            <button
              onClick={onToggleWaitlist}
              className={`relative p-2 rounded-md transition-colors ${
                isWaitlistOpen
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Waitlist"
            >
              <ListTodo className="h-5 w-5" />
              {waitlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {waitlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleRoomsPanel}
              className={`p-2 rounded-md transition-colors ${
                isRoomsPanelOpen
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Rooms"
            >
              <DoorOpen className="h-5 w-5" />
            </button>

            <button
              onClick={onToggleResourcesPanel}
              className={`p-2 rounded-md transition-colors ${
                isResourcesPanelOpen
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Resources"
            >
              <Package className="h-5 w-5" />
            </button>

            <button
              onClick={onToggleGroupsPanel}
              className={`p-2 rounded-md transition-colors ${
                isGroupsPanelOpen
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title="Group Bookings"
            >
              <UsersRound className="h-5 w-5" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Global Appointment Search */}
          {appointments && onAppointmentSelect && onNavigateToDate && (
            <AppointmentSearch
              appointments={appointments}
              onAppointmentSelect={onAppointmentSelect}
              onNavigateToDate={onNavigateToDate}
            />
          )}

          {/* Double Booking Override Mode Badge */}
          {/* Visual indicator when override mode is active */}
          {doubleBookingMode && onToggleDoubleBookingMode && (
            <button
              onClick={onToggleDoubleBookingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors animate-pulse shadow-md"
              title="Press D to exit override mode"
              aria-label="Override mode active. Click to disable."
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>D MODE</span>
            </button>
          )}

          {/* Print & Export */}
          {(onPrint || onExportCSV || onExportExcel) && (
            <>
              <div className="h-6 w-px bg-gray-200" />

              {/* Print Button */}
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
                  title="Print Schedule"
                >
                  <Printer className="h-5 w-5" />
                </button>
              )}

              {/* Export Dropdown */}
              {(onExportCSV || onExportExcel) && (
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className={`flex items-center gap-1 p-2 rounded-md transition-colors ${
                      isExportMenuOpen
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    title="Export Schedule"
                  >
                    <Download className="h-5 w-5" />
                    <ChevronDown className={`h-3 w-3 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isExportMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                      {onExportCSV && (
                        <button
                          onClick={() => {
                            onExportCSV();
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm font-medium">Export CSV</div>
                            <div className="text-xs text-gray-500">Spreadsheet format</div>
                          </div>
                        </button>
                      )}
                      {onExportExcel && (
                        <button
                          onClick={() => {
                            onExportExcel();
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium">Export Excel</div>
                            <div className="text-xs text-gray-500">Microsoft Excel format</div>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Settings */}
          <button
            onClick={onSettings}
            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
