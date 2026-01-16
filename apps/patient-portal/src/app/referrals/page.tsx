'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Share2, QrCode } from 'lucide-react';
import {
  ShareModal,
  QRCodeDisplay,
  ReferralMilestones,
  ReferralStats,
} from '@/components/referrals';

// Mock data - in production this would come from an API
const mockReferralData = {
  referralCode: 'SARAH2025',
  shareUrl: 'https://luxemedspa.com/r/SARAH2025',
  totalReferred: 12,
  completed: 10,
  pending: 2,
  totalPointsEarned: 6000,
  referralHistory: [
    { name: 'Emily Davis', date: '2025-11-15', points: 500, status: 'Complete' as const },
    { name: 'Mike Wilson', date: '2025-11-10', points: 500, status: 'Complete' as const },
    { name: 'Jennifer Smith', date: '2025-11-05', points: 500, status: 'Complete' as const },
    { name: 'Robert Johnson', date: '2025-10-28', points: 500, status: 'Complete' as const },
    { name: 'Lisa Brown', date: '2025-12-01', points: 0, status: 'Pending' as const },
    { name: 'David Lee', date: '2025-12-10', points: 0, status: 'Pending' as const },
  ],
};

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const {
    referralCode,
    shareUrl,
    totalReferred,
    completed,
    pending,
    totalPointsEarned,
    referralHistory,
  } = mockReferralData;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (method: string) => {
    console.log('Shared via:', method);
    // In production, this would track the share event
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Referral Program</h1>

      {/* Hero Card with Share CTA */}
      <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Refer Friends, Earn Rewards
          </CardTitle>
          <p className="text-purple-100">
            Share your referral code and get 500 points for each friend who books!
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-100 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-white text-gray-900 font-mono text-2xl font-bold"
              />
              <Button variant="secondary" size="icon" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-200 mt-2">Copied to clipboard!</p>
            )}
          </div>

          {/* Main Share Button */}
          <Button
            onClick={() => setShareModalOpen(true)}
            className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold py-6 text-lg mb-3"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Now
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setShowQRCode(!showQRCode)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQRCode ? 'Hide QR' : 'Show QR'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              All Channels
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section (Toggleable) */}
      {showQRCode && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <QRCodeDisplay referralCode={referralCode} shareUrl={shareUrl} />
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Stats</h2>
        <ReferralStats
          totalReferred={totalReferred}
          completed={completed}
          pending={pending}
          totalPointsEarned={totalPointsEarned}
        />
      </div>

      {/* Milestones Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Milestones & Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralMilestones totalReferrals={completed} />
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referralHistory.map((referral, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {referral.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{referral.name}</p>
                    <p className="text-sm text-gray-600">{referral.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      referral.status === 'Complete'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {referral.status === 'Complete'
                      ? `+${referral.points} pts`
                      : 'Pending'}
                  </p>
                  <p
                    className={`text-xs ${
                      referral.status === 'Complete'
                        ? 'text-green-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {referral.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {referralHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Share your code to start earning rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        referralCode={referralCode}
        shareUrl={shareUrl}
        onShare={handleShare}
      />
    </div>
  );
}
