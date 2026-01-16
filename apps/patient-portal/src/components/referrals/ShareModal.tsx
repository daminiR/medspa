'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  MessageSquare,
  Mail,
  Facebook,
  Linkedin,
  Link,
  Check,
  Share2,
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  shareUrl: string;
  onShare?: (method: string) => void;
}

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  method: 'SMS' | 'WHATSAPP' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'EMAIL';
}

export default function ShareModal({
  isOpen,
  onClose,
  referralCode,
  shareUrl,
  onShare,
}: ShareModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API is available
    if (typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined') {
      setCanShare(true);
    }
  }, []);

  const shareOptions: ShareOption[] = [
    {
      id: 'sms',
      icon: <MessageSquare className="w-6 h-6" />,
      label: 'SMS',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      textColor: 'text-emerald-600',
      method: 'SMS',
    },
    {
      id: 'whatsapp',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: 'WhatsApp',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-600',
      method: 'WHATSAPP',
    },
    {
      id: 'facebook',
      icon: <Facebook className="w-6 h-6" />,
      label: 'Facebook',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-600',
      method: 'FACEBOOK',
    },
    {
      id: 'twitter',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: 'X (Twitter)',
      bgColor: 'bg-gray-100',
      hoverColor: 'hover:bg-gray-200',
      textColor: 'text-gray-800',
      method: 'TWITTER',
    },
    {
      id: 'linkedin',
      icon: <Linkedin className="w-6 h-6" />,
      label: 'LinkedIn',
      bgColor: 'bg-sky-50',
      hoverColor: 'hover:bg-sky-100',
      textColor: 'text-sky-700',
      method: 'LINKEDIN',
    },
    {
      id: 'email',
      icon: <Mail className="w-6 h-6" />,
      label: 'Email',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
      textColor: 'text-amber-600',
      method: 'EMAIL',
    },
  ];

  const getShareMessage = (method: ShareOption['method']): string => {
    const messages: Record<ShareOption['method'], string> = {
      SMS: `Try Luxe MedSpa! Use my code ${referralCode} for $25 off your first service. They're amazing! ${shareUrl}`,
      EMAIL: `Hi!\n\nI thought you'd love Luxe MedSpa! They have incredible treatments and amazing results.\n\nUse my referral code ${referralCode} to get $25 off your first service, and I'll earn a credit too!\n\nBook your appointment here: ${shareUrl}\n\nYou're going to love it!`,
      WHATSAPP: `Try Luxe MedSpa! Use my code ${referralCode} for $25 off. They're amazing! ${shareUrl}`,
      FACEBOOK: `Just tried Luxe MedSpa and the results are incredible! Use my code ${referralCode} for $25 off your first service. ${shareUrl}`,
      TWITTER: `Get $25 off @LuxeMedSpa with my code ${referralCode}! Amazing treatments and results. ${shareUrl}`,
      LINKEDIN: `I've been loving my treatments at Luxe MedSpa! Use my referral code ${referralCode} for $25 off your first visit. ${shareUrl}`,
    };
    return messages[method];
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      onShare?.('COPY_CODE');
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      onShare?.('COPY_LINK');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get $25 off at Luxe MedSpa!',
          text: getShareMessage('SMS'),
          url: shareUrl,
        });
        onShare?.('NATIVE');
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error);
      }
    }
  };

  const handleShare = async (option: ShareOption) => {
    const message = getShareMessage(option.method);

    try {
      switch (option.method) {
        case 'SMS':
          window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
          break;

        case 'EMAIL':
          window.open(
            `mailto:?subject=${encodeURIComponent('Get $25 off at Luxe MedSpa!')}&body=${encodeURIComponent(message)}`,
            '_blank'
          );
          break;

        case 'WHATSAPP':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(message)}`,
            '_blank'
          );
          break;

        case 'FACEBOOK':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`,
            '_blank'
          );
          break;

        case 'TWITTER':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
            '_blank'
          );
          break;

        case 'LINKEDIN':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
          break;
      }

      onShare?.(option.method);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Referral Code Display */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Your Referral Code
            </p>
            <div className="flex items-center justify-between bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <span className="text-2xl font-bold text-purple-600 tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Native Share Button (if available) */}
          {canShare && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Now
            </Button>
          )}

          {/* Share Options Grid */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-4">
              Share via
            </p>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-colors ${option.bgColor} ${option.hoverColor}`}
                >
                  <div className={option.textColor}>{option.icon}</div>
                  <span
                    className={`mt-2 text-xs font-medium ${option.textColor}`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-semibold">
                  Link Copied!
                </span>
              </>
            ) : (
              <>
                <Link className="w-5 h-5 text-purple-600" />
                <span className="text-purple-600 font-semibold">
                  Copy Referral Link
                </span>
              </>
            )}
          </button>

          {/* QR Code Section */}
          <div className="border-t pt-6">
            <QRCodeDisplay referralCode={referralCode} shareUrl={shareUrl} />
          </div>

          {/* Message Preview */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Message Preview
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {getShareMessage('SMS')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
