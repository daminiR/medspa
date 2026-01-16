'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Coffee, 
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MapPin,
  Stethoscope,
  UserCheck,
  AlertCircle,
  Settings
} from 'lucide-react';
import { practitioners, locations, services } from '@/lib/data';

interface ScheduleCommandBarProps {
  selectedLocation: string;
  onLocationChange: (locationId: string) => void;
  selectedPractitionerIds: string[];
  onPractitionerToggle: (practitionerId: string) => void;
  onSelectAllPractitioners: () => void;
  onClearPractitioners: () => void;
  onQuickBreak: (type: 'lunch' | 'break' | 'meeting') => void;
  onFindSlot: (service: any) => void;
  onOpenSettings: () => void;
  currentDate?: string;
  currentView?: 'day' | 'week';
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange?: (view: 'day' | 'week') => void;
}

export default function ScheduleCommandBar({
  selectedLocation,
  onLocationChange,
  selectedPractitionerIds,
  onPractitionerToggle,
  onSelectAllPractitioners,
  onClearPractitioners,
  onQuickBreak,
  onFindSlot,
  onOpenSettings,
  currentDate = 'Today',
  currentView = 'day',
  onNavigate,
  onViewChange
}: ScheduleCommandBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'services' | 'breaks'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'today' | 'tomorrow' | 'week' | 'next-week'>('today');
  const [selectedProvider, setSelectedProvider] = useState<string>('any');

  // Filter practitioners based on search
  const filteredPractitioners = practitioners.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get count of selected practitioners
  const selectedCount = selectedPractitionerIds.length;
  const totalCount = practitioners.filter(p => p.status === 'active').length;

  return (
    <div className="relative bg-white border-b border-gray-200 shadow-sm">
      {/* Main Command Bar - Always Visible */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Location Selector */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Quick Staff Filter */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {selectedCount === totalCount 
                  ? 'All Staff' 
                  : `${selectedCount} of ${totalCount} Staff`}
              </span>
              {selectedCount < totalCount && (
                <button
                  onClick={onSelectAllPractitioners}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuickBreak('lunch')}
                className="px-3 py-1 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 flex items-center gap-1"
              >
                <Coffee className="w-3 h-3" />
                Add Lunch
              </button>
              <button
                onClick={() => onQuickBreak('break')}
                className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                Add Break
              </button>
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setActiveTab('services');
                }}
                className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                Find Slot
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Warnings/Alerts */}
            <div className="flex items-center gap-2 mr-4">
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">2 conflicts</span>
              </div>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${
                isExpanded 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Tools
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40" 
          style={{ top: '120px' }}
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Expanded Panel - Overlay instead of push down */}
      {isExpanded && (
        <div className="absolute left-0 right-0 top-full z-50 bg-white shadow-2xl border-b border-gray-200">
          <div className="max-h-[450px] overflow-y-auto">
            <div className="px-4 py-3 bg-gray-50">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'staff'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Staff & Providers
                </div>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'services'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  Services & Slots
                </div>
              </button>
              <button
                onClick={() => setActiveTab('breaks')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'breaks'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  Breaks & Shifts
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg p-4">
              {activeTab === 'staff' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      placeholder="Search staff by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 max-w-sm px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onSelectAllPractitioners}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        onClick={onClearPractitioners}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 max-h-[250px] overflow-y-auto pr-2">
                    {filteredPractitioners.map(practitioner => {
                      const isSelected = selectedPractitionerIds.includes(practitioner.id);
                      const isAvailable = practitioner.status === 'active';
                      
                      return (
                        <button
                          key={practitioner.id}
                          onClick={() => {
                            onPractitionerToggle(practitioner.id);
                            // Don't auto-close on staff selection
                          }}
                          disabled={!isAvailable}
                          className={`p-2 rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                              : isAvailable
                              ? 'bg-white border-gray-200 hover:border-gray-300'
                              : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {practitioner.initials}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-gray-900">
                                {practitioner.name.replace(/^Dr\.\s/, '')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {practitioner.specialties?.[0]}
                              </div>
                            </div>
                            {isSelected && (
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Find Available Appointment</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select service, provider preference, and time range
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Step 1: Service Selection */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        1. What service does the client need?
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search service (e.g., 'botox', 'facial')..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      {/* Quick popular services */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {services.slice(0, 5).map(service => (
                          <button
                            key={service.id}
                            className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100"
                          >
                            {service.name} ({service.duration}m)
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Provider Preference */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        2. Provider preference?
                      </label>
                      <select 
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="any">Any Available Provider</option>
                        <option value="preferred">Client's Preferred Provider Only</option>
                        <optgroup label="Specific Provider">
                          {practitioners.filter(p => p.status === 'active').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Step 3: Time Range */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        3. When are they looking for?
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        <button 
                          onClick={() => setSelectedTimeFilter('today')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            selectedTimeFilter === 'today' 
                              ? 'bg-green-100 text-green-700 ring-1 ring-green-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Today
                        </button>
                        <button 
                          onClick={() => setSelectedTimeFilter('tomorrow')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            selectedTimeFilter === 'tomorrow' 
                              ? 'bg-green-100 text-green-700 ring-1 ring-green-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Tomorrow
                        </button>
                        <button 
                          onClick={() => setSelectedTimeFilter('week')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            selectedTimeFilter === 'week' 
                              ? 'bg-green-100 text-green-700 ring-1 ring-green-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          This Week
                        </button>
                        <button 
                          onClick={() => setSelectedTimeFilter('next-week')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            selectedTimeFilter === 'next-week' 
                              ? 'bg-green-100 text-green-700 ring-1 ring-green-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Next Week
                        </button>
                      </div>
                    </div>

                    {/* Find Button */}
                    <button
                      onClick={() => {
                        // This would actually search and show results
                        const mockResults = `
                          Finding slots for: Any Service
                          Provider: ${selectedProvider === 'any' ? 'Any Available' : 'Selected Provider'}
                          Time: ${selectedTimeFilter}
                          
                          Available Slots:
                          • Today 2:30 PM - Dr. Sarah Johnson
                          • Today 4:15 PM - Dr. Mike Chen  
                          • Tomorrow 9:00 AM - Dr. Sarah Johnson
                          • Tomorrow 11:30 AM - Dr. Mike Chen
                        `;
                        alert(mockResults);
                        onFindSlot({ service: 'selected', provider: selectedProvider, timeFilter: selectedTimeFilter });
                        setIsExpanded(false);
                      }}
                      className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Find Available Slots
                    </button>

                    {/* Results Preview (would show after search) */}
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-800">
                        <strong>Tip:</strong> Results will show as a list. Click any slot to instantly book it!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'breaks' && (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Break Options</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            onQuickBreak('lunch');
                            setIsExpanded(false);
                          }}
                          className="w-full p-2 text-left bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium text-gray-900">Lunch Break</span>
                            </div>
                            <span className="text-xs text-gray-500">12:00 - 1:00 PM</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            onQuickBreak('break');
                            setIsExpanded(false);
                          }}
                          className="w-full p-2 text-left bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-gray-900">15 Min Break</span>
                            </div>
                            <span className="text-xs text-gray-500">Next available</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            onQuickBreak('meeting');
                            setIsExpanded(false);
                          }}
                          className="w-full p-2 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">Team Meeting</span>
                            </div>
                            <span className="text-xs text-gray-500">30 min block</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Shift Management</h4>
                      <div className="space-y-2">
                        <button className="w-full p-2 text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                          <div className="text-sm font-medium text-gray-900">Edit Today\'s Shifts</div>
                          <div className="text-xs text-gray-500">Modify working hours for staff</div>
                        </button>
                        <button className="w-full p-2 text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                          <div className="text-sm font-medium text-gray-900">Recurring Schedules</div>
                          <div className="text-xs text-gray-500">Set weekly patterns</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}