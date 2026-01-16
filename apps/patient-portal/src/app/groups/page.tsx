'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GroupCard } from '@/components/groups';
import {
  getPatientGroupBookings,
  currentPatient,
} from '@/lib/groups/groupService';

export default function GroupsPage() {
  const [filter, setFilter] = useState<'all' | 'coordinator' | 'participant'>('all');
  const [searchCode, setSearchCode] = useState('');

  const groups = getPatientGroupBookings(currentPatient.id);

  const filteredGroups = groups.filter((group) => {
    if (filter === 'coordinator') {
      return group.coordinatorPatientId === currentPatient.id;
    }
    if (filter === 'participant') {
      return group.coordinatorPatientId !== currentPatient.id;
    }
    return true;
  });

  const coordinatorCount = groups.filter(
    (g) => g.coordinatorPatientId === currentPatient.id
  ).length;
  const participantCount = groups.filter(
    (g) => g.coordinatorPatientId !== currentPatient.id
  ).length;

  const handleJoinByCode = () => {
    if (searchCode.trim()) {
      window.location.href = '/groups/join/' + searchCode.trim().toUpperCase();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Group Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage your group spa appointments
          </p>
        </div>
        <Link href="/booking?mode=group">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Join by Code */}
      <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Have a group code?</h3>
              <p className="text-sm text-gray-600">
                Enter the booking code shared by your group coordinator to join
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., SARAH2)"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-48"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleJoinByCode} disabled={!searchCode.trim()}>
                Join Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Users className="w-4 h-4 mr-2" />
          All ({groups.length})
        </Button>
        <Button
          variant={filter === 'coordinator' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('coordinator')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Organizing ({coordinatorCount})
        </Button>
        <Button
          variant={filter === 'participant' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('participant')}
        >
          <Users className="w-4 h-4 mr-2" />
          Participating ({participantCount})
        </Button>
      </div>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Group Bookings</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'coordinator'
                ? "You haven't created any group bookings yet."
                : filter === 'participant'
                ? "You haven't joined any group bookings yet."
                : "You don't have any group bookings yet."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking?mode=group">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create a Group
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              currentPatientId={currentPatient.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
