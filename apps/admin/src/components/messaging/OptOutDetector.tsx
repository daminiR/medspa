'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import { extractOptOutDetails, OptOutType } from '@/utils/optOutDetector';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: Date;
  status: string;
  channel: string;
}

interface OptOutDetectorProps {
  message?: string;
  messages?: Message[];
  onOptOutDetected?: (keyword: string, type: OptOutType) => void | Promise<void>;
  patientId?: string;
  patientName?: string;
  onOptOutProcessed?: () => void | Promise<void>;
  onReviewRequired?: (keyword: string) => void | Promise<void>;
}

interface OptOutState {
  isOptOut: boolean;
  keyword: string | null;
  type: OptOutType;
  requiresReview: boolean;
  confidence: 'high' | 'medium' | 'low';
  isProcessing: boolean;
  isProcessed: boolean;
  error: string | null;
}

interface ConfirmationModalState {
  isOpen: boolean;
  keyword: string | null;
}

export const OptOutDetector: React.FC<OptOutDetectorProps> = ({
  message,
  messages,
  onOptOutDetected,
  patientId,
  patientName = 'Patient',
  onOptOutProcessed,
  onReviewRequired,
}) => {
  const [optOutState, setOptOutState] = useState<OptOutState>({
    isOptOut: false,
    keyword: null,
    type: null,
    requiresReview: false,
    confidence: 'low',
    isProcessing: false,
    isProcessed: false,
    error: null,
  });

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    isOpen: false,
    keyword: null,
  });

  // Get the message to check - either from message prop or last message in messages array
  const messageToCheck = message || (messages && messages.length > 0 ? messages[messages.length - 1]?.text : '');

  // Detect opt-out keywords when message changes
  useEffect(() => {
    if (messageToCheck && messageToCheck.trim()) {
      const result = extractOptOutDetails(messageToCheck);

      if (result.isOptOut) {
        // Log for compliance with type information
        console.log(
          `[COMPLIANCE LOG] Opt-out detected: "${result.keyword}" (type: ${result.type}, confidence: ${result.confidence}) in message from ${patientId || 'unknown patient'}`,
          {
            timestamp: new Date().toISOString(),
            keyword: result.keyword,
            type: result.type,
            confidence: result.confidence,
            requiresReview: result.requiresReview,
            patientId,
            messageLength: messageToCheck.length,
          }
        );

        // Update state
        setOptOutState({
          isOptOut: true,
          keyword: result.keyword,
          type: result.type,
          requiresReview: result.requiresReview,
          confidence: result.confidence,
          isProcessing: false,
          isProcessed: false,
          error: null,
        });

        // Call appropriate callback based on type
        if (result.keyword) {
          if (result.requiresReview && onReviewRequired) {
            try {
              onReviewRequired(result.keyword);
            } catch (error) {
              console.error('Error in onReviewRequired callback:', error);
            }
          } else if (onOptOutDetected) {
            try {
              onOptOutDetected(result.keyword, result.type);
            } catch (error) {
              console.error('Error in onOptOutDetected callback:', error);
            }
          }
        }
      } else {
        // Reset state if no opt-out keyword
        setOptOutState({
          isOptOut: false,
          keyword: null,
          type: null,
          requiresReview: false,
          confidence: 'low',
          isProcessing: false,
          isProcessed: false,
          error: null,
        });
      }
    } else {
      // Reset state if message is empty
      setOptOutState({
        isOptOut: false,
        keyword: null,
        type: null,
        requiresReview: false,
        confidence: 'low',
        isProcessing: false,
        isProcessed: false,
        error: null,
      });
    }
  }, [messageToCheck, onOptOutDetected, onReviewRequired, patientId]);

  const handleProcessOptOut = async () => {
    if (!optOutState.keyword) return;

    try {
      setOptOutState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
      }));

      // Log compliance action
      console.log(
        `[COMPLIANCE LOG] Processing opt-out request`,
        {
          timestamp: new Date().toISOString(),
          keyword: optOutState.keyword,
          patientId,
          patientName,
          action: 'OPT_OUT_PROCESSED',
        }
      );

      // Simulate API call (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mark as processed
      setOptOutState(prev => ({
        ...prev,
        isProcessing: false,
        isProcessed: true,
      }));

      // Close confirmation modal
      setConfirmationModal({
        isOpen: false,
        keyword: null,
      });

      // Call callback if provided
      if (onOptOutProcessed) {
        try {
          await onOptOutProcessed();
        } catch (error) {
          console.error('Error in onOptOutProcessed callback:', error);
          setOptOutState(prev => ({
            ...prev,
            error: 'Failed to process opt-out. Please try again.',
          }));
        }
      }
    } catch (error) {
      console.error('Error processing opt-out:', error);
      setOptOutState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'An error occurred while processing the opt-out request.',
      }));
    }
  };

  const openConfirmationModal = () => {
    setConfirmationModal({
      isOpen: true,
      keyword: optOutState.keyword,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      keyword: null,
    });
  };

  // Don't render anything if no opt-out detected
  if (!optOutState.isOptOut) {
    return null;
  }

  // Show success state
  if (optOutState.isProcessed) {
    return (
      <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-green-900">
              Opt-Out Processed
            </h3>
            <p className="mt-1 text-sm text-green-800">
              {patientName} has been successfully removed from SMS communications.
              This action has been logged for TCPA compliance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine colors based on type (standard = red/urgent, informal = amber/review)
  const isInformal = optOutState.type === 'informal';
  const borderColor = isInformal ? 'border-amber-500' : 'border-red-500';
  const bgColor = isInformal ? 'bg-amber-50' : 'bg-red-50';
  const textColor = isInformal ? 'text-amber-900' : 'text-red-900';
  const textColorSecondary = isInformal ? 'text-amber-800' : 'text-red-800';
  const accentColor = isInformal ? 'text-amber-600' : 'text-red-600';
  const buttonBg = isInformal ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400';

  // Show alert banner
  return (
    <>
      {/* Alert Banner */}
      <div className={`rounded-lg border-l-4 ${borderColor} ${bgColor} p-4`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 pt-0.5">
            {isInformal ? (
              <Eye className={`h-5 w-5 ${accentColor}`} />
            ) : (
              <AlertTriangle className={`h-5 w-5 ${accentColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${textColor}`}>
              {isInformal ? 'Possible Opt-Out Detected - Review Required' : 'Opt-Out Request Detected'}
            </h3>
            <p className={`mt-1 text-sm ${textColorSecondary}`}>
              {isInformal ? (
                <>
                  The message contains the phrase "<span className="font-medium">{optOutState.keyword}</span>" which
                  may indicate an opt-out request. Please review before processing.
                </>
              ) : (
                <>
                  The message contains the keyword "<span className="font-medium">{optOutState.keyword}</span>" which indicates
                  an opt-out request for SMS communications.
                </>
              )}
            </p>

            {/* Details */}
            <div className="mt-3 rounded-md bg-white bg-opacity-50 p-3">
              <div className={`space-y-2 text-sm ${textColorSecondary}`}>
                <div className="flex justify-between">
                  <span className="font-medium">Patient:</span>
                  <span>{patientName}</span>
                </div>
                {patientId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Patient ID:</span>
                    <span className="font-mono text-xs">{patientId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">{isInformal ? 'Phrase Detected:' : 'Keyword Detected:'}</span>
                  <span className={`font-mono font-semibold ${accentColor}`}>
                    {optOutState.keyword}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Detection Type:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isInformal
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isInformal ? 'Informal (needs review)' : 'Standard (carrier keyword)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    optOutState.confidence === 'high'
                      ? 'bg-red-100 text-red-800'
                      : optOutState.confidence === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {optOutState.confidence.charAt(0).toUpperCase() + optOutState.confidence.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Required Notice */}
            <div className={`mt-3 rounded-md border ${isInformal ? 'border-amber-200 bg-amber-100' : 'border-red-200 bg-red-100'} bg-opacity-50 p-2`}>
              <p className={`text-xs font-medium ${textColor}`}>
                {isInformal ? (
                  <>
                    <AlertCircle className="inline h-3 w-3 mr-1" />
                    Review Required: This appears to be an informal opt-out request. Please verify the patient's intent before processing.
                  </>
                ) : (
                  'Action Required: This opt-out must be processed to remain TCPA compliant.'
                )}
              </p>
            </div>

            {/* Error Message */}
            {optOutState.error && (
              <div className="mt-3 rounded-md border border-orange-300 bg-orange-50 p-2">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 flex-shrink-0 text-orange-600 mt-0.5" />
                  <p className="text-xs text-orange-800">{optOutState.error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              {isInformal && (
                <button
                  onClick={() => setOptOutState(prev => ({ ...prev, isOptOut: false }))}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Dismiss (Not an Opt-Out)
                </button>
              )}
              <button
                onClick={openConfirmationModal}
                disabled={optOutState.isProcessing}
                className={`inline-flex items-center gap-2 rounded-md ${buttonBg} px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed transition-colors`}
              >
                {optOutState.isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {isInformal ? 'Confirm & Process Opt-Out' : 'Process Opt-Out'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          {/* Modal Background */}
          <div className="absolute inset-0" onClick={closeConfirmationModal} />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirm Opt-Out
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  You are about to process an opt-out request for:
                </p>
                <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                  <p className="font-medium text-gray-900">{patientName}</p>
                  {patientId && (
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {patientId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  This action will:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Remove the patient from all SMS communication lists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Log this action for TCPA compliance (permanent record)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>Prevent any future marketing or transactional SMS messages</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Note:</span> This action is permanent
                  and cannot be easily reversed. The patient can only be re-contacted
                  if they explicitly opt back in.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closeConfirmationModal}
                disabled={optOutState.isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessOptOut}
                disabled={optOutState.isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
              >
                {optOutState.isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Yes, Process Opt-Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptOutDetector;
