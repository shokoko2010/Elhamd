import { db } from '@/lib/db'
import { PerformanceAnalyticsService } from './performance-analytics-service'

// Types for business reporting
export interface SalesReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalRevenue: number
    totalVehiclesSold: number
    averageSalePrice: number
    topSellingVehicle: string
    conversionRate: number
    revenueGrowth: number
  }
  salesByVehicle: Array<{
    vehicleId: string
    make: string
    model: string
    unitsSold: number
    revenue: number
    averagePrice: number
  }>
  salesByMonth: Array<{
    month: string
    revenue: number
    unitsSold: number
  }>
  salesByEmployee: Array<{
    employeeId: string
    employeeName: string
    unitsSold: number
    revenue: number
    commission: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    revenue: number
    percentage: number
  }>
}

export interface CustomerReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    averageOrderValue: number
    customerLifetimeValue: number
    retentionRate: number
  }
  customerDemographics: Array<{
    segment: string
    count: number
    percentage: number
    averageSpending: number
  }>
  customerAcquisition: Array<{
    month: string
    newCustomers: number
    acquisitionCost: number
  }>
  topCustomers: Array<{
    customerId: string
    name: string
    totalSpent: number
    purchases: number
    lastPurchase: Date
  }>
  geographicDistribution: Array<{
    region: string
    customers: number
    revenue: number
  }>
}

export interface EmployeeReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalEmployees: number
    activeEmployees: number
    averagePerformance: number
    totalCommissions: number
    customerSatisfaction: number
  }
  employeePerformance: Array<{
    employeeId: string
    name: string
    role: string
    sales: number
    revenue: number
    commission: number
    satisfaction: number
    efficiency: number
  }>
  performanceByRole: Array<{
    role: string
    employees: number
    averageRevenue: number
    averageSatisfaction: number
  }>
  productivityMetrics: Array<{
    metric: string
    value: number
    target: number
    status: 'above' | 'below' | 'on_target'
  }>
}

export interface ServiceReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalServices: number
    serviceRevenue: number
    averageServiceCost: number
    completionRate: number
    customerSatisfaction: number
    popularService: string
  }
  servicesByType: Array<{
    serviceType: string
    count: number
    revenue: number
    averageCost: number
    satisfaction: number
  }>
  serviceTrends: Array<{
    month: string
    services: number
    revenue: number
  }>
  technicianPerformance: Array<{
    technicianId: string
    name: string
    servicesCompleted: number
    revenue: number
    averageTime: number
    satisfaction: number
  }>
}

export interface InventoryReport {
  summary: {
    totalVehicles: number
    totalValue: number
    lowStockItems: number
    turnoverRate: number
    daysOfInventory: number
  }
  inventoryByCategory: Array<{
    category: string
    count: number
    value: number
    turnoverRate: number
  }>
  agingAnalysis: Array<{
    ageRange: string
    count: number
    value: number
    percentage: number
  }>
  stockLevelAlerts: Array<{
    vehicleId: string
    make: string
    model: string
    currentStock: number
    minimumStock: number
    status: 'low' | 'critical' | 'out_of_stock'
  }>
}

export interface ReportConfig {
  type: 'sales' | 'customers' | 'employees' | 'services' | 'inventory'
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
  format: 'json' | 'pdf' | 'excel' | 'csv'
  includeCharts?: boolean
  includeTrends?: boolean
  includeRecommendations?: boolean
}

export interface ScheduledReport {
  id: string
  name: string
  config: ReportConfig
  recipients: string[]
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    time: string
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
  }
  isActive: boolean
  lastGenerated?: Date
  nextGeneration: Date
}

export class AdvancedReportingService {
  private static instance: AdvancedReportingService
  private performanceAnalytics: PerformanceAnalyticsService

  private constructor() {
    this.performanceAnalytics = PerformanceAnalyticsService.getInstance()
  }

  static getInstance(): AdvancedReportingService {
    if (!AdvancedReportingService.instance) {
      AdvancedReportingService.instance = new AdvancedReportingService()
    }
    return AdvancedReportingService.instance
  }

  // Generate Sales Report
  async generateSalesReport(config: ReportConfig): Promise<SalesReport> {
    const { startDate, endDate } = config.period

    // Get completed bookings (sales) for the period
    const bookings = await db.booking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED',
        type: 'SALE'
      },
      include: {
        vehicle: true,
        customer: true,
        payments: true
      }
    })

    // Calculate summary metrics
    const totalRevenue = bookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0
    )
    const totalVehiclesSold = bookings.length
    const averageSalePrice = totalVehiclesSold > 0 ? totalRevenue / totalVehiclesSold : 0

    // Group sales by vehicle
    const salesByVehicleMap = new Map()
    bookings.forEach(booking => {
      if (booking.vehicle) {
        const key = booking.vehicle.id
        if (!salesByVehicleMap.has(key)) {
          salesByVehicleMap.set(key, {
            vehicleId: booking.vehicle.id,
            make: booking.vehicle.make,
            model: booking.vehicle.model,
            unitsSold: 0,
            revenue: 0
          })
        }
        const vehicle = salesByVehicleMap.get(key)
        vehicle.unitsSold++
        vehicle.revenue += booking.totalPrice || 0
      }
    })

    const salesByVehicle = Array.from(salesByVehicleMap.values()).map(vehicle => ({
      ...vehicle,
      averagePrice: vehicle.revenue / vehicle.unitsSold
    }))

    // Find top selling vehicle
    const topSellingVehicle = salesByVehicle.reduce((top, vehicle) => 
      vehicle.unitsSold > top.unitsSold ? vehicle : top, 
      { unitsSold: 0, make: '', model: '' }
    )

    // Group sales by month
    const salesByMonthMap = new Map()
    bookings.forEach(booking => {
      const month = booking.date.toISOString().slice(0, 7) // YYYY-MM
      if (!salesByMonthMap.has(month)) {
        salesByMonthMap.set(month, { month, revenue: 0, unitsSold: 0 })
      }
      const monthData = salesByMonthMap.get(month)
      monthData.revenue += booking.totalPrice || 0
      monthData.unitsSold++
    })

    const salesByMonth = Array.from(salesByMonthMap.values())

    // Group sales by employee (if assigned)
    const salesByEmployeeMap = new Map()
    bookings.forEach(booking => {
      // This would need to be adjusted based on your employee assignment logic
      const employeeId = 'default' // Placeholder
      if (!salesByEmployeeMap.has(employeeId)) {
        salesByEmployeeMap.set(employeeId, {
          employeeId,
          employeeName: 'Sales Team',
          unitsSold: 0,
          revenue: 0,
          commission: 0
        })
      }
      const employee = salesByEmployeeMap.get(employeeId)
      employee.unitsSold++
      employee.revenue += booking.totalPrice || 0
      employee.commission = employee.revenue * 0.05 // 5% commission
    })

    const salesByEmployee = Array.from(salesByEmployeeMap.values())

    // Analyze payment methods
    const paymentMethodsMap = new Map()
    bookings.forEach(booking => {
      booking.payments.forEach(payment => {
        const method = payment.paymentMethod
        if (!paymentMethodsMap.has(method)) {
          paymentMethodsMap.set(method, { method, count: 0, revenue: 0 })
        }
        const methodData = paymentMethodsMap.get(method)
        methodData.count++
        methodData.revenue += payment.amount
      })
    })

    const paymentMethods = Array.from(paymentMethodsMap.values()).map(method => ({
      ...method,
      percentage: (method.revenue / totalRevenue) * 100
    }))

    // Calculate conversion rate (would need lead data)
    const conversionRate = 15.5 // Placeholder - would calculate from leads

    // Calculate revenue growth (would need previous period data)
    const revenueGrowth = 12.3 // Placeholder

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalRevenue,
        totalVehiclesSold,
        averageSalePrice,
        topSellingVehicle: `${topSellingVehicle.make} ${topSellingVehicle.model}`,
        conversionRate,
        revenueGrowth
      },
      salesByVehicle,
      salesByMonth,
      salesByEmployee,
      paymentMethods
    }
  }

  // Generate Customer Report
  async generateCustomerReport(config: ReportConfig): Promise<CustomerReport> {
    const { startDate, endDate } = config.period

    // Get all customers
    const customers = await db.user.findMany({
      where: {
        role: 'CUSTOMER',
        isActive: true
      },
      include: {
        bookings: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            payments: true
          }
        }
      }
    })

    const totalCustomers = customers.length
    const newCustomers = customers.filter(customer => 
      customer.createdAt >= startDate && customer.createdAt <= endDate
    ).length
    const returningCustomers = customers.filter(customer =>
      customer.bookings.length > 1
    ).length

    // Calculate average order value
    const totalRevenue = customers.reduce((sum, customer) => 
      sum + customer.bookings.reduce((bookingSum, booking) => 
        bookingSum + (booking.totalPrice || 0), 0), 0
    )
    const totalOrders = customers.reduce((sum, customer) => 
      sum + customer.bookings.length, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate customer lifetime value
    const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    // Calculate retention rate
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0

    // Customer demographics (simplified segmentation)
    const customerDemographics = [
      { segment: 'New Customers', count: newCustomers, percentage: (newCustomers / totalCustomers) * 100, averageSpending: customerLifetimeValue },
      { segment: 'Returning Customers', count: returningCustomers, percentage: (returningCustomers / totalCustomers) * 100, averageSpending: customerLifetimeValue * 1.5 }
    ]

    // Customer acquisition trends
    const customerAcquisitionMap = new Map()
    customers.forEach(customer => {
      const month = customer.createdAt.toISOString().slice(0, 7)
      if (!customerAcquisitionMap.has(month)) {
        customerAcquisitionMap.set(month, { month, newCustomers: 0, acquisitionCost: 500 })
      }
      const monthData = customerAcquisitionMap.get(month)
      monthData.newCustomers++
    })

    const customerAcquisition = Array.from(customerAcquisitionMap.values())

    // Top customers
    const topCustomers = customers
      .map(customer => ({
        customerId: customer.id,
        name: customer.name || 'Unknown',
        totalSpent: customer.bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
        purchases: customer.bookings.length,
        lastPurchase: customer.bookings.length > 0 ? 
          new Date(Math.max(...customer.bookings.map(b => b.date.getTime()))) : new Date()
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Geographic distribution (simplified)
    const geographicDistribution = [
      { region: 'Cairo', customers: Math.floor(totalCustomers * 0.6), revenue: totalRevenue * 0.6 },
      { region: 'Alexandria', customers: Math.floor(totalCustomers * 0.2), revenue: totalRevenue * 0.2 },
      { region: 'Other', customers: Math.floor(totalCustomers * 0.2), revenue: totalRevenue * 0.2 }
    ]

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        averageOrderValue,
        customerLifetimeValue,
        retentionRate
      },
      customerDemographics,
      customerAcquisition,
      topCustomers,
      geographicDistribution
    }
  }

  // Generate Employee Report
  async generateEmployeeReport(config: ReportConfig): Promise<EmployeeReport> {
    const { startDate, endDate } = config.period

    // Get employees (excluding customers)
    const employees = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SALES', 'SERVICE_ADVISOR', 'MANAGER']
        },
        isActive: true
      },
      include: {
        bookings: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            payments: true
          }
        },
        performanceMetrics: true
      }
    })

    const totalEmployees = employees.length
    const activeEmployees = employees.filter(emp => emp.bookings.length > 0).length

    // Calculate performance metrics
    const employeePerformance = employees.map(employee => {
      const revenue = employee.bookings.reduce((sum, booking) => 
        sum + (booking.totalPrice || 0), 0)
      const sales = employee.bookings.length
      const commission = revenue * 0.05 // 5% commission
      const satisfaction = employee.performanceMetrics?.[0]?.customerSatisfaction || 4.5
      const efficiency = sales > 0 ? revenue / sales : 0

      return {
        employeeId: employee.id,
        name: employee.name || 'Unknown',
        role: employee.role,
        sales,
        revenue,
        commission,
        satisfaction,
        efficiency
      }
    })

    const averagePerformance = employeePerformance.length > 0 ? 
      employeePerformance.reduce((sum, emp) => sum + emp.satisfaction, 0) / employeePerformance.length : 0

    const totalCommissions = employeePerformance.reduce((sum, emp) => sum + emp.commission, 0)

    // Group by role
    const performanceByRoleMap = new Map()
    employeePerformance.forEach(emp => {
      if (!performanceByRoleMap.has(emp.role)) {
        performanceByRoleMap.set(emp.role, {
          role: emp.role,
          employees: 0,
          averageRevenue: 0,
          averageSatisfaction: 0
        })
      }
      const roleData = performanceByRoleMap.get(emp.role)
      roleData.employees++
      roleData.averageRevenue += emp.revenue
      roleData.averageSatisfaction += emp.satisfaction
    })

    const performanceByRole = Array.from(performanceByRoleMap.values()).map(role => ({
      ...role,
      averageRevenue: role.employees > 0 ? role.averageRevenue / role.employees : 0,
      averageSatisfaction: role.employees > 0 ? role.averageSatisfaction / role.employees : 0
    }))

    // Productivity metrics
    const productivityMetrics = [
      { metric: 'Sales per Employee', value: activeEmployees > 0 ? employeePerformance.reduce((sum, emp) => sum + emp.sales, 0) / activeEmployees : 0, target: 10, status: 'above' as const },
      { metric: 'Revenue per Employee', value: activeEmployees > 0 ? employeePerformance.reduce((sum, emp) => sum + emp.revenue, 0) / activeEmployees : 0, target: 50000, status: 'above' as const },
      { metric: 'Customer Satisfaction', value: averagePerformance, target: 4.5, status: 'on_target' as const }
    ]

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalEmployees,
        activeEmployees,
        averagePerformance,
        totalCommissions,
        customerSatisfaction: averagePerformance
      },
      employeePerformance,
      performanceByRole,
      productivityMetrics
    }
  }

  // Generate Service Report
  async generateServiceReport(config: ReportConfig): Promise<ServiceReport> {
    const { startDate, endDate } = config.period

    // Get service bookings
    const serviceBookings = await db.serviceBooking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        serviceType: true,
        customer: true,
        payments: true
      }
    })

    const totalServices = serviceBookings.length
    const serviceRevenue = serviceBookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0)
    const averageServiceCost = totalServices > 0 ? serviceRevenue / totalServices : 0
    const completionRate = serviceBookings.filter(booking => 
      booking.status === 'COMPLETED'
    ).length / totalServices * 100

    // Calculate customer satisfaction (placeholder)
    const customerSatisfaction = 4.3

    // Group by service type
    const servicesByTypeMap = new Map()
    serviceBookings.forEach(booking => {
      if (booking.serviceType) {
        const type = booking.serviceType.name
        if (!servicesByTypeMap.has(type)) {
          servicesByTypeMap.set(type, {
            serviceType: type,
            count: 0,
            revenue: 0,
            averageCost: 0,
            satisfaction: 4.0 + Math.random() // Random satisfaction
          })
        }
        const typeData = servicesByTypeMap.get(type)
        typeData.count++
        typeData.revenue += booking.totalPrice || 0
      }
    })

    const servicesByType = Array.from(servicesByTypeMap.values()).map(type => ({
      ...type,
      averageCost: type.revenue / type.count
    }))

    // Find popular service
    const popularService = servicesByType.reduce((popular, service) => 
      service.count > popular.count ? service : { serviceType: '', count: 0 }
    ).serviceType

    // Service trends
    const serviceTrendsMap = new Map()
    serviceBookings.forEach(booking => {
      const month = booking.date.toISOString().slice(0, 7)
      if (!serviceTrendsMap.has(month)) {
        serviceTrendsMap.set(month, { month, services: 0, revenue: 0 })
      }
      const monthData = serviceTrendsMap.get(month)
      monthData.services++
      monthData.revenue += booking.totalPrice || 0
    })

    const serviceTrends = Array.from(serviceTrendsMap.values())

    // Technician performance (simplified)
    const technicianPerformance = [
      { technicianId: '1', name: 'Technician 1', servicesCompleted: 25, revenue: 15000, averageTime: 2.5, satisfaction: 4.5 },
      { technicianId: '2', name: 'Technician 2', servicesCompleted: 30, revenue: 18000, averageTime: 2.2, satisfaction: 4.7 }
    ]

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalServices,
        serviceRevenue,
        averageServiceCost,
        completionRate,
        customerSatisfaction,
        popularService
      },
      servicesByType,
      serviceTrends,
      technicianPerformance
    }
  }

  // Generate Inventory Report
  async generateInventoryReport(): Promise<InventoryReport> {
    // Get all vehicles
    const vehicles = await db.vehicle.findMany({
      where: {
        status: 'AVAILABLE'
      }
    })

    const totalVehicles = vehicles.length
    const totalValue = vehicles.reduce((sum, vehicle) => sum + vehicle.price, 0)

    // Calculate turnover rate (simplified)
    const turnoverRate = 0.8 // 80% annual turnover
    const daysOfInventory = 45 // Average days in inventory

    // Group by category
    const inventoryByCategoryMap = new Map()
    vehicles.forEach(vehicle => {
      const category = vehicle.category
      if (!inventoryByCategoryMap.has(category)) {
        inventoryByCategoryMap.set(category, {
          category,
          count: 0,
          value: 0,
          turnoverRate: 0.7 + Math.random() * 0.3 // Random turnover rate
        })
      }
      const categoryData = inventoryByCategoryMap.get(category)
      categoryData.count++
      categoryData.value += vehicle.price
    })

    const inventoryByCategory = Array.from(inventoryByCategoryMap.values())

    // Aging analysis
    const agingAnalysis = [
      { ageRange: '0-30 days', count: Math.floor(totalVehicles * 0.6), value: totalValue * 0.6, percentage: 60 },
      { ageRange: '31-60 days', count: Math.floor(totalVehicles * 0.3), value: totalValue * 0.3, percentage: 30 },
      { ageRange: '61-90 days', count: Math.floor(totalVehicles * 0.1), value: totalValue * 0.1, percentage: 10 }
    ]

    // Low stock alerts (simplified)
    const lowStockItems = vehicles.length < 10 ? 1 : 0
    const stockLevelAlerts = vehicles.length < 10 ? [{
      vehicleId: 'alert',
      make: 'Various',
      model: 'Models',
      currentStock: vehicles.length,
      minimumStock: 10,
      status: 'low' as const
    }] : []

    return {
      summary: {
        totalVehicles,
        totalValue,
        lowStockItems,
        turnoverRate,
        daysOfInventory
      },
      inventoryByCategory,
      agingAnalysis,
      stockLevelAlerts
    }
  }

  // Generate report based on config
  async generateReport(config: ReportConfig) {
    switch (config.type) {
      case 'sales':
        return this.generateSalesReport(config)
      case 'customers':
        return this.generateCustomerReport(config)
      case 'employees':
        return this.generateEmployeeReport(config)
      case 'services':
        return this.generateServiceReport(config)
      case 'inventory':
        return this.generateInventoryReport()
      default:
        throw new Error(`Unknown report type: ${config.type}`)
    }
  }

  // Export report in different formats
  async exportReport(report: any, format: 'json' | 'csv' | 'excel' | 'pdf') {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)
      case 'csv':
        return this.convertToCSV(report)
      case 'excel':
        // Would use a library like exceljs
        return this.convertToExcel(report)
      case 'pdf':
        // Would use a library like pdfkit or puppeteer
        return this.convertToPDF(report)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // Convert report to CSV
  private convertToCSV(report: any): string {
    // Simplified CSV conversion - would need to be more sophisticated
    const headers = Object.keys(report.summary || {}).join(',')
    const values = Object.values(report.summary || {}).join(',')
    return `${headers}\n${values}`
  }

  // Convert report to Excel (placeholder)
  private convertToExcel(report: any): string {
    return 'Excel export would be implemented here'
  }

  // Convert report to PDF (placeholder)
  private convertToPDF(report: any): string {
    return 'PDF export would be implemented here'
  }

  // Schedule report generation
  async scheduleReport(config: ReportConfig, recipients: string[], schedule: any): Promise<ScheduledReport> {
    const scheduledReport: ScheduledReport = {
      id: `report_${Date.now()}`,
      name: `${config.type} Report - ${config.period}`,
      config,
      recipients,
      schedule,
      isActive: true,
      nextGeneration: this.calculateNextGeneration(schedule)
    }

    // In a real implementation, this would be stored in the database
    console.log('Scheduled report:', scheduledReport)
    return scheduledReport
  }

  // Calculate next generation date
  private calculateNextGeneration(schedule: any): Date {
    const now = new Date()
    switch (schedule.frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1))
      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7))
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1))
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() + 3))
      default:
        return new Date(now.setDate(now.getDate() + 1))
    }
  }

  // Get dashboard summary
  async getDashboardSummary() {
    const salesReport = await this.generateSalesReport({
      type: 'sales',
      period: 'monthly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      format: 'json'
    })

    const customerReport = await this.generateCustomerReport({
      type: 'customers',
      period: 'monthly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      format: 'json'
    })

    const performanceData = this.performanceAnalytics.getDashboardData()

    return {
      sales: salesReport.summary,
      customers: customerReport.summary,
      performance: performanceData,
      recentActivity: [
        { type: 'sale', description: 'New vehicle sold', time: '2 hours ago' },
        { type: 'customer', description: 'New customer registered', time: '4 hours ago' },
        { type: 'service', description: 'Service completed', time: '6 hours ago' }
      ]
    }
  }
}