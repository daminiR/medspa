/**
 * GET /api/admin/referrals/top-referrers - Get leaderboard of top referring patients
 *
 * Query params:
 * - limit: number of results (default 10, max 100)
 * - sortBy: 'referrals' | 'earnings' | 'qualified' (default 'referrals')
 * - tier: filter by tier (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/data';
import type { TopReferrer } from '@medical-spa/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const sortBy = searchParams.get('sortBy') || 'referrals';
    const tierFilter = searchParams.get('tier');

    // Get all referral programs with patient info
    const topReferrers: TopReferrer[] = [];

    for (const patient of patients) {
      const program = await db.referralPrograms.findByPatientId(patient.id);

      if (!program) continue;

      // Determine tier
      let tier: TopReferrer['tier'];
      if (program.successfulReferrals >= 31) tier = 'PLATINUM';
      else if (program.successfulReferrals >= 16) tier = 'GOLD';
      else if (program.successfulReferrals >= 6) tier = 'SILVER';
      else tier = 'BRONZE';

      // Apply tier filter if specified
      if (tierFilter && tier !== tierFilter.toUpperCase()) continue;

      // Get referrals for this patient
      const referrals = await db.referrals.findByReferrerId(program.patientId);
      const lastReferral = referrals.length > 0
        ? referrals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        : null;

      topReferrers.push({
        id: program.id,
        patientId: patient.id,
        patientName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        referralCode: program.referralCode,
        totalReferrals: program.totalReferrals,
        qualifiedReferrals: program.successfulReferrals,
        pendingReferrals: program.pendingReferrals,
        totalEarnings: program.totalEarnings,
        availableCredits: program.availableCredits,
        tier,
        joinedAt: program.createdAt,
        lastReferralAt: lastReferral?.createdAt,
      });
    }

    // Sort based on sortBy parameter
    topReferrers.sort((a, b) => {
      switch (sortBy) {
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'qualified':
          return b.qualifiedReferrals - a.qualifiedReferrals;
        case 'referrals':
        default:
          return b.totalReferrals - a.totalReferrals;
      }
    });

    // Apply limit
    const results = topReferrers.slice(0, limit);

    // Calculate summary stats
    const totalReferrers = topReferrers.length;
    const totalReferrals = topReferrers.reduce((sum, r) => sum + r.totalReferrals, 0);
    const totalEarnings = topReferrers.reduce((sum, r) => sum + r.totalEarnings, 0);
    const avgReferralsPerUser = totalReferrers > 0 ? totalReferrals / totalReferrers : 0;

    const tierDistribution = {
      PLATINUM: topReferrers.filter(r => r.tier === 'PLATINUM').length,
      GOLD: topReferrers.filter(r => r.tier === 'GOLD').length,
      SILVER: topReferrers.filter(r => r.tier === 'SILVER').length,
      BRONZE: topReferrers.filter(r => r.tier === 'BRONZE').length,
    };

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: totalReferrers,
        returned: results.length,
        summary: {
          totalReferrers,
          totalReferrals,
          totalEarnings,
          avgReferralsPerUser: Math.round(avgReferralsPerUser * 10) / 10,
          tierDistribution,
        },
      },
    });
  } catch (error) {
    console.error('Top referrers GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top referrers' },
      { status: 500 }
    );
  }
}
