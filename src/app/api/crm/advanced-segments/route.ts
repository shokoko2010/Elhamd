import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface SegmentRule {
  id: string
  name: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'older_than' | 'newer_than'
  value: any
  weight?: number
}

interface CustomerSegment {
  id: string
  name: string
  description: string
  rules: SegmentRule[]
  logic: 'AND' | 'OR'
  isDynamic: boolean
  customerCount: number
  avgSpent: number
  lastCalculated: Date
  autoUpdate: boolean
  updateFrequency: 'daily' | 'weekly' | 'monthly'
  createdAt: Date
  updatedAt: Date
}

interface SegmentAnalysis {
  segmentId: string
  totalCustomers: number
  avgSpent: number
  totalRevenue: number
  conversionRate: number
  retentionRate: number
  avgLifetimeValue: number
  topVehicles: string[]
  behaviorPatterns: string[]
  recommendations: string[]
}

interface PredictiveSegment {
  id: string
  name: string
  description: string
  algorithm: string
  confidence: number
  customers: string[]
  predictedValue: number
  timeframe: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const segmentId = searchParams.get('segmentId')

    if (type === 'segments') {
      const segments = await getCustomerSegments()
      return NextResponse.json(segments)
    }

    if (type === 'analysis' && segmentId) {
      const analysis = await getSegmentAnalysis(segmentId)
      return NextResponse.json(analysis)
    }

    if (type === 'predictive') {
      const predictiveSegments = await getPredictiveSegments()
      return NextResponse.json(predictiveSegments)
    }

    if (type === 'rules') {
      const rules = await getSegmentRules()
      return NextResponse.json(rules)
    }

    // Get overview
    const overview = await getSegmentationOverview()
    return NextResponse.json(overview)

  } catch (error) {
    console.error('Error fetching customer segments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer segments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create_segment':
        const segment = await createCustomerSegment(data)
        return NextResponse.json(segment)

      case 'update_segment':
        const updatedSegment = await updateCustomerSegment(data)
        return NextResponse.json(updatedSegment)

      case 'calculate_segment':
        const calculation = await calculateSegmentCustomers(data.segmentId)
        return NextResponse.json(calculation)

      case 'predict_segment':
        const prediction = await predictCustomerSegment(data)
        return NextResponse.json(prediction)

      case 'bulk_update':
        const bulkResult = await bulkUpdateSegments()
        return NextResponse.json(bulkResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in customer segments POST:', error)
    return NextResponse.json(
      { error: 'Failed to process customer segments request' },
      { status: 500 }
    )
  }
}

async function getSegmentationOverview() {
  const segments = await getCustomerSegments()
  const totalCustomers = segments.reduce((sum, seg) => sum + seg.customerCount, 0)
  
  // Calculate segment distribution
  const segmentDistribution = segments.map(seg => ({
    name: seg.name,
    count: seg.customerCount,
    percentage: totalCustomers > 0 ? (seg.customerCount / totalCustomers) * 100 : 0
  }))

  // Get performance metrics
  const performanceMetrics = {
    avgSegmentSize: totalCustomers / segments.length,
    mostValuableSegment: segments.reduce((max, seg) => 
      seg.avgSpent > max.avgSpent ? seg : max, segments[0]
    ),
    fastestGrowingSegment: segments.reduce((max, seg) => 
      seg.customerCount > max.customerCount ? seg : max, segments[0]
    )
  }

  return {
    totalSegments: segments.length,
    totalCustomers,
    segmentDistribution,
    performanceMetrics,
    recentActivity: [
      {
        type: 'segment_updated',
        segment: 'عملاء VIP',
        customers: 45,
        date: new Date().toISOString()
      },
      {
        type: 'segment_created',
        segment: 'عملاء محتملون نشطون',
        customers: 120,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

async function getCustomerSegments(): Promise<CustomerSegment[]> {
  return [
    {
      id: 'vip',
      name: 'عملاء VIP',
      description: 'العملاء المميزون الذين لديهم إنفاق عالي وتفاعل مستمر',
      rules: [
        {
          id: '1',
          name: 'إجمالي الإنفاق',
          field: 'totalSpent',
          operator: 'greater_than',
          value: 50000,
          weight: 40
        },
        {
          id: '2',
          name: 'عدد الحجوزات',
          field: 'bookingCount',
          operator: 'greater_than',
          value: 5,
          weight: 30
        },
        {
          id: '3',
          name: 'النشاط الأخير',
          field: 'lastVisit',
          operator: 'newer_than',
          value: '90d',
          weight: 30
        }
      ],
      logic: 'AND',
      isDynamic: true,
      customerCount: 45,
      avgSpent: 75000,
      lastCalculated: new Date(),
      autoUpdate: true,
      updateFrequency: 'weekly',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'high_value_prospects',
      name: 'عملاء محتملون ذوو قيمة عالية',
      description: 'العملاء المحتملون الذين يظهرون إشارات شراء قوية',
      rules: [
        {
          id: '4',
          name: 'مستوى التفاعل',
          field: 'engagementScore',
          operator: 'greater_than',
          value: 70,
          weight: 35
        },
        {
          id: '5',
          name: 'الاهتمام بالسيارات الفاخرة',
          field: 'interestedVehicles',
          operator: 'contains',
          value: ['nexon', 'harrier', 'safari'],
          weight: 25
        },
        {
          id: '6',
          name: 'الميزانية',
          field: 'budgetRange',
          operator: 'greater_than',
          value: 300000,
          weight: 40
        }
      ],
      logic: 'AND',
      isDynamic: true,
      customerCount: 78,
      avgSpent: 0,
      lastCalculated: new Date(),
      autoUpdate: true,
      updateFrequency: 'daily',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'at_risk',
      name: 'عملاء في خطر',
      description: 'العملاء الذين لم يتفاعلوا مؤخراً وقد يفقدون',
      rules: [
        {
          id: '7',
          name: 'آخر تفاعل',
          field: 'lastInteraction',
          operator: 'older_than',
          value: '180d',
          weight: 50
        },
        {
          id: '8',
          name: 'انخفاض التفاعل',
          field: 'engagementTrend',
          operator: 'less_than',
          value: -0.5,
          weight: 30
        },
        {
          id: '9',
          name: 'عدم الاستجابة',
          field: 'responseRate',
          operator: 'less_than',
          value: 0.2,
          weight: 20
        }
      ],
      logic: 'AND',
      isDynamic: true,
      customerCount: 32,
      avgSpent: 25000,
      lastCalculated: new Date(),
      autoUpdate: true,
      updateFrequency: 'weekly',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'new_active',
      name: 'عملاء جدد نشطون',
      description: 'العملاء الذين انضموا مؤخراً ويظهرون نشاطاً عالياً',
      rules: [
        {
          id: '10',
          name: 'تاريخ الانضمام',
          field: 'joinDate',
          operator: 'newer_than',
          value: '30d',
          weight: 40
        },
        {
          id: '11',
          name: 'عدد التفاعلات',
          field: 'interactionCount',
          operator: 'greater_than',
          value: 3,
          weight: 35
        },
        {
          id: '12',
          name: 'معدل التفاعل',
          field: 'interactionRate',
          operator: 'greater_than',
          value: 0.5,
          weight: 25
        }
      ],
      logic: 'AND',
      isDynamic: true,
      customerCount: 56,
      avgSpent: 15000,
      lastCalculated: new Date(),
      autoUpdate: true,
      updateFrequency: 'daily',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ]
}

async function getSegmentAnalysis(segmentId: string): Promise<SegmentAnalysis> {
  // Mock analysis data - in production, this would calculate real metrics
  const segment = await getCustomerSegments().then(segs => segs.find(s => s.id === segmentId))
  
  if (!segment) {
    throw new Error('Segment not found')
  }

  return {
    segmentId,
    totalCustomers: segment.customerCount,
    avgSpent: segment.avgSpent,
    totalRevenue: segment.customerCount * segment.avgSpent,
    conversionRate: 15.5,
    retentionRate: 78.2,
    avgLifetimeValue: segment.avgSpent * 2.5,
    topVehicles: ['Tata Nexon', 'Tata Harrier', 'Tata Punch'],
    behaviorPatterns: [
      'يزور الموقع بانتظام',
      'يستجيب للعروض الترويجية',
      'يفضل التواصل عبر البريد الإلكتروني'
    ],
    recommendations: [
      'تقديم عروض حصرية ومخصصة',
      'برنامج ولاء خاص',
      'دعوة لفعاليات خاصة',
      'تواصل شخصي مع مدير العلاقات'
    ]
  }
}

async function getPredictiveSegments(): Promise<PredictiveSegment[]> {
  return [
    {
      id: 'likely_to_convert',
      name: 'مرجح التحويل',
      description: 'عملاء محتملون لديهم احتمالية عالية للتحويل إلى عملاء',
      algorithm: 'Random Forest',
      confidence: 0.87,
      customers: ['cust_1', 'cust_2', 'cust_3'],
      predictedValue: 45000,
      timeframe: '30 days'
    },
    {
      id: 'high_lifetime_value',
      name: 'قيمة عمرية عالية',
      description: 'عملاء لديهم إمكانية لقيمة عمرية عالية',
      algorithm: 'Gradient Boosting',
      confidence: 0.82,
      customers: ['cust_4', 'cust_5'],
      predictedValue: 120000,
      timeframe: '12 months'
    },
    {
      id: 'churn_risk',
      name: 'مخاطر التوقف',
      description: 'عملاء معرضون لخطر التوقف عن التعامل',
      algorithm: 'Logistic Regression',
      confidence: 0.75,
      customers: ['cust_6', 'cust_7', 'cust_8'],
      predictedValue: -35000,
      timeframe: '90 days'
    }
  ]
}

async function getSegmentRules() {
  return [
    {
      category: 'الديموغرافيا',
      rules: [
        { field: 'age', operator: 'greater_than', label: 'العمر أكبر من' },
        { field: 'age', operator: 'less_than', label: 'العمر أقل من' },
        { field: 'location', operator: 'equals', label: 'الموقع' },
        { field: 'occupation', operator: 'contains', label: 'المهنة تحتوي على' }
      ]
    },
    {
      category: 'السلوك',
      rules: [
        { field: 'visitFrequency', operator: 'greater_than', label: 'تكرار الزيارة أكبر من' },
        { field: 'pageViews', operator: 'greater_than', label: 'مشاهدات الصفحة أكبر من' },
        { field: 'timeOnSite', operator: 'greater_than', label: 'الوقت على الموقع أكبر من' },
        { field: 'lastVisit', operator: 'older_than', label: 'آخر زيارة أقدم من' }
      ]
    },
    {
      category: 'المعاملات',
      rules: [
        { field: 'totalSpent', operator: 'greater_than', label: 'إجمالي الإنفاق أكبر من' },
        { field: 'bookingCount', operator: 'greater_than', label: 'عدد الحجوزات أكبر من' },
        { field: 'avgOrderValue', operator: 'greater_than', label: 'متوسط قيمة الطلب أكبر من' },
        { field: 'lastPurchase', operator: 'older_than', label: 'آخر شراء أقدم من' }
      ]
    },
    {
      category: 'التفاعل',
      rules: [
        { field: 'emailOpenRate', operator: 'greater_than', label: 'معدل فتح البريد أكبر من' },
        { field: 'clickThroughRate', operator: 'greater_than', label: 'معدل النقر أكبر من' },
        { field: 'socialEngagement', operator: 'greater_than', label: 'التفاعل الاجتماعي أكبر من' },
        { field: 'responseRate', operator: 'greater_than', label: 'معدل الاستجابة أكبر من' }
      ]
    }
  ]
}

async function createCustomerSegment(data: any) {
  const segment = {
    id: Date.now().toString(),
    ...data,
    customerCount: 0,
    avgSpent: 0,
    lastCalculated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // In production, this would save to database and calculate initial customers
  return segment
}

async function updateCustomerSegment(data: any) {
  const updatedSegment = {
    ...data,
    updatedAt: new Date()
  }

  // In production, this would update in database
  return updatedSegment
}

async function calculateSegmentCustomers(segmentId: string) {
  // Mock calculation - in production, this would query database with segment rules
  return {
    segmentId,
    customerCount: 45,
    newCustomers: 5,
    removedCustomers: 2,
    calculationTime: new Date()
  }
}

async function predictCustomerSegment(data: any) {
  const { customerId, algorithm = 'random_forest' } = data
  
  // Mock prediction - in production, this would use ML models
  return {
    customerId,
    predictedSegment: 'high_value_prospects',
    confidence: 0.87,
    factors: [
      { factor: 'engagement_score', value: 85, impact: 'high' },
      { factor: 'budget_indicated', value: 450000, impact: 'high' },
      { factor: 'visit_frequency', value: 12, impact: 'medium' }
    ],
    recommendation: 'Focus on personalized follow-up and premium vehicle options'
  }
}

async function bulkUpdateSegments() {
  const segments = await getCustomerSegments()
  const results = []

  for (const segment of segments) {
    if (segment.autoUpdate) {
      try {
        const calculation = await calculateSegmentCustomers(segment.id)
        results.push({
          segmentId: segment.id,
          success: true,
          customerCount: calculation.customerCount
        })
      } catch (error) {
        results.push({
          segmentId: segment.id,
          success: false,
          error: error.message
        })
      }
    }
  }

  return {
    processed: segments.filter(s => s.autoUpdate).length,
    results
  }
}