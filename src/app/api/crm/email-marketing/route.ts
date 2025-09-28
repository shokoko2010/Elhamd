import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface EmailCampaign {
  id: string
  name: string
  description: string
  subject: string
  template: string
  segment: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduledAt?: Date
  sentAt?: Date
  totalRecipients: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  unsubscribeCount: number
  createdAt: Date
  updatedAt: Date
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'welcome' | 'promotion' | 'newsletter' | 'follow_up' | 'abandoned_cart'
  variables: string[]
  isActive: boolean
  createdAt: Date
}

interface EmailAutomation {
  id: string
  name: string
  description: string
  trigger: string
  conditions: any[]
  actions: any[]
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
  runCount: number
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const campaignId = searchParams.get('campaignId')

    if (type === 'campaigns') {
      const campaigns = await getEmailCampaigns()
      return NextResponse.json(campaigns)
    }

    if (type === 'templates') {
      const templates = await getEmailTemplates()
      return NextResponse.json(templates)
    }

    if (type === 'automations') {
      const automations = await getEmailAutomations()
      return NextResponse.json(automations)
    }

    if (type === 'analytics' && campaignId) {
      const analytics = await getCampaignAnalytics(campaignId)
      return NextResponse.json(analytics)
    }

    // Get overview
    const overview = await getEmailMarketingOverview()
    return NextResponse.json(overview)

  } catch (error) {
    console.error('Error fetching email marketing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email marketing data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create_campaign':
        const campaign = await createEmailCampaign(data)
        return NextResponse.json(campaign)

      case 'create_template':
        const template = await createEmailTemplate(data)
        return NextResponse.json(template)

      case 'create_automation':
        const automation = await createEmailAutomation(data)
        return NextResponse.json(automation)

      case 'send_campaign':
        const sendResult = await sendCampaign(data.campaignId)
        return NextResponse.json(sendResult)

      case 'schedule_campaign':
        const scheduleResult = await scheduleCampaign(data.campaignId, data.scheduledAt)
        return NextResponse.json(scheduleResult)

      case 'test_email':
        const testResult = await sendTestEmail(data)
        return NextResponse.json(testResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in email marketing POST:', error)
    return NextResponse.json(
      { error: 'Failed to process email marketing request' },
      { status: 500 }
    )
  }
}

async function getEmailMarketingOverview() {
  const [totalCampaigns, activeAutomations, totalSent, totalOpens, totalClicks] = await Promise.all([
    // These would be real database queries in production
    Promise.resolve(25),
    Promise.resolve(8),
    Promise.resolve(15420),
    Promise.resolve(8930),
    Promise.resolve(2150)
  ])

  const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0
  const clickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0

  return {
    totalCampaigns,
    activeAutomations,
    totalSent,
    totalOpens,
    totalClicks,
    openRate: Math.round(openRate * 100) / 100,
    clickRate: Math.round(clickRate * 100) / 100,
    recentActivity: [
      {
        type: 'campaign_sent',
        name: 'عرض سيارات تاتا الجديدة',
        sent: 1250,
        opens: 780,
        date: new Date().toISOString()
      },
      {
        type: 'automation_triggered',
        name: 'متابعة العملاء المحتملين',
        triggered: 45,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  // Mock campaigns - in production, these would come from database
  return [
    {
      id: '1',
      name: 'عرض سيارات تاتا الجديدة',
      description: 'إطلاق مجموعة سيارات تاتا الجديدة بخصومات خاصة',
      subject: '🚗 عروض حصرية على سيارات تاتا الجديدة!',
      template: 'promotion',
      segment: 'all',
      status: 'sent',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      totalRecipients: 1250,
      deliveredCount: 1220,
      openedCount: 780,
      clickedCount: 195,
      unsubscribeCount: 12,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'متابعة العملاء المحتملين',
      description: 'حملة متابعة للعملاء الذين أبدوا اهتماماً ولم يكملوا الشراء',
      subject: 'هل لا تزال مهتماً بسيارة تاتا؟',
      template: 'follow_up',
      segment: 'prospects',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      totalRecipients: 350,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      unsubscribeCount: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]
}

async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return [
    {
      id: '1',
      name: 'رسالة ترحيب',
      subject: 'مرحباً بك في عائلة الهامد كارز!',
      content: `
        <h1>مرحباً {{name}}!</h1>
        <p>نشكرك على انضمامك إلينا في عائلة الهامد كارز.</p>
        <p>نحن متحمسون لمساعدتك في العثور على سيارة تاتا المثالية لك.</p>
        <p>تحدث مع أحد ممثلينا اليوم لاستكشاف أحدث الموديلات والعروض الخاصة.</p>
        <p>مع أطيب التحيات،<br>فريق الهامد كارز</p>
      `,
      category: 'welcome',
      variables: ['name'],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'عرض ترويجي',
      subject: 'عرض خاص: {{discount}} خصم على سيارات تاتا!',
      content: `
        <h1>عرض حصري لك!</h1>
        <p>عزيزي {{name}}،</p>
        <p>نحن سعداء أن نقدم لك خصماً خاصاً قدره {{discount}} على جميع سيارات تاتا.</p>
        <p>هذا العرض صالح حتى {{expiry_date}}.</p>
        <p><a href="{{booking_link}}">احجز موعدك الآن</a></p>
        <p>لا تفوت هذه الفرصة الرائعة!</p>
      `,
      category: 'promotion',
      variables: ['name', 'discount', 'expiry_date', 'booking_link'],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'متابعة العميل المحتمل',
      subject: 'هل لا تزال مهتماً بسيارة تاتا {{model}}؟',
      content: `
        <h1>نتمنى أن تكون بخير!</h1>
        <p>عزيزي {{name}}،</p>
        <p>لاحظنا أنك كنت مهتماً بسيارة تاتا {{model}}.</p>
        <p>نود أن نعرف إذا كان لديك أي أسئلة أو إذا كنت بحاجة إلى مساعدة إضافية.</p>
        <p><a href="{{contact_link}}">تواصل معنا</a> أو <a href="{{booking_link}}">احجز موعد تجربة قيادة</a>.</p>
        <p>نتطلع إلى سماع منك قريباً!</p>
      `,
      category: 'follow_up',
      variables: ['name', 'model', 'contact_link', 'booking_link'],
      isActive: true,
      createdAt: new Date()
    }
  ]
}

async function getEmailAutomations(): Promise<EmailAutomation[]> {
  return [
    {
      id: '1',
      name: 'متابعة العملاء الجدد',
      description: 'إرسال سلسلة رسائل ترحيبية للعملاء الجدد',
      trigger: 'customer_created',
      conditions: [
        { field: 'customer.segment', operator: 'equals', value: 'LEAD' }
      ],
      actions: [
        { type: 'send_email', template: 'welcome', delay: '0h' },
        { type: 'send_email', template: 'follow_up', delay: '24h' },
        { type: 'send_email', template: 'promotion', delay: '72h' }
      ],
      isActive: true,
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextRun: null,
      runCount: 45,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'إعادة تفعيل العملاء غير النشطين',
      description: 'إرسال عروض خاصة للعملاء الذين لم يتفاعلوا منذ 6 أشهر',
      trigger: 'scheduled',
      conditions: [
        { field: 'customer.last_interaction', operator: 'older_than', value: '180d' },
        { field: 'customer.status', operator: 'equals', value: 'inactive' }
      ],
      actions: [
        { type: 'send_email', template: 'reactivation', delay: '0h' }
      ],
      isActive: true,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      runCount: 12,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    }
  ]
}

async function getCampaignAnalytics(campaignId: string) {
  // Mock analytics data
  return {
    campaignId,
    overview: {
      sent: 1250,
      delivered: 1220,
      opened: 780,
      clicked: 195,
      bounced: 30,
      unsubscribed: 12,
      complained: 2
    },
    rates: {
      deliveryRate: 97.6,
      openRate: 62.4,
      clickRate: 25.0,
      bounceRate: 2.4,
      unsubscribeRate: 1.0
    },
    timeline: [
      { date: '2024-01-15', sent: 1250, opened: 450, clicked: 85 },
      { date: '2024-01-16', opened: 280, clicked: 75 },
      { date: '2024-01-17', opened: 50, clicked: 35 }
    ],
    topLinks: [
      { url: '/booking', clicks: 120, percentage: 61.5 },
      { url: '/vehicles/nexon', clicks: 45, percentage: 23.1 },
      { url: '/contact', clicks: 30, percentage: 15.4 }
    ]
  }
}

async function createEmailCampaign(data: any) {
  const campaign = {
    id: Date.now().toString(),
    ...data,
    status: 'draft',
    totalRecipients: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    unsubscribeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // In production, this would save to database
  return campaign
}

async function createEmailTemplate(data: any) {
  const template = {
    id: Date.now().toString(),
    ...data,
    isActive: true,
    createdAt: new Date()
  }

  // In production, this would save to database
  return template
}

async function createEmailAutomation(data: any) {
  const automation = {
    id: Date.now().toString(),
    ...data,
    runCount: 0,
    createdAt: new Date()
  }

  // In production, this would save to database
  return automation
}

async function sendCampaign(campaignId: string) {
  // Mock sending campaign
  return {
    success: true,
    campaignId,
    message: 'Campaign sent successfully',
    sentAt: new Date(),
    recipients: 1250
  }
}

async function scheduleCampaign(campaignId: string, scheduledAt: string) {
  // Mock scheduling campaign
  return {
    success: true,
    campaignId,
    scheduledAt: new Date(scheduledAt),
    message: 'Campaign scheduled successfully'
  }
}

async function sendTestEmail(data: any) {
  const { to, templateId, variables } = data
  
  // In production, this would actually send an email
  console.log(`Sending test email to ${to} with template ${templateId}`, variables)
  
  return {
    success: true,
    message: 'Test email sent successfully',
    to,
    templateId
  }
}