'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWaitingRoomRealtime, WaitingRoomEntry } from '@/services/websocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function WaitingRoomDashboard() {
  // Use real-time Firestore listener for queue updates
  const { queue: realtimeQueue, isConnected } = useWaitingRoomRealtime('default');

  // Local state for queue (will be synced with real-time updates or API fallback)
  const [queue, setQueue] = useState<WaitingRoomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Sync real-time queue with local state
  useEffect(() => {
    if (realtimeQueue.length > 0 || isConnected) {
      setQueue(realtimeQueue);
      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
    }
  }, [realtimeQueue, isConnected]);

  // Fallback to API fetch if real-time is not available
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/waiting-room/queue');
      const data = await response.json();

      if (data.success) {
        setQueue(data.queue);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Failed to fetch queue');
      }
    } catch (err) {
      setError('Network error');
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch as fallback when real-time is not connected
  useEffect(() => {
    if (!isConnected) {
      fetchQueue();
    } else {
      setLoading(false);
    }
  }, [isConnected, fetchQueue]);

  const callPatient = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/waiting-room/call-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });

      const data = await response.json();

      if (data.success) {
        // Real-time update will handle the queue refresh
        // Only fetch manually if not connected
        if (!isConnected) {
          await fetchQueue();
        }
        alert(`Patient notified: ${data.smsPreview}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to notify patient');
      console.error('Call patient error:', err);
    }
  };

  const markCheckedIn = async (appointmentId: string) => {
    try {
      const response = await fetch('/api/waiting-room/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          status: 'checked_in'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Real-time update will handle the queue refresh
        // Only fetch manually if not connected
        if (!isConnected) {
          await fetchQueue();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to check in patient');
      console.error('Check-in error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      in_car: 'bg-blue-100 text-blue-800',
      room_ready: 'bg-green-100 text-green-800',
      checked_in: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      in_car: 'In Car',
      room_ready: 'Room Ready',
      checked_in: 'Checked In'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 0) return null;

    const styles = {
      1: 'bg-purple-100 text-purple-800',
      2: 'bg-red-100 text-red-800'
    };

    const labels = {
      1: 'VIP',
      2: 'Urgent'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading waiting room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Virtual Waiting Room</h1>
            <p className="text-gray-600 mt-2">
              {queue.length === 0 ? 'No patients waiting' : `${queue.length} patient${queue.length > 1 ? 's' : ''} waiting`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Real-time connection status indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Offline</span>
                </>
              )}
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {queue.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">&#128186;</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No patients in waiting room</h2>
            <p className="text-gray-500">Patients can check in by texting "HERE" to your clinic number</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((entry: WaitingRoomEntry, index: number) => (
              <div
                key={entry.appointmentId || entry.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl font-bold text-gray-400">#{entry.position}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{entry.patientName}</h3>
                        <p className="text-gray-600">{entry.serviceName}</p>
                      </div>
                      {getPriorityBadge(entry.priority)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <div className="text-gray-500">Practitioner</div>
                        <div className="font-medium">{entry.practitionerName}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Scheduled</div>
                        <div className="font-medium">
                          {new Date(entry.scheduledTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Arrived</div>
                        <div className="font-medium">
                          {new Date(entry.arrivalTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Wait Time</div>
                        <div className="font-medium">
                          {Math.floor((Date.now() - new Date(entry.arrivalTime).getTime()) / 60000)} min
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-6">
                    {getStatusBadge(entry.status)}

                    {entry.status === 'in_car' && (
                      <button
                        onClick={() => callPatient(entry.appointmentId)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Call Patient
                      </button>
                    )}

                    {entry.status === 'room_ready' && (
                      <button
                        onClick={() => markCheckedIn(entry.appointmentId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Mark Checked In
                      </button>
                    )}
                  </div>
                </div>

                {entry.status === 'room_ready' && (entry as any).roomReadyNotifiedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Notified{' '}
                      {Math.floor((Date.now() - new Date((entry as any).roomReadyNotifiedAt).getTime()) / 60000)} minutes ago
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
