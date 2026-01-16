/**
 * GET /api/admin/referrals/analytics - Get comprehensive referral program analytics
 *
 * Returns:
 * - Overview metrics (total referrals, ROI, revenue, conversion rates)
 * - Conversion funnel (shares → clicks → signups → visits → qualified)
 * - Channel performance comparison (SMS, Email, WhatsApp, etc.)
 * - Monthly trends
 * - Tier breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/data';
import type {
  ReferralAnalytics,
  ReferralOverview,
  ConversionFunnel,
  ChannelMetrics,
  MonthlyTrend,
  TierBreakdown,
  ShareMethod,
} from '@medical-spa/types';

// Helper to get date range from query params
function getDateRange(searchParams: URLSearchParams): { start: Date; end: Date } {
  const range = searchParams.get('dateRange') || 'thisMonth';
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'thisWeek':
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case 'lastWeek':
      const lastWeekDay = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastWeekDay - 7);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - lastWeekDay);
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'thisQuarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last30Days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last90Days':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      const customStart = searchParams.get('startDate');
      const customEnd = searchParams.get('endDate');
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = customEnd ? new Date(customEnd) : now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { start, end } = getDateRange(searchParams);
    const now = new Date();

    // Fetch all data
    const allReferrals = await db.referrals.findByReferrerId(''); // This returns all since it's a search
    const allReferralPrograms = Array.from((await Promise.all(
      patients.map(p => db.referralPrograms.findByPatientId(p.id))
    )).filter(Boolean));
    const allShares = await db.referralShares.findAll();
    const allClicks = await db.referralClicks.findAll();

    // Filter by date range
    const referralsInRange = allReferrals.filter(r =>
      r.createdAt >= start && r.createdAt <= end
    );
    const sharesInRange = allShares.filter(s =>
      s.createdAt >= start && s.createdAt <= end
    );

    // Calculate overview metrics
    const totalReferrals = referralsInRange.length;
    const pendingReferrals = referralsInRange.filter(r => r.status === 'PENDING').length;
    const qualifiedReferrals = referralsInRange.filter(r => r.status === 'COMPLETED').length;
    const expiredReferrals = referralsInRange.filter(r => r.status === 'EXPIRED').length;

    // Calculate revenue from qualified referrals (using mock average transaction value)
    const avgTransactionValue = 350; // Industry benchmark
    const totalRevenueGenerated = qualifiedReferrals * avgTransactionValue;

    // Calculate program cost (rewards paid out)
    const programCost = referralsInRange.reduce((sum, r) => {
      if (r.status === 'COMPLETED') {
        return sum + r.referrerReward + r.refereeReward;
      }
      return sum;
    }, 0);

    // Calculate ROI
    const programROI = programCost > 0 ? ((totalRevenueGenerated - programCost) / programCost) * 100 : 0;
    const averageReferralValue = qualifiedReferrals > 0 ? totalRevenueGenerated / qualifiedReferrals : 0;

    // Calculate viral coefficient
    const activePatients = patients.filter(p => p.status === 'active').length;
    const referralsPerPatient = activePatients > 0 ? totalReferrals / activePatients : 0;
    const conversionRate = totalReferrals > 0 ? qualifiedReferrals / totalReferrals : 0;
    const viralCoefficient = referralsPerPatient * conversionRate;

    const overview: ReferralOverview = {
      totalReferrals,
      pendingReferrals,
      qualifiedReferrals,
      expiredReferrals,
      totalRevenueGenerated,
      programCost,
      programROI: Math.round(programROI * 10) / 10,
      averageReferralValue: Math.round(averageReferralValue),
      viralCoefficient: Math.round(viralCoefficient * 100) / 100,
    };

    // Calculate conversion funnel
    const totalShares = sharesInRange.length;
    const totalClicks = sharesInRange.reduce((sum, s) => sum + s.clickCount, 0);
    const signups = referralsInRange.filter(r =>
      r.status !== 'PENDING' && r.refereeId
    ).length;
    const firstVisits = referralsInRange.filter(r =>
      ['FIRST_VISIT', 'COMPLETED'].includes(r.status)
    ).length;
    const qualified = qualifiedReferrals;

    const funnel: ConversionFunnel = {
      shares: totalShares,
      clicks: totalClicks,
      signups,
      firstVisits,
      qualified,
      clickThroughRate: totalShares > 0 ? Math.round((totalClicks / totalShares) * 1000) / 10 : 0,
      signupRate: totalClicks > 0 ? Math.round((signups / totalClicks) * 1000) / 10 : 0,
      visitRate: signups > 0 ? Math.round((firstVisits / signups) * 1000) / 10 : 0,
      qualificationRate: firstVisits > 0 ? Math.round((qualified / firstVisits) * 1000) / 10 : 0,
      overallConversionRate: totalShares > 0 ? Math.round((qualified / totalShares) * 1000) / 10 : 0,
    };

    // Calculate channel performance
    const channelData = await db.referralShares.getAggregatedByMethod();
    const channelPerformance: ChannelMetrics[] = channelData.map(ch => ({
      method: ch.method as ShareMethod,
      shares: ch.shares,
      clicks: ch.clicks,
      conversions: ch.conversions,
      clickThroughRate: ch.shares > 0 ? Math.round((ch.clicks / ch.shares) * 1000) / 10 : 0,
      conversionRate: ch.clicks > 0 ? Math.round((ch.conversions / ch.clicks) * 1000) / 10 : 0,
      revenue: ch.revenue,
      averageOrderValue: ch.conversions > 0 ? Math.round(ch.revenue / ch.conversions) : 0,
    }));

    // Calculate monthly trends (last 6 months)
    const monthlyTrend: MonthlyTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });

      const monthShares = allShares.filter(s =>
        s.createdAt >= monthStart && s.createdAt <= monthEnd
      );
      const monthReferrals = allReferrals.filter(r =>
        r.createdAt >= monthStart && r.createdAt <= monthEnd
      );

      monthlyTrend.push({
        month: monthName,
        shares: monthShares.length,
        clicks: monthShares.reduce((sum, s) => sum + s.clickCount, 0),
        signups: monthReferrals.filter(r => r.refereeId).length,
        completed: monthReferrals.filter(r => r.status === 'COMPLETED').length,
        revenue: monthReferrals.filter(r => r.status === 'COMPLETED').length * avgTransactionValue,
      });
    }

    // Calculate tier breakdown
    const tierCounts = {
      BRONZE: { count: 0, totalReferrals: 0, totalEarnings: 0 },
      SILVER: { count: 0, totalReferrals: 0, totalEarnings: 0 },
      GOLD: { count: 0, totalReferrals: 0, totalEarnings: 0 },
      PLATINUM: { count: 0, totalReferrals: 0, totalEarnings: 0 },
    };

    allReferralPrograms.forEach(program => {
      if (!program) return;
      let tier: keyof typeof tierCounts;
      if (program.successfulReferrals >= 31) tier = 'PLATINUM';
      else if (program.successfulReferrals >= 16) tier = 'GOLD';
      else if (program.successfulReferrals >= 6) tier = 'SILVER';
      else tier = 'BRONZE';

      tierCounts[tier].count++;
      tierCounts[tier].totalReferrals += program.totalReferrals;
      tierCounts[tier].totalEarnings += program.totalEarnings;
    });

    const tierBreakdown: TierBreakdown[] = Object.entries(tierCounts).map(([tier, data]) => ({
      tier: tier as TierBreakdown['tier'],
      count: data.count,
      totalReferrals: data.totalReferrals,
      totalEarnings: data.totalEarnings,
      averageReferralsPerUser: data.count > 0 ? Math.round((data.totalReferrals / data.count) * 10) / 10 : 0,
    }));

    const analytics: ReferralAnalytics = {
      overview,
      funnel,
      channelPerformance,
      monthlyTrend,
      tierBreakdown,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
        generatedAt: now.toISOString(),
        cached: false,
      },
    });
  } catch (error) {
    console.error('Referral analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral analytics' },
      { status: 500 }
    );
  }
}
