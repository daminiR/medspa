'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Calendar,
  Shield,
  Camera,
  Syringe,
  CreditCard,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formService } from '@/lib/forms/formService';

interface FormAssignment {
  id: string;
  formId: string;
  patientId: string;
  appointmentId?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedAt: string;
  remindersSent: number;
}

interface PatientFormRequirements {
  patientId: string;
  upcomingAppointment?: { id: string; date: string; serviceName: string; };
  requiredForms: FormAssignment[];
  optionalForms: FormAssignment[];
  completedForms: FormAssignment[];
  totalRequired: number;
  totalCompleted: number;
  completionPercentage: number;
  allRequiredComplete: boolean;
}

const getFormIcon = (formId: string) => {
  if (formId.includes('medical-intake')) return FileText;
  if (formId.includes('hipaa')) return Shield;
  if (formId.includes('photo')) return Camera;
  if (formId.includes('botox') || formId.includes('consent')) return Syringe;
  if (formId.includes('payment')) return CreditCard;
  return FileText;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'in_progress': return 'text-blue-600';
    case 'pending': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

export default function FormsPage() {
  const [requirements, setRequirements] = useState<PatientFormRequirements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await formService.getPatientFormRequirements('current-patient-id');
        setRequirements(data);
      } catch (error) {
        console.error('Failed to load form requirements:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Unable to load forms</h2>
          <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const allForms = [...requirements.requiredForms, ...requirements.optionalForms];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Forms</h1>
        <p className="text-gray-600 mt-2">Complete required forms before your appointment</p>
      </div>

      {requirements.upcomingAppointment && (
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Upcoming Appointment</p>
                <p className="text-xl font-bold mt-1">{requirements.upcomingAppointment.serviceName}</p>
                <div className="flex items-center gap-2 mt-2 text-purple-100">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(requirements.upcomingAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{Math.round(requirements.completionPercentage)}%</div>
                <p className="text-purple-100 text-sm">Forms Complete</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-purple-400 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${requirements.completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!requirements.allRequiredComplete && requirements.requiredForms.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700 mt-1">
              Please complete all required forms before your appointment. 
              You have {requirements.requiredForms.length} form{requirements.requiredForms.length > 1 ? 's' : ''} pending.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Forms</CardTitle>
            <span className="text-sm text-gray-500">{allForms.length} form{allForms.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {allForms.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All forms completed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allForms.map((assignment) => {
                const formDetails = formService.getFormDetailsSync(assignment.formId);
                const Icon = getFormIcon(assignment.formId);
                
                return (
                  <Link key={assignment.id} href={`/forms/${assignment.formId}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50/50 transition-colors cursor-pointer">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        assignment.priority === 'critical' ? 'bg-purple-100' : 'bg-gray-100'
                      )}>
                        <Icon className={cn(
                          'w-6 h-6',
                          assignment.priority === 'critical' ? 'text-purple-600' : 'text-gray-600'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {formDetails?.name || 'Unknown Form'}
                          </h3>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full border',
                            getPriorityColor(assignment.priority)
                          )}>
                            {assignment.priority === 'critical' ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className={getStatusColor(assignment.status)}>
                            {assignment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </span>
                          {formDetails?.schema.metadata.estimatedMinutes && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formDetails.schema.metadata.estimatedMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/forms/history">
          <Button variant="outline" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            View Completed Forms
          </Button>
        </Link>
      </div>
    </div>
  );
}
