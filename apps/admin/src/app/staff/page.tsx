'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import StaffList from '@/components/staff/StaffListOptimized';
import StaffDetail from '@/components/staff/StaffDetail';
import StaffForm from '@/components/staff/StaffForm';
import ShiftApproval from '@/components/staff/ShiftApproval';
import ScheduleTemplates from '@/components/staff/ScheduleTemplates';
import StaffPendingWidget from '@/components/staff/StaffPendingWidget';
import { getStaffById } from '@/lib/data/staffGenerator';
import { StaffMember } from '@/types/staff';
import { BarChart3, Calendar, Clock, Users } from 'lucide-react';

export default function StaffPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeView, setActiveView] = useState<'directory' | 'approvals' | 'templates' | 'metrics'>('directory');
  const [staffUpdatedMessage, setStaffUpdatedMessage] = useState<string | null>(null);

  const selectedStaff = selectedStaffId ? getStaffById(selectedStaffId) : null;

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  const handleCloseDetail = () => {
    setSelectedStaffId(null);
  };

  const handleAddStaff = () => {
    setShowAddForm(true);
  };

  const handleEditStaff = () => {
    setShowEditForm(true);
  };

  const handleDeleteStaff = () => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      console.log('Delete staff:', selectedStaffId);
      setSelectedStaffId(null);
      setStaffUpdatedMessage('Staff member removed successfully');
      setTimeout(() => setStaffUpdatedMessage(null), 3000);
    }
  };

  const handleSaveStaff = (data: Partial<StaffMember>) => {
    console.log('Save staff:', data);
    setShowAddForm(false);
    setShowEditForm(false);
    setStaffUpdatedMessage('Staff member saved successfully');
    setTimeout(() => setStaffUpdatedMessage(null), 3000);
  };

  const handleApplyTemplate = (template: any, staffIds: string[]) => {
    console.log('Apply template:', template, 'to staff:', staffIds);
    setStaffUpdatedMessage(`Schedule template "${template.name}" applied to ${staffIds.length} staff member(s)`);
    setTimeout(() => setStaffUpdatedMessage(null), 3000);
  };

  const viewTabs = [
    { id: 'directory', label: 'Staff Directory', icon: Users },
    { id: 'approvals', label: 'Shift Approvals', icon: Clock },
    { id: 'templates', label: 'Schedule Templates', icon: Calendar },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage your team members, schedules, and permissions</p>
        </div>

        {staffUpdatedMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center justify-between">
            <span>{staffUpdatedMessage}</span>
            <button 
              onClick={() => setStaffUpdatedMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {!selectedStaff && (
          <>
            <StaffPendingWidget
              onViewShifts={() => setActiveView('approvals')}
              onViewTimeOff={() => setActiveView('directory')}
              onViewOnboarding={() => setActiveView('directory')}
              onViewTraining={() => setActiveView('directory')}
            />
            
            <div className="flex items-center gap-2 mb-4">
              {viewTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            </div>
          </>
        )}

        {selectedStaff ? (
          <StaffDetail
            staff={selectedStaff}
            onClose={handleCloseDetail}
            onEdit={handleEditStaff}
            onDelete={handleDeleteStaff}
          />
        ) : (
          <>
            {activeView === 'directory' && (
              <StaffList
                onSelectStaff={handleSelectStaff}
                onAddStaff={handleAddStaff}
              />
            )}
            
            {activeView === 'approvals' && (
              <ShiftApproval
                onApprove={(id, notes) => console.log('Approved:', id, notes)}
                onDeny={(id, notes) => console.log('Denied:', id, notes)}
              />
            )}
            
            {activeView === 'templates' && (
              <div>
                {selectedStaffIds.length === 0 && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    💡 Tip: Select staff members from the directory first, then apply templates to them
                  </div>
                )}
                <ScheduleTemplates
                  onApplyTemplate={handleApplyTemplate}
                  selectedStaffIds={selectedStaffIds}
                />
              </div>
            )}
            
            {activeView === 'metrics' && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Staff Metrics</h3>
                  <p className="text-sm">Performance metrics and analytics coming soon</p>
                </div>
              </div>
            )}
          </>
        )}

        {showAddForm && (
          <StaffForm
            onSave={handleSaveStaff}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {showEditForm && selectedStaff && (
          <StaffForm
            staff={selectedStaff}
            onSave={handleSaveStaff}
            onCancel={() => setShowEditForm(false)}
          />
        )}
      </div>
    </div>
  );
}