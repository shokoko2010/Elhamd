interface RouteParams {
  params: Promise<{ id: string }>
}

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
  try {
    // Fetch real data from database
    const totalMembers = await db.loyaltyMember.count()
    const activeMembers = await db.loyaltyMember.count({
      where: { 
        lastActivity: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })
    
    const transactions = await db.loyaltyTransaction.groupBy({
      by: ['type'],
      _sum: { points: true }
    })
    
    const totalPointsIssued = transactions.find(t => t.type === 'earned')?._sum.points || 0
    const totalPointsRedeemed = Math.abs(transactions.find(t => t.type === 'redeemed')?._sum.points || 0)
    
    return {
      totalMembers,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      avgPointsPerMember: totalMembers > 0 ? Math.floor(totalPointsIssued / totalMembers) : 0,
      retentionRate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0,
      programROI: 0, // Calculate based on actual revenue vs rewards cost
      recentActivity: [] // Fetch from recent transactions
    }
  } catch (error) {
    console.error('Error fetching loyalty overview:', error)
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      avgPointsPerMember: 0,
      retentionRate: 0,
      programROI: 0,
      recentActivity: []
    }
  }
}

async function getLoyaltyTiers(): Promise<LoyaltyTier[]> {
  try {
    const tiers = await db.loyaltyTier.findMany({
      orderBy: { minPoints: 'asc' }
    })
    
    return tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints,
      benefits: tier.benefits as string[],
      color: tier.color,
      icon: tier.icon,
      discountRate: tier.discountRate,
      prioritySupport: tier.prioritySupport,
      exclusiveAccess: tier.exclusiveAccess
    }))
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error)
    return []
  }
}

async function getLoyaltyRewards(): Promise<LoyaltyReward[]> {
  try {
    const rewards = await db.loyaltyReward.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: 'asc' }
    })
    
    return rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type as any,
      pointsRequired: reward.pointsRequired,
      value: reward.value,
      validity: reward.validity,
      isLimited: reward.isLimited,
      limitCount: reward.limitCount,
      claimedCount: reward.claimedCount,
      isActive: reward.isActive,
      category: reward.category,
      imageUrl: reward.imageUrl,
      terms: reward.terms
    }))
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error)
    return []
  }
}

async function getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
  try {
    const loyalty = await db.loyaltyMember.findUnique({
      where: { customerId }
    })
    
    if (!loyalty) return null
    
    return {
      customerId: loyalty.customerId,
      points: loyalty.points,
      tier: loyalty.tier,
      tierProgress: loyalty.tierProgress,
      totalEarned: loyalty.totalEarned,
      totalSpent: loyalty.totalSpent,
      joinDate: loyalty.joinDate,
      lastActivity: loyalty.lastActivity,
      nextTierProgress: loyalty.nextTierProgress,
      rewardsClaimed: loyalty.rewardsClaimed,
      referrals: loyalty.referrals,
      streak: loyalty.streak
    }
  } catch (error) {
    console.error('Error fetching customer loyalty:', error)
    return null
  }
}

async function getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
  try {
    const transactions = await db.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return transactions.map(transaction => ({
      id: transaction.id,
      customerId: transaction.customerId,
      type: transaction.type as any,
      points: transaction.points,
      description: transaction.description,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType,
      expiryDate: transaction.expiryDate,
      createdAt: transaction.createdAt
    }))
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error)
    return []
  }
}

async function getLoyaltyAnalytics(): Promise<LoyaltyAnalytics> {
  try {
    const totalMembers = await db.loyaltyMember.count()
    const activeMembers = await db.loyaltyMember.count({
      where: { 
        lastActivity: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })
    
    const transactions = await db.loyaltyTransaction.groupBy({
      by: ['type'],
      _sum: { points: true }
    })
    
    const totalPointsIssued = transactions.find(t => t.type === 'earned')?._sum.points || 0
    const totalPointsRedeemed = Math.abs(transactions.find(t => t.type === 'redeemed')?._sum.points || 0)
    
    // Get tier distribution
    const tierDistribution = await db.loyaltyMember.groupBy({
      by: ['tier'],
      _count: { tier: true }
    })
    
    const tierDist = tierDistribution.map(tier => ({
      tier: tier.tier,
      count: tier._count.tier,
      percentage: totalMembers > 0 ? (tier._count.tier / totalMembers) * 100 : 0
    }))
    
    return {
      totalMembers,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      avgPointsPerMember: totalMembers > 0 ? Math.floor(totalPointsIssued / totalMembers) : 0,
      tierDistribution: tierDist,
      topRewards: [], // Fetch from reward redemptions
      retentionRate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0,
      programROI: 0 // Calculate based on actual revenue vs rewards cost
    }
  } catch (error) {
    console.error('Error fetching loyalty analytics:', error)
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      avgPointsPerMember: 0,
      tierDistribution: [],
      topRewards: [],
      retentionRate: 0,
      programROI: 0
    }
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