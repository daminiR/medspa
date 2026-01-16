'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, MessageSquare } from 'lucide-react';

interface ConsentStatus {
  transactional: boolean;
  marketing: boolean;
  optedOutAt?: Date;
  consentGivenAt?: Date;
}

interface ConsentBannerProps {
  patientId: string;
  consentStatus: ConsentStatus;
  onRequestConsent?: () => void | Promise<void>;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  patientId,
  consentStatus,
  onRequestConsent,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestConsent = async () => {
    try {
      setIsRequesting(true);
      if (onRequestConsent) {
        await onRequestConsent();
      }
      setRequestSent(true);
      // Reset the message after 3 seconds
      setTimeout(() => setRequestSent(false), 3000);
    } catch (error) {
      console.error('Error requesting consent:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Determine banner state and styling
  const isOptedOut = consentStatus.optedOutAt;
  const hasFullConsent =
    consentStatus.transactional && consentStatus.marketing;
  const hasTransactionalOnly =
    consentStatus.transactional && !consentStatus.marketing;

  let bannerConfig = {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    icon: XCircle,
    iconColor: 'text-red-500',
    buttonColor:
      'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400',
    title: 'SMS Opted Out',
    description: `Patient opted out of all SMS communications on ${formatDate(
      consentStatus.optedOutAt
    )}`,
    showRequestButton: false,
  };

  if (!isOptedOut && hasFullConsent) {
    bannerConfig = {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      buttonColor:
        'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400',
      title: 'SMS Enabled',
      description: `Transactional & Marketing consent given on ${formatDate(
        consentStatus.consentGivenAt
      )}`,
      showRequestButton: false,
    };
  } else if (!isOptedOut && hasTransactionalOnly) {
    bannerConfig = {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      buttonColor:
        'bg-yellow-600 hover:bg-yellow-700 text-white disabled:bg-yellow-400',
      title: 'Transactional Only',
      description:
        'Patient consented to appointment reminders only. No marketing messages can be sent.',
      showRequestButton: true,
    };
  }

  const IconComponent = bannerConfig.icon;

  return (
    <div
      className={`border-l-4 rounded-lg p-4 ${bannerConfig.bgColor} ${bannerConfig.borderColor} ${bannerConfig.textColor}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <IconComponent className={`w-5 h-5 ${bannerConfig.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-sm">{bannerConfig.title}</h3>
            <p className="text-sm opacity-90">{bannerConfig.description}</p>

            {/* Consent Details */}
            {!isOptedOut && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Transactional Status */}
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        consentStatus.transactional
                          ? 'bg-green-600'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span>
                      {consentStatus.transactional
                        ? 'Appointment reminders: Enabled'
                        : 'Appointment reminders: Disabled'}
                    </span>
                  </div>

                  {/* Marketing Status */}
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        consentStatus.marketing
                          ? 'bg-green-600'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span>
                      {consentStatus.marketing
                        ? 'Marketing messages: Enabled'
                        : 'Marketing messages: Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Request Consent Button */}
          {bannerConfig.showRequestButton && (
            <div className="mt-4">
              <button
                onClick={handleRequestConsent}
                disabled={isRequesting || requestSent}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${bannerConfig.buttonColor} disabled:cursor-not-allowed`}
              >
                {requestSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Request sent!
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    {isRequesting ? 'Sending...' : 'Request Marketing Consent'}
                  </>
                )}
              </button>
              <p className="text-xs opacity-75 mt-2">
                Patient will receive an SMS to opt in to marketing messages
              </p>
            </div>
          )}
        </div>

        {/* Additional Info Badge */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-white bg-opacity-40">
            TCPA Compliant
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
