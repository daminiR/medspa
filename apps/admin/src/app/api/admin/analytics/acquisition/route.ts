/**
 * GET /api/admin/analytics/acquisition - Get patient acquisition analytics
 *
 * Returns:
 * - Source breakdown (referral, walk-in, online booking, waitlist, etc.)
 * - New vs returning patients
 * - Cohort retention analysis
 * - Churn risk metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments } from '@/lib/data';
import type {
  AcquisitionAnalytics,
  AcquisitionSource,
  NewVsReturning,
  CohortData,
  ChurnRiskMetrics,
  AcquisitionTrend,
  PatientSource,
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
    case 'thisWeek':
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
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

    // Get acquisition records
    const allAcquisitions = await db.patientAcquisitions.findAll();
    const acquisitionsInRange = allAcquisitions.filter(a =>
      a.createdAt >= start && a.createdAt <= end
    );

    // Calculate source breakdown
    const sourceMap = new Map<PatientSource, {
      count: number;
      revenue: number;
      totalLTV: number;
      retention90: number;
      retentionCount: number;
    }>();

    const sources: PatientSource[] = [
      'referral', 'walk_in', 'online_booking', 'waitlist', 'social_media',
      'google_ads', 'google_organic', 'instagram', 'facebook', 'yelp', 'direct', 'phone', 'other'
    ];

    sources.forEach(s => sourceMap.set(s, { count: 0, revenue: 0, totalLTV: 0, retention90: 0, retentionCount: 0 }));

    acquisitionsInRange.forEach(acq => {
      const data = sourceMap.get(acq.source) || { count: 0, revenue: 0, totalLTV: 0, retention90: 0, retentionCount: 0 };
      data.count++;
      data.revenue += acq.firstVisitRevenue;
      data.totalLTV += acq.lifetimeValue;

      // Check 90-day retention
      if (acq.firstVisitDate) {
        const daysSinceFirst = Math.floor((now.getTime() - acq.firstVisitDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceFirst >= 90 && acq.visitCount > 1) {
          data.retention90++;
          data.retentionCount++;
        } else if (daysSinceFirst >= 90) {
          data.retentionCount++;
        }
      }

      sourceMap.set(acq.source, data);
    });

    const totalPatients = acquisitionsInRange.length;
    const bySource: AcquisitionSource[] = [];

    sourceMap.forEach((data, source) => {
      if (data.count > 0) {
        bySource.push({
          source,
          count: data.count,
          percentage: totalPatients > 0 ? Math.round((data.count / totalPatients) * 1000) / 10 : 0,
          revenue: data.revenue,
          averageLTV: data.count > 0 ? Math.round(data.totalLTV / data.count) : 0,
          averageFirstVisitValue: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
          retentionRate90Day: data.retentionCount > 0 ? Math.round((data.retention90 / data.retentionCount) * 100) : 0,
        });
      }
    });

    // Sort by count descending
    bySource.sort((a, b) => b.count - a.count);

    // Calculate new vs returning
    // New patients are those who registered in the date range
    // Returning patients are those who had appointments but registered before the date range
    const newPatients = patients.filter(p =>
      p.createdAt >= start && p.createdAt <= end
    ).length;

    const appointmentsInRange = appointments.filter(apt =>
      apt.startTime >= start && apt.startTime <= end
    );

    const uniquePatientIds = new Set(appointmentsInRange.map(a => a.patientId));
    const returningPatients = patients.filter(p =>
      uniquePatientIds.has(p.id) && p.createdAt < start
    ).length;

    const totalInRange = newPatients + returningPatients;
    const newRevenue = newPatients * 350; // Avg first visit value
    const returningRevenue = returningPatients * 450; // Avg returning value (higher due to packages)

    const newVsReturning: NewVsReturning = {
      new: newPatients,
      returning: returningPatients,
      newPercentage: totalInRange > 0 ? Math.round((newPatients / totalInRange) * 100) : 0,
      returningPercentage: totalInRange > 0 ? Math.round((returningPatients / totalInRange) * 100) : 0,
      newRevenue,
      returningRevenue,
    };

    // Calculate cohort retention analysis (last 6 months)
    const cohortAnalysis: CohortData[] = [];

    for (let i = 5; i >= 0; i--) {
      const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const cohortMonth = cohortStart.toLocaleString('default', { month: 'short', year: 'numeric' });

      // Patients who joined in this cohort month
      const cohortPatients = patients.filter(p =>
        p.createdAt >= cohortStart && p.createdAt <= cohortEnd
      );

      const newPatientsInCohort = cohortPatients.length;
      if (newPatientsInCohort === 0) {
        cohortAnalysis.push({
          cohortMonth,
          newPatients: 0,
          month1Retention: 0,
          month2Retention: 0,
          month3Retention: 0,
          month6Retention: 0,
          month12Retention: 0,
          averageLTV: 0,
          totalRevenue: 0,
        });
        continue;
      }

      // Check retention at various intervals
      let month1 = 0, month2 = 0, month3 = 0, month6 = 0, month12 = 0;
      let totalLTV = 0;

      cohortPatients.forEach(patient => {
        const patientAppointments = appointments.filter(a => a.patientId === patient.id);
        const appointmentDates = patientAppointments
          .map(a => a.startTime)
          .sort((a, b) => a.getTime() - b.getTime());

        if (appointmentDates.length === 0) return;

        const firstVisit = appointmentDates[0];
        const daysSinceFirst = Math.floor((now.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24));

        // Count appointments at different time windows
        const hasVisitInMonth = (monthNum: number) => {
          const windowStart = new Date(firstVisit.getTime() + (monthNum - 1) * 30 * 24 * 60 * 60 * 1000);
          const windowEnd = new Date(firstVisit.getTime() + monthNum * 30 * 24 * 60 * 60 * 1000);
          return appointmentDates.some(d => d >= windowStart && d <= windowEnd);
        };

        if (daysSinceFirst >= 30 && hasVisitInMonth(1)) month1++;
        if (daysSinceFirst >= 60 && hasVisitInMonth(2)) month2++;
        if (daysSinceFirst >= 90 && hasVisitInMonth(3)) month3++;
        if (daysSinceFirst >= 180 && hasVisitInMonth(6)) month6++;
        if (daysSinceFirst >= 365 && hasVisitInMonth(12)) month12++;

        // Calculate LTV (appointments * avg value)
        totalLTV += patientAppointments.length * 350;
      });

      // Calculate retention percentages (only if enough time has passed)
      const monthsSinceCohort = i;

      cohortAnalysis.push({
        cohortMonth,
        newPatients: newPatientsInCohort,
        month1Retention: monthsSinceCohort >= 1 ? Math.round((month1 / newPatientsInCohort) * 100) : 0,
        month2Retention: monthsSinceCohort >= 2 ? Math.round((month2 / newPatientsInCohort) * 100) : 0,
        month3Retention: monthsSinceCohort >= 3 ? Math.round((month3 / newPatientsInCohort) * 100) : 0,
        month6Retention: monthsSinceCohort >= 6 ? Math.round((month6 / newPatientsInCohort) * 100) : 0,
        month12Retention: monthsSinceCohort >= 12 ? Math.round((month12 / newPatientsInCohort) * 100) : 0,
        averageLTV: Math.round(totalLTV / newPatientsInCohort),
        totalRevenue: totalLTV,
      });
    }

    // Calculate churn risk
    const churnRisk = await db.patientAcquisitions.getChurnRisk();
    const totalAtRisk = churnRisk.atRisk30 + churnRisk.atRisk60 + churnRisk.atRisk90 + churnRisk.atRisk120;

    // Estimate at-risk revenue based on average LTV
    const avgLTV = 2500;
    const atRiskRevenue = totalAtRisk * avgLTV;

    const churnRiskMetrics: ChurnRiskMetrics = {
      atRisk30Days: churnRisk.atRisk30,
      atRisk60Days: churnRisk.atRisk60,
      atRisk90Days: churnRisk.atRisk90,
      atRisk120Days: churnRisk.atRisk120,
      churned: churnRisk.atRisk120, // Consider 120+ as churned
      totalAtRisk,
      atRiskRevenue,
    };

    // Calculate acquisition trends (daily for last 30 days)
    const acquisitionTrend: AcquisitionTrend[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dateStr = dayStart.toISOString().split('T')[0];

      const dayAcquisitions = allAcquisitions.filter(a =>
        a.createdAt >= dayStart && a.createdAt < dayEnd
      );

      const dayAppointments = appointments.filter(apt =>
        apt.startTime >= dayStart && apt.startTime < dayEnd
      );

      acquisitionTrend.push({
        date: dateStr,
        newPatients: dayAcquisitions.length,
        returningPatients: dayAppointments.filter(a => {
          const patient = patients.find(p => p.id === a.patientId);
          return patient && patient.createdAt < dayStart;
        }).length,
        referralPatients: dayAcquisitions.filter(a => a.source === 'referral').length,
        onlineBookings: dayAcquisitions.filter(a => a.source === 'online_booking').length,
        walkIns: dayAcquisitions.filter(a => a.source === 'walk_in').length,
      });
    }

    const analytics: AcquisitionAnalytics = {
      totalNewPatients: newPatients,
      totalReturningPatients: returningPatients,
      bySource,
      newVsReturning,
      cohortAnalysis,
      churnRisk: churnRiskMetrics,
      acquisitionTrend,
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
    console.error('Patient acquisition analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient acquisition analytics' },
      { status: 500 }
    );
  }
}
