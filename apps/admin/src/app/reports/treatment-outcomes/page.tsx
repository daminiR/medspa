'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  Activity,
  TrendingUp,
  Users,
  Download,
  ChevronRight,
  Star,
  Camera,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Sparkles,
  Heart,
  ThumbsUp,
  RefreshCw,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react'
import { format, subMonths, differenceInDays } from 'date-fns'

// Mock data for treatment outcomes
const generateTreatmentOutcomes = () => {
  const treatments = [
    {
      category: 'Injectables',
      treatments: [
        {
          name: 'Botox - Forehead',
          totalTreatments: 156,
          satisfaction: 94,
          beforeAfterPhotos: 89,
          avgUnits: 20,
          retreatmentRate: 92,
          avgDaysBetween: 105,
          complications: 2,
          outcomes: {
            excellent: 78,
            good: 15,
            fair: 5,
            poor: 2
          }
        },
        {
          name: 'Botox - Crow\'s Feet',
          totalTreatments: 134,
          satisfaction: 96,
          beforeAfterPhotos: 92,
          avgUnits: 24,
          retreatmentRate: 95,
          avgDaysBetween: 98,
          complications: 1,
          outcomes: {
            excellent: 82,
            good: 14,
            fair: 3,
            poor: 1
          }
        },
        {
          name: 'Filler - Lips',
          totalTreatments: 87,
          satisfaction: 91,
          beforeAfterPhotos: 95,
          avgUnits: 1.2,
          retreatmentRate: 78,
          avgDaysBetween: 210,
          complications: 3,
          outcomes: {
            excellent: 68,
            good: 20,
            fair: 8,
            poor: 4
          }
        },
        {
          name: 'Filler - Cheeks',
          totalTreatments: 62,
          satisfaction: 93,
          beforeAfterPhotos: 88,
          avgUnits: 2.1,
          retreatmentRate: 82,
          avgDaysBetween: 365,
          complications: 1,
          outcomes: {
            excellent: 75,
            good: 18,
            fair: 5,
            poor: 2
          }
        }
      ]
    },
    {
      category: 'Laser Treatments',
      treatments: [
        {
          name: 'IPL Photofacial',
          totalTreatments: 98,
          satisfaction: 88,
          beforeAfterPhotos: 76,
          avgSessions: 3.5,
          retreatmentRate: 65,
          avgDaysBetween: 180,
          complications: 2,
          outcomes: {
            excellent: 62,
            good: 26,
            fair: 10,
            poor: 2
          }
        },
        {
          name: 'Laser Hair Removal',
          totalTreatments: 234,
          satisfaction: 92,
          beforeAfterPhotos: 45,
          avgSessions: 6.2,
          retreatmentRate: 85,
          avgDaysBetween: 42,
          complications: 4,
          outcomes: {
            excellent: 71,
            good: 21,
            fair: 6,
            poor: 2
          }
        },
        {
          name: 'CO2 Resurfacing',
          totalTreatments: 42,
          satisfaction: 90,
          beforeAfterPhotos: 98,
          avgSessions: 1.8,
          retreatmentRate: 45,
          avgDaysBetween: 540,
          complications: 3,
          outcomes: {
            excellent: 70,
            good: 20,
            fair: 7,
            poor: 3
          }
        }
      ]
    },
    {
      category: 'Skin Treatments',
      treatments: [
        {
          name: 'Chemical Peel - Medium',
          totalTreatments: 176,
          satisfaction: 87,
          beforeAfterPhotos: 68,
          avgSessions: 4.2,
          retreatmentRate: 72,
          avgDaysBetween: 60,
          complications: 5,
          outcomes: {
            excellent: 58,
            good: 30,
            fair: 9,
            poor: 3
          }
        },
        {
          name: 'Microneedling',
          totalTreatments: 145,
          satisfaction: 89,
          beforeAfterPhotos: 72,
          avgSessions: 3.8,
          retreatmentRate: 68,
          avgDaysBetween: 45,
          complications: 2,
          outcomes: {
            excellent: 64,
            good: 25,
            fair: 8,
            poor: 3
          }
        },
        {
          name: 'HydraFacial',
          totalTreatments: 312,
          satisfaction: 95,
          beforeAfterPhotos: 35,
          avgSessions: 8.5,
          retreatmentRate: 88,
          avgDaysBetween: 28,
          complications: 0,
          outcomes: {
            excellent: 80,
            good: 15,
            fair: 4,
            poor: 1
          }
        }
      ]
    }
  ]
  
  return treatments
}

const generatePatientFeedback = () => {
  return [
    {
      treatment: 'Botox - Forehead',
      patient: 'Sarah M.',
      date: subMonths(new Date(), 1),
      rating: 5,
      comment: 'Amazing results! My forehead lines are completely gone. Dr. Smith was very professional.',
      wouldRecommend: true
    },
    {
      treatment: 'Filler - Lips',
      patient: 'Jennifer L.',
      date: subMonths(new Date(), 0.5),
      rating: 4,
      comment: 'Very natural looking results. Slight bruising but went away quickly.',
      wouldRecommend: true
    },
    {
      treatment: 'IPL Photofacial',
      patient: 'Michael R.',
      date: subMonths(new Date(), 2),
      rating: 5,
      comment: 'My sun spots are almost completely gone after 3 sessions. Worth every penny!',
      wouldRecommend: true
    },
    {
      treatment: 'Chemical Peel',
      patient: 'Amanda K.',
      date: subMonths(new Date(), 1.5),
      rating: 3,
      comment: 'Results were good but recovery was longer than expected.',
      wouldRecommend: true
    },
    {
      treatment: 'Microneedling',
      patient: 'David T.',
      date: subMonths(new Date(), 3),
      rating: 5,
      comment: 'Texture improvement is incredible. My acne scars are barely visible now.',
      wouldRecommend: true
    }
  ]
}

export default function TreatmentOutcomesPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('quarter')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  
  const treatmentData = useMemo(() => generateTreatmentOutcomes(), [])
  const patientFeedback = useMemo(() => generatePatientFeedback(), [])
  
  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    let totalTreatments = 0
    let totalSatisfaction = 0
    let totalPhotos = 0
    let totalComplications = 0
    let treatmentCount = 0
    
    treatmentData.forEach(category => {
      category.treatments.forEach(treatment => {
        totalTreatments += treatment.totalTreatments
        totalSatisfaction += treatment.satisfaction * treatment.totalTreatments
        totalPhotos += treatment.beforeAfterPhotos
        totalComplications += treatment.complications
        treatmentCount++
      })
    })
    
    return {
      totalTreatments,
      avgSatisfaction: totalSatisfaction / totalTreatments,
      photoComplianceRate: (totalPhotos / treatmentCount) / 100 * 100,
      complicationRate: (totalComplications / totalTreatments) * 100,
      totalComplications
    }
  }, [treatmentData])

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Reports</span>
                <ChevronRight className="h-4 w-4" />
                <span>Clinical</span>
                <ChevronRight className="h-4 w-4" />
                <span>Treatment Outcomes</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Treatment Outcomes</h1>
              <p className="text-gray-600 mt-1">Track treatment effectiveness, patient satisfaction, and clinical results</p>
            </div>
            
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center space-x-4">
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>

              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="injectables">Injectables</option>
                <option value="laser">Laser Treatments</option>
                <option value="skin">Skin Treatments</option>
              </select>

              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Providers</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-johnson">Dr. Johnson</option>
                <option value="sarah-rn">Sarah RN</option>
                <option value="emily-np">Emily NP</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4" />
                  3%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.avgSatisfaction.toFixed(1)}%</p>
              <div className="mt-2 flex items-center space-x-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(overallMetrics.avgSatisfaction/20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Treatments</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.totalTreatments.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">This quarter</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4" />
                  5%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Photo Documentation</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.photoComplianceRate.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">Compliance rate</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Complication Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.complicationRate.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">{overallMetrics.totalComplications} total</p>
            </div>
          </div>

          {/* Treatment Performance by Category */}
          {treatmentData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Retreatment</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Days</th>
                      <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome Distribution</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.treatments.map((treatment, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{treatment.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{treatment.totalTreatments}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            treatment.satisfaction >= 90 ? 'bg-green-100 text-green-700' : 
                            treatment.satisfaction >= 80 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {treatment.satisfaction}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{treatment.beforeAfterPhotos}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{treatment.retreatmentRate}%</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{treatment.avgDaysBetween}d</td>
                        <td className="px-6 py-4">
                          <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 relative"
                              style={{ width: `${treatment.outcomes.excellent}%` }}
                              title={`Excellent: ${treatment.outcomes.excellent}%`}
                            />
                            <div 
                              className="bg-blue-500 relative"
                              style={{ width: `${treatment.outcomes.good}%` }}
                              title={`Good: ${treatment.outcomes.good}%`}
                            />
                            <div 
                              className="bg-yellow-500 relative"
                              style={{ width: `${treatment.outcomes.fair}%` }}
                              title={`Fair: ${treatment.outcomes.fair}%`}
                            />
                            <div 
                              className="bg-red-500 relative"
                              style={{ width: `${treatment.outcomes.poor}%` }}
                              title={`Poor: ${treatment.outcomes.poor}%`}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {treatment.complications > 0 ? (
                            <span className="text-orange-600 font-medium">{treatment.complications}</span>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Patient Feedback */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Patient Feedback</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {patientFeedback.map((feedback, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{feedback.patient}</p>
                        <p className="text-sm text-gray-500">{feedback.treatment} • {format(feedback.date, 'MMM d, yyyy')}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-4 w-4 ${i <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{feedback.comment}</p>
                    {feedback.wouldRecommend && (
                      <div className="flex items-center text-xs text-green-600">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Would recommend
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcome Legend */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                <span className="text-gray-600">Excellent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                <span className="text-gray-600">Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                <span className="text-gray-600">Fair</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                <span className="text-gray-600">Poor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}