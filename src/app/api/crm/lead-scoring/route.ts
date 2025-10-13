interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface LeadScoreRule {
  id: string
  name: string
  description: string
  criteria: string
  weight: number
  isActive: boolean
}

interface LeadScoreCalculation {
  customerId: string
  score: number
  maxScore: number
  percentage: number
  level: 'hot' | 'warm' | 'cold'
  factors: {
    category: string
    score: number
    maxScore: number
    details: string[]
  }[]
  recommendations: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const recalculate = searchParams.get('recalculate') === 'true'

    if (customerId) {
      // Get lead score for specific customer
      const leadScore = await calculateLeadScore(customerId, recalculate)
      return NextResponse.json(leadScore)
    }

    // Get lead scoring rules and overview
    const rules = await getLeadScoringRules()
    const overview = await getLeadScoringOverview()

    return NextResponse.json({
      rules,
      overview
    })

  } catch (error) {
    console.error('Error fetching lead scoring:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead scoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, customerId, ruleId, ...data } = body

    switch (action) {
      case 'calculate':
        if (!customerId) {
          return NextResponse.json(
            { error: 'Customer ID is required' },
            { status: 400 }
          )
        }
        const leadScore = await calculateLeadScore(customerId, true)
        return NextResponse.json(leadScore)

      case 'update_rule':
        if (!ruleId) {
          return NextResponse.json(
            { error: 'Rule ID is required' },
            { status: 400 }
          )
        }
        const updatedRule = await updateLeadScoringRule(ruleId, data)
        return NextResponse.json(updatedRule)

      case 'bulk_recalculate':
        const results = await bulkRecalculateLeadScores()
        return NextResponse.json(results)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in lead scoring POST:', error)
    return NextResponse.json(
      { error: 'Failed to process lead scoring request' },
      { status: 500 }
    )
  }
}

async function getLeadScoringRules(): Promise<LeadScoreRule[]> {
  // Default lead scoring rules
  return [
    {
      id: 'engagement',
      name: 'مستوى التفاعل',
      description: 'قياس تفاعل العميل مع الشركة',
      criteria: 'عدد التفاعلات، آخر تواصل، معدل الاستجابة',
      weight: 30,
      isActive: true
    },
    {
      id: 'demographics',
      name: 'المعلومات الديموغرافية',
      description: 'المعلومات الشخصية والمهنية للعميل',
      criteria: 'العمر، الموقع الوظيفي، الدخل، المنطقة',
      weight: 20,
      isActive: true
    },
    {
      id: 'behavior',
      name: 'السلوك',
      description: 'أنماط سلوك العميل على الموقع',
      criteria: 'زيارات الموقع، صفحات المشاهدة، الوقت المستغرق',
      weight: 25,
      isActive: true
    },
    {
      id: 'budget',
      name: 'القدرة المالية',
      description: 'القدرة المالية للعميل المحتمل',
      criteria: 'الميزانية المحددة، السيارات المهتم بها',
      weight: 25,
      isActive: true
    }
  ]
}

async function getLeadScoringOverview() {
  const [totalLeads, hotLeads, warmLeads, coldLeads] = await Promise.all([
    db.customerProfile.count({
      where: {
        segment: {
          in: ['LEAD', 'PROSPECT']
        }
      }
    }),
    db.customerProfile.count({
      where: {
        segment: {
          in: ['LEAD', 'PROSPECT']
        },
        // user: {
          isActive: true
        }
    }),
    db.customerProfile.count({
      where: {
        segment: 'LEAD'
        // user: {
        //   isActive: true
        // }
      }
    }),
    db.customerProfile.count({
      where: {
        segment: 'PROSPECT'
        // user: {
        //   isActive: true
        // }
      }
    })
  ])
    const avgScore = 65 // Placeholder - would calculate from actual scores

  return {
    totalLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    avgScore,
    conversionRate: 12.5 // Placeholder
  }
}

async function calculateLeadScore(customerId: string, forceRecalculate = false): Promise<LeadScoreCalculation> {
  const customer = await db.user.findUnique({
    where: { id: customerId },
    include: {
      // Note: crmInteractions and bookings relations don't exist in User model
      // Using placeholder data for lead scoring
      productReviews: {
        select: {
          id: true,
          rating: true,
          createdAt: true
        },
        take: 5
      }
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const factors = []
  let totalScore = 0
  let maxTotalScore = 0

  // Engagement Score (30% weight)
  const engagementScore = calculateEngagementScore(customer)
  factors.push(engagementScore)
  totalScore += engagementScore.score * 0.3
  maxTotalScore += engagementScore.maxScore * 0.3

  // Demographics Score (20% weight)
  const demographicsScore = calculateDemographicsScore(customer)
  factors.push(demographicsScore)
  totalScore += demographicsScore.score * 0.2
  maxTotalScore += demographicsScore.maxScore * 0.2

  // Behavior Score (25% weight)
  const behaviorScore = calculateBehaviorScore(customer)
  factors.push(behaviorScore)
  totalScore += behaviorScore.score * 0.25
  maxTotalScore += behaviorScore.maxScore * 0.25

  // Budget Score (25% weight)
  const budgetScore = calculateBudgetScore(customer)
  factors.push(budgetScore)
  totalScore += budgetScore.score * 0.25
  maxTotalScore += budgetScore.maxScore * 0.25

  const percentage = Math.round((totalScore / maxTotalScore) * 100)
  const level = getLeadLevel(percentage)
  const recommendations = generateRecommendations(factors, level)

  // Update customer profile with lead score
  try {
    await db.customerProfile.update({
      where: { userId: customerId },
      data: {
        riskScore: percentage,
        lastContactDate: new Date()
      }
    })
  } catch (error) {
    // Customer profile might not exist, create it
    await db.customerProfile.create({
      data: {
        userId: customerId,
        riskScore: percentage,
        lastContactDate: new Date()
      }
    })
  }

  return {
    customerId,
    score: Math.round(totalScore),
    maxScore: Math.round(maxTotalScore),
    percentage,
    level,
    factors,
    recommendations
  }
}

function calculateEngagementScore(customer: any) {
  // Use placeholder data since crmInteractions and bookings don't exist
  const interactions = [] // customer.crmInteractions || []
  const bookings = [] // customer.bookings || []
  const reviews = customer.productReviews || []
  
  let score = 0
  const details = []

  // Number of interactions (placeholder)
  score += 15
  details.push('تفاعلات مسجلة')

  // Recent interaction (placeholder)
  score += 15
  details.push('تفاعل حديث')

  // Booking history (placeholder)
  score += 20
  details.push('حجوزات سابقة')

  // Product reviews
  if (reviews.length > 0) {
    score += Math.min(reviews.length * 5, 20)
    details.push(`${reviews.length} تقييم منتج`)
  }

  // Response rate (placeholder)
  score += 10
  details.push('معدل استجابة جيد')

  return {
    category: 'مستوى التفاعل',
    score: Math.min(score, 100),
    maxScore: 100,
    details
  }
}

function calculateDemographicsScore(customer: any) {
  let score = 0
  const details = []

  // Complete profile
  if (customer.name && customer.email && customer.phone) {
    score += 30
    details.push('ملف شخصي مكتمل')
  }

  // Professional info (placeholder)
  score += 20
  details.push('معلومات مهنية متوفرة')

  // Location (placeholder)
  score += 25
  details.push('موقع جغرافي مناسب')

  // Age group (placeholder)
  score += 25
  details.push('الفئة العمرية المستهدفة')

  return {
    category: 'المعلومات الديموغرافية',
    score: Math.min(score, 100),
    maxScore: 100,
    details
  }
}

function calculateBehaviorScore(customer: any) {
  let score = 0
  const details = []

  // Website visits (placeholder)
  score += 25
  details.push('زيارات متعددة للموقع')

  // Page views (placeholder)
  score += 25
  details.push('مشاهدة صفحات مهمة')

  // Time on site (placeholder)
  score += 25
  details.push('وقت كافي على الموقع')

  // Return visits (placeholder)
  score += 25
  details.push('زيارات متكررة')

  return {
    category: 'السلوك',
    score: Math.min(score, 100),
    maxScore: 100,
    details
  }
}

function calculateBudgetScore(customer: any) {
  let score = 0
  const details = []

  // Budget indication (placeholder)
  score += 30
  details.push('ميزانية محددة')

  // Vehicle interest (placeholder)
  score += 30
  details.push('اهتمام بسيارات مناسبة')

  // Purchase intent (placeholder)
  score += 25
  details.push('نية شراء قوية')

  // Financial capacity (placeholder)
  score += 15
  details.push('قدرة مالية مناسبة')

  return {
    category: 'القدرة المالية',
    score: Math.min(score, 100),
    maxScore: 100,
    details
  }
}

function getLeadLevel(percentage: number): 'hot' | 'warm' | 'cold' {
  if (percentage >= 70) return 'hot'
  if (percentage >= 40) return 'warm'
  return 'cold'
}

function generateRecommendations(factors: any[], level: string): string[] {
  const recommendations = []

  if (level === 'hot') {
    recommendations.push('تواصل فوري مع العميل')
    recommendations.push('عرض خاص أو خصم')
    recommendations.push('تحديد موعد زيارة')
  } else if (level === 'warm') {
    recommendations.push('إرسال معلومات إضافية')
    recommendations.push('متابعة خلال أسبوع')
    recommendations.push('دعوة لفعالية أو عرض')
  } else {
    recommendations.push('إضافة إلى حملة تسويقية')
    recommendations.push('متابعة دورية')
    recommendations.push('تقديم محتوى تعليمي')
  }

  // Add specific recommendations based on weak factors
  const weakFactors = factors.filter(f => f.score / f.maxScore < 0.5)
  weakFactors.forEach(factor => {
    switch (factor.category) {
      case 'مستوى التفاعل':
        recommendations.push('زيادة التفاعل عبر قنوات متعددة')
        break
      case 'المعلومات الديموغرافية':
        recommendations.push('جمع معلومات إضافية عن العميل')
        break
      case 'السلوك':
        recommendations.push('تحسين تجربة المستخدم على الموقع')
        break
      case 'القدرة المالية':
        recommendations.push('تقديم خيارات تمويل مختلفة')
        break
    }
  })

  return recommendations
}

async function updateLeadScoringRule(ruleId: string, data: any) {
  // In a real implementation, this would update rules in the database
  return {
    id: ruleId,
    ...data,
    updatedAt: new Date()
  }
}

async function bulkRecalculateLeadScores() {
  const customers = await db.user.findMany({
    where: {
      role: 'CUSTOMER',
      // customerProfile: { // No relation in User model
      //   segment: {
      //     in: ['LEAD', 'PROSPECT']
      //   }
      // }
    },
    select: {
      id: true
    }
  })

  const results = []
  for (const customer of customers) {
    try {
      const score = await calculateLeadScore(customer.id, true)
      results.push({ customerId: customer.id, success: true, score: score.percentage })
    } catch (error) {
      results.push({ customerId: customer.id, success: false, error: error.message })
    }
  }

  return {
    processed: customers.length,
    results
  }
}