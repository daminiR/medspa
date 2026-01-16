'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle2, 
  Calendar,
  Download,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Camera,
  Syringe,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formService } from '@/lib/forms/formService';

interface FormSubmission {
  id: string;
  formId: string;
  formVersion: string;
  patientId: string;
  status: string;
  responses: unknown[];
  signatures: unknown[];
  progress: number;
  startedAt: string;
  lastSavedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  pdfUrl?: string;
}

const getFormIcon = (formId: string) => {
  if (formId.includes('medical-intake')) return FileText;
  if (formId.includes('hipaa')) return Shield;
  if (formId.includes('photo')) return Camera;
  if (formId.includes('botox') || formId.includes('consent')) return Syringe;
  if (formId.includes('payment')) return CreditCard;
  return FileText;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function FormsHistoryPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await formService.getFormHistory('current-patient-id');
        setSubmissions(response.submissions);
      } catch (error) {
        console.error('Failed to load form history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/forms">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Completed Forms</h1>
          <p className="text-gray-600 mt-1">View and download your submitted forms</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Completed Forms</h3>
              <p className="text-gray-500 mb-6">You haven&apos;t submitted any forms yet.</p>
              <Link href="/forms">
                <Button>View Pending Forms</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.map((submission) => {
                const formDetails = formService.getFormDetailsSync(submission.formId);
                const Icon = getFormIcon(submission.formId);

                return (
                  <div 
                    key={submission.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-gray-50/50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {formDetails?.name || 'Unknown Form'}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Completed {submission.completedAt ? formatDate(submission.completedAt) : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.pdfUrl && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={submission.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Need to update your information?</p>
            <p className="text-sm text-blue-700 mt-1">
              If you need to make changes to a previously submitted form, please contact our office at (555) 123-4567 or ask during your next visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
