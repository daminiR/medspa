'use client';

/**
 * Forms List Page (Web)
 * Displays available forms for the patient to complete.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { formService } from '@/lib/forms';
import type { FormAssignment, PatientFormRequirements } from '@medical-spa/types';

type TabType = 'pending' | 'completed';

export default function FormsListPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [requirements, setRequirements] = useState<PatientFormRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    try {
      setError(null);
      const data = await formService.getPatientFormRequirements('current-patient-id');
      setRequirements(data);
    } catch (err) {
      setError('Failed to load forms. Please try again.');
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadForms();
      setIsLoading(false);
    };
    load();
  }, [loadForms]);

  const pendingForms = useMemo(() => {
    if (!requirements) return [];
    return [...requirements.requiredForms, ...requirements.optionalForms]
      .filter(f => f.status === 'pending' || f.status === 'in_progress');
  }, [requirements]);

  const completedForms = useMemo(() => {
    if (!requirements) return [];
    return requirements.completedForms;
  }, [requirements]);

  const displayedForms = activeTab === 'pending' ? pendingForms : completedForms;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms</h1>
          <p className="text-gray-600">Complete your required forms before your appointment</p>
        </div>

        {/* Stats Card */}
        {requirements && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{requirements.totalCompleted}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{requirements.totalRequired - requirements.totalCompleted}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{Math.round(requirements.completionPercentage)}%</p>
                  <p className="text-sm text-gray-500">Complete</p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: requirements.completionPercentage + '%' }}
              />
            </div>
            {requirements.upcomingAppointment && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {requirements.allRequiredComplete
                  ? 'All forms complete for your appointment'
                  : 'Complete forms before ' + new Date(requirements.upcomingAppointment.date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingForms.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed ({completedForms.length})
          </button>
          <Link
            href="/forms/history"
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button onClick={loadForms} className="mt-2 text-red-600 font-medium hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && displayedForms.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === 'pending' ? 'All caught up!' : 'No completed forms'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending'
                ? "You've completed all required forms."
                : 'Completed forms will appear here.'}
            </p>
          </div>
        )}

        {/* Forms List */}
        <div className="space-y-3">
          {displayedForms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FormCard({ form }: { form: FormAssignment }) {
  const formDetails = formService.getFormDetailsSync(form.formId);

  const getStatusConfig = () => {
    switch (form.status) {
      case 'pending':
        return { color: 'text-amber-600 bg-amber-50', label: 'Not Started' };
      case 'in_progress':
        return { color: 'text-purple-600 bg-purple-50', label: 'In Progress' };
      case 'completed':
        return { color: 'text-green-600 bg-green-50', label: 'Completed' };
      default:
        return { color: 'text-gray-600 bg-gray-50', label: form.status };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Link
      href={'/forms/' + form.formId}
      className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          form.status === 'completed' ? 'bg-green-100' : form.status === 'in_progress' ? 'bg-purple-100' : 'bg-amber-100'
        }`}>
          <svg className={`w-6 h-6 ${
            form.status === 'completed' ? 'text-green-600' : form.status === 'in_progress' ? 'text-purple-600' : 'text-amber-600'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{formDetails?.name || 'Form'}</h3>
            {form.priority === 'critical' && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded">Required</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{formDetails?.description || 'Please complete this form'}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 rounded ${statusConfig.color}`}>{statusConfig.label}</span>
            {formDetails?.schema?.metadata?.estimatedMinutes && (
              <span className="text-gray-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{formDetails.schema.metadata.estimatedMinutes} min
              </span>
            )}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
