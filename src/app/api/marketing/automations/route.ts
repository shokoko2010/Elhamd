interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MarketingAutomation, MarketingAutomationStatus } from '@prisma/client'

interface AutomationRuleWithDetails extends MarketingAutomation {
  trigger?: string
  action?: string
  conditions: string[]
  lastRun?: string
  nextRun?: string
  successRate: number
}

export async function GET(request: NextRequest) {
  try {
    // Fetch automations from database
    const automations = await db.marketingAutomation.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform database automations to match the expected interface
    const transformedAutomations: AutomationRuleWithDetails[] = automations.map(automation => {
      const triggerData = automation.trigger ? JSON.parse(automation.trigger as string) : {}
      const actionsData = automation.actions ? JSON.parse(automation.actions as string) : {}
      const metricsData = automation.metrics ? JSON.parse(automation.metrics as string) : {}
      
      return {
        ...automation,
        trigger: triggerData.event || 'Unknown',
        action: actionsData.type || 'Unknown',
        conditions: triggerData.conditions || [],
        lastRun: metricsData.lastRun,
        nextRun: metricsData.nextRun,
        successRate: metricsData.successRate || 0,
        isActive: automation.status === MarketingAutomationStatus.ACTIVE
      }
    })

    return NextResponse.json({ automations: transformedAutomations })
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, trigger, action, conditions, type } = body

    // Create new automation in database
    const newAutomation = await db.marketingAutomation.create({
      data: {
        name,
        type: type || 'EMAIL',
        status: MarketingAutomationStatus.ACTIVE,
        trigger: trigger ? JSON.stringify(trigger) : null,
        actions: action ? JSON.stringify(action) : null,
        targetAudience: conditions ? JSON.stringify({ conditions }) : null,
        createdBy: 'system', // In real app, get from authenticated user
        metrics: JSON.stringify({
          executions: 0,
          successRate: 0,
          lastRun: null,
          nextRun: null
        })
      }
    })

    // Transform to match expected interface
    const transformedAutomation: AutomationRuleWithDetails = {
      ...newAutomation,
      trigger: trigger?.event || 'Unknown',
      action: action?.type || 'Unknown',
      conditions: conditions || [],
      lastRun: null,
      nextRun: null,
      successRate: 0,
      isActive: newAutomation.status === MarketingAutomationStatus.ACTIVE
    }

    return NextResponse.json({
      success: true,
      automation: transformedAutomation,
      message: 'Automation rule created successfully'
    })
  } catch (error) {
    console.error('Error creating automation rule:', error)
    return NextResponse.json(
      { error: 'Failed to create automation rule' },
      { status: 500 }
    )
  }
}