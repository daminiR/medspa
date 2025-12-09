'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Phone, Mail, Star, Calendar, MapPin, Award, Users } from 'lucide-react';
import { StaffMember, StaffListItem, StaffFilter, StaffStatus, StaffRole, Specialization } from '@/types/staff';
import { generateStaffDataset, generateStaffListItem } from '@/lib/data/staffGenerator';

interface StaffListProps {
  onSelectStaff?: (staffId: string) => void;
  onAddStaff?: () => void;
}

export default function StaffList({ onSelectStaff, onAddStaff }: StaffListProps) {
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StaffFilter>({
    search: '',
    status: [],
    roles: [],
    locations: [],
    specializations: []
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadStaff = () => {
      setLoading(true);
      const staffData = generateStaffDataset(100);
      const listItems = staffData.map(s => generateStaffListItem(s));
      setStaff(listItems);
      setLoading(false);
    };

    loadStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    let result = [...staff];

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(s =>
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.employeeId.toLowerCase().includes(search) ||
        s.role.toLowerCase().includes(search)
      );
    }

    if (filter.status && filter.status.length > 0) {
      result = result.filter(s => filter.status!.includes(s.status));
    }

    if (filter.roles && filter.roles.length > 0) {
      result = result.filter(s => filter.roles!.includes(s.role));
    }

    if (filter.locations && filter.locations.length > 0) {
      result = result.filter(s => filter.locations!.includes(s.primaryLocation));
    }

    if (filter.specializations && filter.specializations.length > 0) {
      result = result.filter(s => 
        s.specializations.some(spec => filter.specializations!.includes(spec))
      );
    }

    return result;
  }, [staff, filter]);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const statusColors: Record<StaffStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800'
  };

  const roleIcons: Partial<Record<StaffRole, React.ReactNode>> = {
    'Medical Director': <Award className="w-4 h-4" />,
    'Physician': <Award className="w-4 h-4" />,
    'Office Manager': <Users className="w-4 h-4" />
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Staff Directory</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            <button
              onClick={onAddStaff}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, ID, or role..."
              value={filter.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filter.status?.length || filter.roles?.length || filter.locations?.length || filter.specializations?.length) ? (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {(filter.status?.length || 0) + (filter.roles?.length || 0) + (filter.locations?.length || 0) + (filter.specializations?.length || 0)}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  value={filter.status?.[0] || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    status: e.target.value ? [e.target.value as StaffStatus] : [] 
                  }))}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  value={filter.roles?.[0] || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    roles: e.target.value ? [e.target.value as StaffRole] : [] 
                  }))}
                >
                  <option value="">All Roles</option>
                  <option value="Medical Director">Medical Director</option>
                  <option value="Physician">Physician</option>
                  <option value="Nurse Practitioner">Nurse Practitioner</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Aesthetician">Aesthetician</option>
                  <option value="Laser Technician">Laser Technician</option>
                  <option value="Injection Specialist">Injection Specialist</option>
                  <option value="Front Desk">Front Desk</option>
                  <option value="Office Manager">Office Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <select
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  value={filter.locations?.[0] || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    locations: e.target.value ? [e.target.value] : [] 
                  }))}
                >
                  <option value="">All Locations</option>
                  <option value="Beverly Hills Main">Beverly Hills Main</option>
                  <option value="Santa Monica Branch">Santa Monica Branch</option>
                  <option value="Newport Beach">Newport Beach</option>
                  <option value="Malibu Center">Malibu Center</option>
                  <option value="West Hollywood">West Hollywood</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                <select
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  value={filter.specializations?.[0] || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    specializations: e.target.value ? [e.target.value as Specialization] : [] 
                  }))}
                >
                  <option value="">All Specializations</option>
                  <option value="Botox/Dysport">Botox/Dysport</option>
                  <option value="Dermal Fillers">Dermal Fillers</option>
                  <option value="Laser Hair Removal">Laser Hair Removal</option>
                  <option value="Chemical Peels">Chemical Peels</option>
                  <option value="Microneedling">Microneedling</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setFilter({ search: '' });
                  setShowFilters(false);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedStaff.map((member) => (
              <div
                key={member.id}
                onClick={() => onSelectStaff?.(member.id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {member.profilePhoto ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{member.employeeId}</p>
                    </div>
                  </div>
                  {roleIcons[member.role]}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{member.role}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[member.status]}`}>
                      {member.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{member.primaryLocation}</span>
                  </div>

                  {member.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specializations.slice(0, 2).map((spec, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {spec}
                        </span>
                      ))}
                      {member.specializations.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{member.specializations.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {member.nextShift && member.status === 'active' && (
                    <div className="flex items-center gap-1 text-gray-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        Next: {new Date(member.nextShift.date).toLocaleDateString()} {member.nextShift.startTime}
                      </span>
                    </div>
                  )}

                  {member.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-600">{member.rating.toFixed(1)}</span>
                      {member.utilizationRate && (
                        <span className="text-xs text-gray-500 ml-2">
                          {(member.utilizationRate * 100).toFixed(0)}% utilized
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${member.phone}`;
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-gray-600 hover:text-blue-600"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${member.email}`;
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-gray-600 hover:text-blue-600"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specializations</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Shift</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((member) => (
                  <tr 
                    key={member.id} 
                    onClick={() => onSelectStaff?.(member.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{member.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{member.primaryLocation}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {member.specializations.slice(0, 2).map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                        {member.specializations.length > 2 && (
                          <span className="text-xs text-gray-500">+{member.specializations.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {member.nextShift && member.status === 'active' ? (
                        <span>{new Date(member.nextShift.date).toLocaleDateString()} {member.nextShift.startTime}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {member.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs">{member.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${member.phone}`;
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${member.email}`;
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredStaff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No staff members found matching your criteria
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff members
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}