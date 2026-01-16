/**
 * Analytics Types
 * Shared types for reporting and analytics features
 */

// ============================================================================
// REFERRAL ANALYTICS
// ============================================================================

export interface ReferralAnalytics {
  overview: ReferralOverview;
  funnel: ConversionFunnel;
  channelPerformance: ChannelMetrics[];
  monthlyTrend: MonthlyTrend[];
  tierBreakdown: TierBreakdown[];
}

export interface ReferralOverview {
  totalReferrals: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  expiredReferrals: number;
  totalRevenueGenerated: number;
  programCost: number;
  programROI: number;
  averageReferralValue: number;
  viralCoefficient: number;
}

export interface ConversionFunnel {
  shares: number;
  clicks: number;
  signups: number;
  firstVisits: number;
  qualified: number;
  clickThroughRate: number;
  signupRate: number;
  visitRate: number;
  qualificationRate: number;
  overallConversionRate: number;
}

export interface ChannelMetrics {
  method: ShareMethod;
  shares: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

export type ShareMethod =
  | 'SMS'
  | 'EMAIL'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'COPY'
  | 'QR_CODE';

export interface MonthlyTrend {
  month: string;
  shares: number;
  clicks: number;
  signups: number;
  completed: number;
  revenue: number;
}

export interface TierBreakdown {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  count: number;
  totalReferrals: number;
  totalEarnings: number;
  averageReferralsPerUser: number;
}

export interface TopReferrer {
  id: string;
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  referralCode: string;
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  joinedAt: Date;
  lastReferralAt?: Date;
}

// ============================================================================
// PATIENT ACQUISITION ANALYTICS
// ============================================================================

export interface AcquisitionAnalytics {
  totalNewPatients: number;
  totalReturningPatients: number;
  bySource: AcquisitionSource[];
  newVsReturning: NewVsReturning;
  cohortAnalysis: CohortData[];
  churnRisk: ChurnRiskMetrics;
  acquisitionTrend: AcquisitionTrend[];
}

export interface AcquisitionSource {
  source: PatientSource;
  sourceDetail?: string;
  count: number;
  percentage: number;
  revenue: number;
  averageLTV: number;
  averageFirstVisitValue: number;
  retentionRate90Day: number;
}

export type PatientSource =
  | 'referral'
  | 'walk_in'
  | 'online_booking'
  | 'waitlist'
  | 'social_media'
  | 'google_ads'
  | 'google_organic'
  | 'instagram'
  | 'facebook'
  | 'yelp'
  | 'direct'
  | 'phone'
  | 'other';

export interface NewVsReturning {
  new: number;
  returning: number;
  newPercentage: number;
  returningPercentage: number;
  newRevenue: number;
  returningRevenue: number;
}

export interface CohortData {
  cohortMonth: string;
  newPatients: number;
  month1Retention: number;
  month2Retention: number;
  month3Retention: number;
  month6Retention: number;
  month12Retention: number;
  averageLTV: number;
  totalRevenue: number;
}

export interface ChurnRiskMetrics {
  atRisk30Days: number;
  atRisk60Days: number;
  atRisk90Days: number;
  atRisk120Days: number;
  churned: number;
  totalAtRisk: number;
  atRiskRevenue: number;
}

export interface AcquisitionTrend {
  date: string;
  newPatients: number;
  returningPatients: number;
  referralPatients: number;
  onlineBookings: number;
  walkIns: number;
}

export interface AtRiskPatient {
  id: string;
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  lastVisitDate: Date;
  daysSinceLastVisit: number;
  totalVisits: number;
  lifetimeValue: number;
  riskLevel: 'low' | 'medium' | 'high' | 'churned';
  suggestedAction?: string;
}

// ============================================================================
// PATIENT ENGAGEMENT ANALYTICS
// ============================================================================

export interface EngagementAnalytics {
  portalAdoption: PortalAdoptionMetrics;
  onlineBooking: OnlineBookingMetrics;
  formCompletion: FormCompletionMetrics;
  messageEngagement: MessageEngagementMetrics;
  photoActivity: PhotoActivityMetrics;
  waitlistEngagement: WaitlistEngagementMetrics;
}

export interface PortalAdoptionMetrics {
  totalRegistered: number;
  activeLastWeek: number;
  activeLastMonth: number;
  activeLastQuarter: number;
  adoptionRate: number;
  averageSessionsPerUser: number;
  averageSessionDuration: number;
  mobileVsWeb: {
    mobile: number;
    web: number;
    mobilePercentage: number;
  };
}

export interface OnlineBookingMetrics {
  totalBookings: number;
  onlineBookings: number;
  phoneBookings: number;
  walkInBookings: number;
  onlineRate: number;
  trendVsLastMonth: number;
  averageLeadTime: number;
  peakBookingHours: Array<{ hour: number; count: number }>;
}

export interface FormCompletionMetrics {
  formsSent: number;
  formsStarted: number;
  formsCompleted: number;
  startRate: number;
  completionRate: number;
  averageCompletionTime: number;
  byFormType: Array<{
    formType: string;
    sent: number;
    completed: number;
    completionRate: number;
  }>;
}

export interface MessageEngagementMetrics {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesReplied: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  averageResponseTime: number;
  byType: Array<{
    type: string;
    sent: number;
    read: number;
    readRate: number;
  }>;
}

export interface PhotoActivityMetrics {
  totalPatients: number;
  patientsWithPhotos: number;
  totalPhotos: number;
  photosLastMonth: number;
  averagePerPatient: number;
  consentRate: number;
  beforeAfterPairs: number;
}

export interface WaitlistEngagementMetrics {
  totalJoins: number;
  activeEntries: number;
  offersAccepted: number;
  offersDeclined: number;
  offersExpired: number;
  acceptanceRate: number;
  averageWaitTime: number;
  conversionToBooking: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportRequest {
  reportType: ExportReportType;
  format: ExportFormat;
  dateRange?: DateRange;
  filters?: Record<string, any>;
  columns?: string[];
}

export type ExportReportType =
  | 'referrals'
  | 'referral_analytics'
  | 'top_referrers'
  | 'patient_acquisition'
  | 'patient_engagement'
  | 'revenue'
  | 'appointments'
  | 'providers'
  | 'services'
  | 'inventory'
  | 'transactions';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface DateRange {
  start: string;
  end: string;
}

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  formatter?: string;
}

export interface ExportResponse {
  success: boolean;
  filename: string;
  mimeType: string;
  data: string | Buffer;
  rowCount: number;
}

// ============================================================================
// DASHBOARD & REPORTING TYPES
// ============================================================================

export interface DashboardMetrics {
  revenue: RevenueMetrics;
  appointments: AppointmentMetrics;
  patients: PatientMetrics;
  staff: StaffMetrics;
}

export interface RevenueMetrics {
  today: number;
  todayChange: number;
  weekToDate: number;
  weekChange: number;
  monthToDate: number;
  monthChange: number;
  yearToDate: number;
  yearChange: number;
  projectedMonth: number;
}

export interface AppointmentMetrics {
  today: number;
  todayChange: number;
  completed: number;
  cancelled: number;
  noShows: number;
  noShowRate: number;
  utilizationRate: number;
}

export interface PatientMetrics {
  total: number;
  new: number;
  newChange: number;
  active: number;
  vip: number;
  atRisk: number;
}

export interface StaffMetrics {
  activeProviders: number;
  averageUtilization: number;
  topPerformer: string;
  totalCommissions: number;
}

// ============================================================================
// REPORT FILTER TYPES
// ============================================================================

export interface ReportFilters {
  dateRange: DateRangePreset | DateRange;
  location?: string;
  provider?: string;
  service?: string;
  status?: string;
  source?: string;
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'last7Days'
  | 'last30Days'
  | 'last90Days'
  | 'custom';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    dateRange: DateRange;
    generatedAt: string;
    cached: boolean;
  };
}

export interface PaginatedAnalyticsResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
