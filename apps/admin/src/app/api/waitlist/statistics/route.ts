/**
 * GET /api/waitlist/statistics - Get waitlist statistics and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  WaitlistEntryStatus,
  WaitlistTier,
  WaitlistPriority,
  getWaitlistStats,
  getPendingOffers,
  getOffersStore,
} from '@/lib/waitlist';
import { services, practitioners } from '@/lib/data';
import { waitlistEntries } from '../store';

// GET - Get comprehensive waitlist statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional date range for statistics
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeDaily = searchParams.get('includeDaily') !== 'false'; // Default true

    const now = new Date();

    // Get base statistics from library
    const stats = getWaitlistStats(waitlistEntries);

    // Get all offers from store
    const offersStore = getOffersStore();
    const allOffers = Array.from(offersStore.values());

    // Calculate status counts
    const statusCounts: Record<WaitlistEntryStatus, number> = {
      active: waitlistEntries.filter(e => e.status === 'active').length,
      offered: waitlistEntries.filter(e => e.status === 'offered').length,
      booked: waitlistEntries.filter(e => e.status === 'booked').length,
      expired: waitlistEntries.filter(e => e.status === 'expired').length,
      removed: waitlistEntries.filter(e => e.status === 'removed').length,
    };

    // Calculate tier counts
    const tierCounts: Record<WaitlistTier, number> = {
      platinum: waitlistEntries.filter(e => e.tier === 'platinum').length,
      gold: waitlistEntries.filter(e => e.tier === 'gold').length,
      silver: waitlistEntries.filter(e => e.tier === 'silver').length,
    };

    // Calculate priority counts
    const priorityCounts: Record<WaitlistPriority, number> = {
      high: waitlistEntries.filter(e => e.priority === 'high').length,
      medium: waitlistEntries.filter(e => e.priority === 'medium').length,
      low: waitlistEntries.filter(e => e.priority === 'low').length,
    };

    // Service breakdown
    const serviceBreakdown: Record<string, { count: number; serviceName: string; category: string }> = {};
    waitlistEntries.forEach(entry => {
      const key = entry.serviceCategory;
      if (!serviceBreakdown[key]) {
        serviceBreakdown[key] = {
          count: 0,
          serviceName: entry.requestedService,
          category: entry.serviceCategory,
        };
      }
      serviceBreakdown[key].count++;
    });

    // Practitioner preference breakdown
    const practitionerBreakdown: Record<string, { count: number; practitionerName: string }> = {};
    waitlistEntries.forEach(entry => {
      if (entry.practitionerId) {
        if (!practitionerBreakdown[entry.practitionerId]) {
          const practitioner = practitioners.find(p => p.id === entry.practitionerId);
          practitionerBreakdown[entry.practitionerId] = {
            count: 0,
            practitionerName: practitioner?.name || entry.preferredPractitioner || 'Unknown',
          };
        }
        practitionerBreakdown[entry.practitionerId].count++;
      }
    });

    // Wait time distribution
    const waitTimeDistribution = {
      lessThan7Days: 0,
      '7to14Days': 0,
      '14to30Days': 0,
      moreThan30Days: 0,
    };
    waitlistEntries.forEach(entry => {
      if (entry.status === 'active' || entry.status === 'offered') {
        const daysWaiting = moment().diff(moment(entry.waitingSince), 'days');
        if (daysWaiting < 7) {
          waitTimeDistribution.lessThan7Days++;
        } else if (daysWaiting < 14) {
          waitTimeDistribution['7to14Days']++;
        } else if (daysWaiting < 30) {
          waitTimeDistribution['14to30Days']++;
        } else {
          waitTimeDistribution.moreThan30Days++;
        }
      }
    });

    // Offer statistics
    const acceptedOffers = allOffers.filter(o => o.status === 'accepted');
    const declinedOffers = allOffers.filter(o => o.status === 'declined');
    const expiredOffers = allOffers.filter(o => o.status === 'expired');
    const pendingOffers = getPendingOffers();

    // Conversion rates by tier
    const conversionByTier: Record<WaitlistTier, { sent: number; accepted: number; rate: number }> = {
      platinum: { sent: 0, accepted: 0, rate: 0 },
      gold: { sent: 0, accepted: 0, rate: 0 },
      silver: { sent: 0, accepted: 0, rate: 0 },
    };

    allOffers.forEach(offer => {
      const entry = waitlistEntries.find(e => e.id === offer.waitlistEntryId);
      if (entry) {
        conversionByTier[entry.tier].sent++;
        if (offer.status === 'accepted') {
          conversionByTier[entry.tier].accepted++;
        }
      }
    });

    Object.keys(conversionByTier).forEach(tier => {
      const t = tier as WaitlistTier;
      conversionByTier[t].rate = conversionByTier[t].sent > 0
        ? Math.round((conversionByTier[t].accepted / conversionByTier[t].sent) * 100)
        : 0;
    });

    // Response time statistics
    let totalResponseTime = 0;
    let responsesWithTime = 0;
    const responseTimeDistribution = {
      within5Min: 0,
      '5to15Min': 0,
      '15to30Min': 0,
      moreThan30Min: 0,
    };

    allOffers.forEach(offer => {
      if (offer.respondedAt && offer.sentAt) {
        const responseTimeMinutes = moment(offer.respondedAt).diff(moment(offer.sentAt), 'minutes');
        totalResponseTime += responseTimeMinutes;
        responsesWithTime++;

        if (responseTimeMinutes < 5) {
          responseTimeDistribution.within5Min++;
        } else if (responseTimeMinutes < 15) {
          responseTimeDistribution['5to15Min']++;
        } else if (responseTimeMinutes < 30) {
          responseTimeDistribution['15to30Min']++;
        } else {
          responseTimeDistribution.moreThan30Min++;
        }
      }
    });

    // Calculate weekly trends
    const weeklyTrends = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = moment().subtract(i + 1, 'weeks').startOf('week');
      const weekEnd = moment(weekStart).endOf('week');

      const weekEntries = waitlistEntries.filter(e => {
        const addedAt = moment(e.waitingSince);
        return addedAt.isBetween(weekStart, weekEnd, undefined, '[]');
      }).length;

      const weekOffers = allOffers.filter(o => {
        const sentAt = moment(o.sentAt);
        return sentAt.isBetween(weekStart, weekEnd, undefined, '[]');
      }).length;

      const weekBookings = allOffers.filter(o => {
        return o.status === 'accepted' && o.respondedAt &&
          moment(o.respondedAt).isBetween(weekStart, weekEnd, undefined, '[]');
      }).length;

      weeklyTrends.push({
        weekStarting: weekStart.format('YYYY-MM-DD'),
        weekEnding: weekEnd.format('YYYY-MM-DD'),
        newEntries: weekEntries,
        offersSent: weekOffers,
        bookings: weekBookings,
        conversionRate: weekOffers > 0 ? Math.round((weekBookings / weekOffers) * 100) : 0,
      });
    }

    // Top services by demand
    const topServices = Object.entries(serviceBreakdown)
      .map(([category, data]) => ({
        category,
        serviceName: data.serviceName,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estimated revenue (based on average service prices)
    const avgServicePrice = 250; // Estimated average
    const estimatedRevenueRecovered = acceptedOffers.length * avgServicePrice;

    // Fill rate
    const fillRate = allOffers.length > 0
      ? Math.round((acceptedOffers.length / allOffers.length) * 100)
      : 0;

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      data: {
        summary: {
          totalEntries: waitlistEntries.length,
          activeEntries: statusCounts.active,
          offeredEntries: statusCounts.offered,
          bookedEntries: statusCounts.booked,
          removedEntries: statusCounts.removed + statusCounts.expired,
        },
        waitTime: {
          averageDays: stats.averageWaitDays,
          distribution: waitTimeDistribution,
        },
        offers: {
          totalSent: allOffers.length,
          accepted: acceptedOffers.length,
          declined: declinedOffers.length,
          expired: expiredOffers.length,
          pending: pendingOffers.length,
          acceptanceRate: stats.acceptanceRate,
        },
        conversion: {
          overallRate: allOffers.length > 0
            ? Math.round((acceptedOffers.length / allOffers.length) * 100)
            : 0,
          fillRate,
          byTier: conversionByTier,
        },
        responseTime: {
          averageMinutes: responsesWithTime > 0 ? Math.round(totalResponseTime / responsesWithTime) : 0,
          distribution: responseTimeDistribution,
        },
        revenue: {
          estimatedRecovered: estimatedRevenueRecovered,
          bookingsFromWaitlist: acceptedOffers.length,
          averageBookingValue: avgServicePrice,
        },
        breakdowns: {
          byStatus: statusCounts,
          byPriority: priorityCounts,
          byTier: tierCounts,
          byService: Object.entries(serviceBreakdown).map(([category, data]) => ({
            category,
            serviceName: data.serviceName,
            count: data.count,
          })),
          byPractitioner: Object.entries(practitionerBreakdown).map(([id, data]) => ({
            practitionerId: id,
            practitionerName: data.practitionerName,
            count: data.count,
          })),
        },
        trends: {
          weekly: weeklyTrends,
          topServices,
        },
      },
      generatedAt: now.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Waitlist statistics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist statistics' },
      { status: 500 }
    );
  }
}
