import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface LoyaltyTier {
  id: string
  name: string
  description: string
  minPoints: number
  maxPoints?: number
  benefits: string[]
  color: string
  icon: string
  discountRate: number
  prioritySupport: boolean
  exclusiveAccess: boolean
}

interface LoyaltyReward {
  id: string
  name: string
  description: string
  type: 'discount' | 'service' | 'product' | 'experience'
  pointsRequired: number
  value: number
  validity: number // in days
  isLimited: boolean
  limitCount?: number
  claimedCount: number
  isActive: boolean
  category: string
  imageUrl?: string
  terms: string
}

interface CustomerLoyalty {
  customerId: string
  points: number
  tier: string
  tierProgress: number
  totalEarned: number
  totalSpent: number
  joinDate: Date
  lastActivity: Date
  nextTierProgress: number
  rewardsClaimed: number
  referrals: number
  streak: number // consecutive months with activity
}

interface LoyaltyTransaction {
  id: string
  customerId: string
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  points: number
  description: string
  referenceId?: string
  referenceType?: string
  expiryDate?: Date
  createdAt: Date
}

interface LoyaltyAnalytics {
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  avgPointsPerMember: number
  tierDistribution: { tier: string; count: number; percentage: number }[]
  topRewards: { rewardId: string; name: string; claimed: number }[]
  retentionRate: number
  programROI: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const customerId = searchParams.get('customerId')

    if (type === 'tiers') {
      const tiers = await getLoyaltyTiers()
      return NextResponse.json(tiers)
    }

    if (type === 'rewards') {
      const rewards = await getLoyaltyRewards()
      return NextResponse.json(rewards)
    }

    if (type === 'customer' && customerId) {
      const loyalty = await getCustomerLoyalty(customerId)
      return NextResponse.json(loyalty)
    }

    if (type === 'transactions' && customerId) {
      const transactions = await getLoyaltyTransactions(customerId)
      return NextResponse.json(transactions)
    }

    if (type === 'analytics') {
      const analytics = await getLoyaltyAnalytics()
      return NextResponse.json(analytics)
    }

    // Get overview
    const overview = await getLoyaltyOverview()
    return NextResponse.json(overview)

  } catch (error) {
    console.error('Error fetching loyalty program:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loyalty program data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'earn_points':
        const earnResult = await earnLoyaltyPoints(data)
        return NextResponse.json(earnResult)

      case 'redeem_reward':
        const redeemResult = await redeemLoyaltyReward(data)
        return NextResponse.json(redeemResult)

      case 'join_program':
        const joinResult = await joinLoyaltyProgram(data)
        return NextResponse.json(joinResult)

      case 'create_reward':
        const reward = await createLoyaltyReward(data)
        return NextResponse.json(reward)

      case 'update_tier':
        const tierUpdate = await updateLoyaltyTier(data)
        return NextResponse.json(tierUpdate)

      case 'process_referral':
        const referralResult = await processReferral(data)
        return NextResponse.json(referralResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in loyalty program POST:', error)
    return NextResponse.json(
      { error: 'Failed to process loyalty program request' },
      { status: 500 }
    )
  }
}

async function getLoyaltyOverview() {
  const analytics = await getLoyaltyAnalytics()
  
  return {
    totalMembers: analytics.totalMembers,
    activeMembers: analytics.activeMembers,
    totalPointsIssued: analytics.totalPointsIssued,
    totalPointsRedeemed: analytics.totalPointsRedeemed,
    avgPointsPerMember: analytics.avgPointsPerMember,
    retentionRate: analytics.retentionRate,
    programROI: analytics.programROI,
    recentActivity: [
      {
        type: 'points_earned',
        customer: 'أحمد محمد',
        points: 250,
        description: 'حجز صيانة',
        date: new Date().toISOString()
      },
      {
        type: 'reward_redeemed',
        customer: 'فاطمة علي',
        reward: 'خصم 10% على الصيانة',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'tier_upgrade',
        customer: 'محمد سعيد',
        fromTier: 'Bronze',
        toTier: 'Silver',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  return [
    {
      id: 'bronze',
      name: 'برونزي',
      description: 'بداية رحلتك مع الهامد كارز',
      minPoints: 0,
      maxPoints: 999,
      benefits: [
        'كسب 1 نقطة لكل 100 جنيه',
        'عروض حصرية عبر البريد',
        'دعوة لفعاليات محددة'
      ],
      color: '#CD7F32',
      icon: '🥉',
      discountRate: 0,
      prioritySupport: false,
      exclusiveAccess: false
    },
    {
      id: 'silver',
      name: 'فضي',
      description: 'عميل مميز في الهامد كارز',
      minPoints: 1000,
      maxPoints: 4999,
      benefits: [
        'كسب 1.5 نقطة لكل 100 جنيه',
        'خصم 5% على الصيانة',
        'دعم مفضل',
        'دعوة لجميع الفعاليات'
      ],
      color: '#C0C0C0',
      icon: '🥈',
      discountRate: 5,
      prioritySupport: true,
      exclusiveAccess: false
    },
    {
      id: 'gold',
      name: 'ذهبي',
      description: 'عميل VIP في الهامد كارز',
      minPoints: 5000,
      maxPoints: 14999,
      benefits: [
        'كسب 2 نقطة لكل 100 جنيه',
        'خصم 10% على الصيانة',
        'دعم أولوية عالية',
        'خدمة سيارة بديلة',
        'دعوة لفعاليات حصرية'
      ],
      color: '#FFD700',
      icon: '🥇',
      discountRate: 10,
      prioritySupport: true,
      exclusiveAccess: true
    },
    {
      id: 'platinum',
      name: 'بلاتيني',
      description: 'أفضل عملاء الهامد كارز',
      minPoints: 15000,
      benefits: [
        'كسب 3 نقاط لكل 100 جنيه',
        'خصم 15% على الصيانة',
        'دعم VIP على مدار الساعة',
        'خدمة سيارة بديلة مجانية',
        'فعاليات حصرية جداً',
        'مدير علاقات شخصي'
      ],
      color: '#E5E4E2',
      icon: '💎',
      discountRate: 15,
      prioritySupport: true,
      exclusiveAccess: true
    }
  ]
}

async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  return [
    {
      id: '1',
      name: 'خصم 5% على الصيانة',
      description: 'احصل على خصم 5% على خدمة الصيانة التالية',
      type: 'discount',
      pointsRequired: 500,
      value: 5,
      validity: 90,
      isLimited: false,
      claimedCount: 45,
      isActive: true,
      category: 'الصيانة',
      terms: 'صالح لخدمة صيانة واحدة فقط. لا يمكن تجميعه مع عروض أخرى.'
    },
    {
      id: '2',
      name: 'غسيل سيارة مجاني',
      description: 'غسيل سيارة خارجي وداخلي مجاني',
      type: 'service',
      pointsRequired: 300,
      value: 150,
      validity: 60,
      isLimited: false,
      claimedCount: 78,
      isActive: true,
      category: 'الخدمات',
      terms: 'صالح لغسيل سيارة واحد فقط. يحتاج إلى حجز مسبق.'
    },
    {
      id: '3',
      name: 'تغيير زيت مجاني',
      description: 'خدمة تغيير زيت مع فلتر مجانية',
      type: 'service',
      pointsRequired: 800,
      value: 250,
      validity: 120,
      isLimited: true,
      limitCount: 50,
      claimedCount: 23,
      isActive: true,
      category: 'الصيانة',
      terms: 'يشمل الزيت والفلتر فقط. لا يشمل قطع غيار إضافية.'
    },
    {
      id: '4',
      name: 'تجربة قيادة سيارة جديدة',
      description: 'تجربة قيادة سيارة تاتا جديدة لمدة ساعة',
      type: 'experience',
      pointsRequired: 1000,
      value: 500,
      validity: 30,
      isLimited: true,
      limitCount: 20,
      claimedCount: 8,
      isActive: true,
      category: 'تجارب',
      terms: 'يحتاج إلى حجز مسبق. متوفر لنماذج محددة فقط.'
    },
    {
      id: '5',
      name: 'خصم 10% على سيارة جديدة',
      description: 'خصم خاص على شراء سيارة تاتا جديدة',
      type: 'discount',
      pointsRequired: 5000,
      value: 10,
      validity: 180,
      isLimited: true,
      limitCount: 10,
      claimedCount: 2,
      isActive: true,
      category: 'المبيعات',
      terms: 'صالح لسيارة واحدة فقط. لا يمكن تجميعه مع عروض أخرى.'
    }
  ]
}

async function getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty> {
  // Mock customer loyalty data - in production, this would come from database
  return {
    customerId,
    points: 2750,
    tier: 'silver',
    tierProgress: 55, // 55% to next tier
    totalEarned: 3200,
    totalSpent: 185000,
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextTierProgress: 2250, // points needed for next tier
    rewardsClaimed: 3,
    referrals: 2,
    streak: 6
  }
}

async function getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
  // Mock transaction history
  return [
    {
      id: '1',
      customerId,
      type: 'earned',
      points: 250,
      description: 'حجز صيانة دورية',
      referenceId: 'booking_123',
      referenceType: 'booking',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      customerId,
      type: 'redeemed',
      points: 500,
      description: 'استبدال: خصم 5% على الصيانة',
      referenceId: 'reward_1',
      referenceType: 'reward',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      customerId,
      type: 'earned',
      points: 150,
      description: 'إحالة صديق',
      referenceId: 'referral_456',
      referenceType: 'referral',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      customerId,
      type: 'earned',
      points: 500,
      description: 'شراء سيارة جديدة',
      referenceId: 'sale_789',
      referenceType: 'sale',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    }
  ]
}

async function getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
  // Mock analytics data
  return {
    totalMembers: 1250,
    activeMembers: 980,
    totalPointsIssued: 2450000,
    totalPointsRedeemed: 1850000,
    avgPointsPerMember: 1960,
    tierDistribution: [
      { tier: 'bronze', count: 450, percentage: 36 },
      { tier: 'silver', count: 520, percentage: 41.6 },
      { tier: 'gold', count: 230, percentage: 18.4 },
      { tier: 'platinum', count: 50, percentage: 4 }
    ],
    topRewards: [
      { rewardId: '1', name: 'خصم 5% على الصيانة', claimed: 45 },
      { rewardId: '2', name: 'غسيل سيارة مجاني', claimed: 78 },
      { rewardId: '3', name: 'تغيير زيت مجاني', claimed: 23 }
    ],
    retentionRate: 78.5,
    programROI: 3.2
  }
}

async function earnLoyaltyPoints(data: any) {
  const { customerId, points, description, referenceId, referenceType } = data
  
  // Calculate points based on transaction type
  let calculatedPoints = points
  
  if (referenceType === 'booking') {
    // Calculate points based on booking value
    const bookingValue = data.amount || 0
    calculatedPoints = Math.floor(bookingValue / 100) // 1 point per 100 EGP
  }
  
  // Create transaction
  const transaction = {
    id: Date.now().toString(),
    customerId,
    type: 'earned',
    points: calculatedPoints,
    description: description || `كسب ${calculatedPoints} نقطة`,
    referenceId,
    referenceType,
    createdAt: new Date()
  }
  
  // Update customer loyalty
  const customerLoyalty = await getCustomerLoyalty(customerId)
  const newPoints = customerLoyalty.points + calculatedPoints
  const newTotalEarned = customerLoyalty.totalEarned + calculatedPoints
  
  // Check for tier upgrade
  const tiers = await getLoyaltyTiers()
  const currentTier = tiers.find(t => t.id === customerLoyalty.tier)
  const nextTier = tiers.find(t => t.minPoints > customerLoyalty.points)
  
  let tierUpgrade = null
  if (nextTier && newPoints >= nextTier.minPoints) {
    tierUpgrade = {
      fromTier: customerLoyalty.tier,
      toTier: nextTier.id,
      message: `تهانينا! لقد ترقيت إلى مستوى ${nextTier.name}`
    }
  }
  
  return {
    success: true,
    transaction,
    newPoints,
    tierUpgrade,
    message: `تم إضافة ${calculatedPoints} نقطة إلى حسابك`
  }
}

async function redeemLoyaltyReward(data: any) {
  const { customerId, rewardId } = data
  
  const customerLoyalty = await getCustomerLoyalty(customerId)
  const rewards = await getLoyaltyRewards()
  const reward = rewards.find(r => r.id === rewardId)
  
  if (!reward) {
    throw new Error('Reward not found')
  }
  
  if (customerLoyalty.points < reward.pointsRequired) {
    throw new Error('Insufficient points')
  }
  
  if (reward.isLimited && reward.claimedCount >= (reward.limitCount || 0)) {
    throw new Error('Reward no longer available')
  }
  
  // Create redemption transaction
  const transaction = {
    id: Date.now().toString(),
    customerId,
    type: 'redeemed',
    points: reward.pointsRequired,
    description: `استبدال: ${reward.name}`,
    referenceId: rewardId,
    referenceType: 'reward',
    createdAt: new Date()
  }
  
  // Update customer points
  const newPoints = customerLoyalty.points - reward.pointsRequired
  
  return {
    success: true,
    transaction,
    newPoints,
    reward,
    message: `تم استبدال ${reward.name} بنجاح`,
    expiryDate: new Date(Date.now() + reward.validity * 24 * 60 * 60 * 1000)
  }
}

async function joinLoyaltyProgram(data: any) {
  const { customerId } = data
  
  const loyalty = {
    customerId,
    points: 100, // Welcome bonus
    tier: 'bronze',
    tierProgress: 0,
    totalEarned: 100,
    totalSpent: 0,
    joinDate: new Date(),
    lastActivity: new Date(),
    nextTierProgress: 900,
    rewardsClaimed: 0,
    referrals: 0,
    streak: 1
  }
  
  // Create welcome bonus transaction
  const transaction = {
    id: Date.now().toString(),
    customerId,
    type: 'earned',
    points: 100,
    description: 'مكافأة الانضمام لبرنامج الولاء',
    createdAt: new Date()
  }
  
  return {
    success: true,
    loyalty,
    transaction,
    message: 'مرحباً بك في برنامج الولاء! لقد حصلت على 100 نقطة مكافأة'
  }
}

async function createLoyaltyReward(data: any) {
  const reward = {
    id: Date.now().toString(),
    ...data,
    claimedCount: 0,
    isActive: true,
    createdAt: new Date()
  }
  
  return {
    success: true,
    reward,
    message: 'تم إنشاء المكافأة بنجاح'
  }
}

async function updateLoyaltyTier(data: any) {
  const { customerId, newTier } = data
  
  const customerLoyalty = await getCustomerLoyalty(customerId)
  
  return {
    success: true,
    customerId,
    oldTier: customerLoyalty.tier,
    newTier,
    message: `تم تحديث مستوى الولاء إلى ${newTier}`
  }
}

async function processReferral(data: any) {
  const { referrerId, referredId } = data
  
  // Award points to referrer
  const referrerBonus = 200
  const referredBonus = 100
  
  const referrerTransaction = {
    id: Date.now().toString(),
    customerId: referrerId,
    type: 'earned',
    points: referrerBonus,
    description: 'مكافأة إحالة صديق',
    referenceId: referredId,
    referenceType: 'referral',
    createdAt: new Date()
  }
  
  const referredTransaction = {
    id: (Date.now() + 1).toString(),
    customerId: referredId,
    type: 'earned',
    points: referredBonus,
    description: 'مكافأة الانضمام عبر إحالة',
    referenceId: referrerId,
    referenceType: 'referral',
    createdAt: new Date()
  }
  
  return {
    success: true,
    referrerTransaction,
    referredTransaction,
    message: 'تمت معالجة الإحالة بنجاح'
  }
}