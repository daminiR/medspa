'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, User, AlertCircle, Check, X, 
  MessageSquare, ChevronDown, Filter, Search
} from 'lucide-react';
import moment from 'moment';

interface ShiftRequest {
  id: string;
  type: 'add' | 'change' | 'cancel' | 'swap';
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  
  originalShift?: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  
  requestedShift?: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  
  swapWith?: {
    staffId: string;
    staffName: string;
    shiftDate: string;
    shiftTime: string;
  };
  
  reason: string;
  managerNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

const mockRequests: ShiftRequest[] = [
  {
    id: 'REQ001',
    type: 'swap',
    requesterId: 'STAFF12345',
    requesterName: 'Sarah Johnson',
    requesterRole: 'Registered Nurse',
    status: 'pending',
    createdAt: moment().subtract(2, 'hours').toISOString(),
    originalShift: {
      date: moment().add(3, 'days').format('YYYY-MM-DD'),
      startTime: '08:00',
      endTime: '16:00',
      location: 'Beverly Hills Main'
    },
    swapWith: {
      staffId: 'STAFF54321',
      staffName: 'Emily Davis',
      shiftDate: moment().add(5, 'days').format('YYYY-MM-DD'),
      shiftTime: '10:00 - 18:00'
    },
    reason: 'Family emergency - need to travel out of town'
  },
  {
    id: 'REQ002',
    type: 'add',
    requesterId: 'STAFF67890',
    requesterName: 'Michael Chen',
    requesterRole: 'Laser Technician',
    status: 'pending',
    createdAt: moment().subtract(1, 'day').toISOString(),
    requestedShift: {
      date: moment().add(7, 'days').format('YYYY-MM-DD'),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Santa Monica Branch'
    },
    reason: 'Available to cover extra shift for busy weekend'
  },
  {
    id: 'REQ003',
    type: 'change',
    requesterId: 'STAFF11111',
    requesterName: 'Jessica Martinez',
    requesterRole: 'Aesthetician',
    status: 'approved',
    createdAt: moment().subtract(3, 'days').toISOString(),
    approvedAt: moment().subtract(2, 'days').toISOString(),
    approvedBy: 'Dr. Marcus',
    originalShift: {
      date: moment().add(1, 'day').format('YYYY-MM-DD'),
      startTime: '10:00',
      endTime: '18:00',
      location: 'Beverly Hills Main'
    },
    requestedShift: {
      date: moment().add(1, 'day').format('YYYY-MM-DD'),
      startTime: '12:00',
      endTime: '20:00',
      location: 'Beverly Hills Main'
    },
    reason: 'Doctor appointment in the morning',
    managerNotes: 'Approved - coverage arranged for morning appointments'
  },
  {
    id: 'REQ004',
    type: 'cancel',
    requesterId: 'STAFF22222',
    requesterName: 'David Wilson',
    requesterRole: 'Front Desk',
    status: 'denied',
    createdAt: moment().subtract(5, 'days').toISOString(),
    originalShift: {
      date: moment().subtract(2, 'days').format('YYYY-MM-DD'),
      startTime: '07:00',
      endTime: '15:00',
      location: 'Newport Beach'
    },
    reason: 'Personal day request',
    managerNotes: 'Unable to approve - no coverage available for morning shift'
  }
];

interface ShiftApprovalProps {
  onApprove?: (requestId: string, notes?: string) => void;
  onDeny?: (requestId: string, notes?: string) => void;
}

export default function ShiftApproval({ onApprove, onDeny }: ShiftApprovalProps) {
  const [requests, setRequests] = useState<ShiftRequest[]>(mockRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState<{ requestId: string; action: 'approve' | 'deny' } | null>(null);

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return req.requesterName.toLowerCase().includes(search) ||
             req.requesterRole.toLowerCase().includes(search) ||
             req.reason.toLowerCase().includes(search);
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const handleAction = (action: 'approve' | 'deny') => {
    if (showNotesModal) {
      const updatedRequests = requests.map(req => {
        if (req.id === showNotesModal.requestId) {
          return {
            ...req,
            status: action === 'approve' ? 'approved' as const : 'denied' as const,
            managerNotes,
            approvedBy: action === 'approve' ? 'Current Manager' : undefined,
            approvedAt: action === 'approve' ? new Date().toISOString() : undefined
          };
        }
        return req;
      });
      setRequests(updatedRequests);
      
      if (action === 'approve') {
        onApprove?.(showNotesModal.requestId, managerNotes);
      } else {
        onDeny?.(showNotesModal.requestId, managerNotes);
      }
      
      setShowNotesModal(null);
      setManagerNotes('');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swap': return 'bg-blue-100 text-blue-700';
      case 'add': return 'bg-green-100 text-green-700';
      case 'change': return 'bg-yellow-100 text-yellow-700';
      case 'cancel': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'denied': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Shift Requests</h3>
              {pendingCount > 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} require attention
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`p-4 hover:bg-gray-50 ${selectedRequest === request.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {request.requesterName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium">{request.requesterName}</h4>
                      <p className="text-xs text-gray-500">{request.requesterRole}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(request.type)}`}>
                      {request.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="ml-13 space-y-2">
                    {request.type === 'swap' && request.swapWith && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{moment(request.originalShift?.date).format('MMM D')} → </span>
                          <span className="font-medium">{request.swapWith.staffName}</span>
                          <span>({request.swapWith.shiftDate})</span>
                        </div>
                      </div>
                    )}

                    {request.type === 'change' && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="line-through text-gray-400">
                            {request.originalShift?.startTime} - {request.originalShift?.endTime}
                          </span>
                          <span>→</span>
                          <span className="font-medium text-green-600">
                            {request.requestedShift?.startTime} - {request.requestedShift?.endTime}
                          </span>
                        </div>
                      </div>
                    )}

                    {request.type === 'add' && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {moment(request.requestedShift?.date).format('MMM D, YYYY')}
                          </span>
                          <span>
                            {request.requestedShift?.startTime} - {request.requestedShift?.endTime}
                          </span>
                          <span className="text-gray-500">@ {request.requestedShift?.location}</span>
                        </div>
                      </div>
                    )}

                    {request.type === 'cancel' && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span>Cancel shift on</span>
                          <span className="font-medium">
                            {moment(request.originalShift?.date).format('MMM D')}
                          </span>
                          <span>
                            ({request.originalShift?.startTime} - {request.originalShift?.endTime})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{request.reason}</p>
                        {request.managerNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-xs font-medium text-gray-500">Manager Notes:</p>
                            <p className="text-xs text-gray-700 mt-1">{request.managerNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Requested {moment(request.createdAt).fromNow()}</span>
                      {request.approvedBy && (
                        <>
                          <span>•</span>
                          <span>
                            {request.status === 'approved' ? 'Approved' : 'Denied'} by {request.approvedBy}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setShowNotesModal({ requestId: request.id, action: 'approve' })}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowNotesModal({ requestId: request.id, action: 'deny' })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No shift requests found</p>
          </div>
        )}
      </div>

      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {showNotesModal.action === 'approve' ? 'Approve' : 'Deny'} Shift Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager Notes (Optional)
              </label>
              <textarea
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Add any notes about this decision..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNotesModal(null);
                  setManagerNotes('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showNotesModal.action)}
                className={`px-4 py-2 rounded-md text-white ${
                  showNotesModal.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {showNotesModal.action === 'approve' ? 'Approve' : 'Deny'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}