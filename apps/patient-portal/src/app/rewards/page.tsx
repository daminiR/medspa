'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Star, Award } from 'lucide-react';

export default function RewardsPage() {
  const userPoints = 1250;

  const rewards = [
    { id: 1, name: '$25 Off Next Service', points: 500, available: true },
    { id: 2, name: 'Free Hydrafacial Add-on', points: 1000, available: true },
    { id: 3, name: '$50 Off Any Service', points: 1500, available: false },
    { id: 4, name: 'Complimentary Consultation', points: 2000, available: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Rewards Center</h1>

      <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6 text-center">
          <Award className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
          <p className="text-lg text-purple-100 mb-2">Your Points Balance</p>
          <p className="text-5xl font-bold mb-4">{userPoints}</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">Gold</p>
              <p className="text-sm text-purple-100">Membership Tier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Available Rewards</h2>
      <div className="grid gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className={reward.available ? '' : 'opacity-60'}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{reward.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {reward.points} points
                  </p>
                </div>
              </div>
              <Button
                disabled={!reward.available}
                variant={reward.available ? 'default' : 'outline'}
              >
                {reward.available ? 'Redeem' : 'Locked'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
