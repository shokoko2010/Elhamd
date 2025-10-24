import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateDatabase() {
  console.log('🔍 Validating database schema and data...')
  
  try {
    const results = {
      tables: {},
      totalRecords: 0,
      issues: []
    }

    // Get all table names from Prisma
    const models = [
      'SecurityLog', 'User', 'Branch', 'Vehicle', 'VehicleImage', 'VehicleSpecification',
      'VehiclePricing', 'TestDriveBooking', 'ServiceType', 'ServiceBooking', 'Permission',
      'RoleTemplate', 'RoleTemplatePermission', 'UserPermission', 'Payment', 'TimeSlot',
      'Holiday', 'Notification', 'EmailTemplate', 'Task', 'TaskComment', 'Booking',
      'Invoice', 'InvoicePayment', 'Quotation', 'PurchaseOrder', 'TaxRate', 'Warehouse',
      'InventoryItem', 'CRMInteraction', 'CustomerFeedback', 'CustomerProfile',
      'Lead', 'LeadActivity', 'MarketingCampaign', 'CampaignMember', 'Opportunity',
      'PerformanceMetric', 'SupportTicket', 'TicketComment', 'TicketTimeline',
      'KnowledgeBaseArticle', 'KnowledgeBaseRating', 'ServiceEvaluation',
      'Complaint', 'ComplaintFollowUp', 'ActivityLog', 'CalendarEvent',
      'BranchBudget', 'BranchPermission', 'BranchTransfer', 'Transaction',
      'CustomerServiceMetric', 'MaintenanceRecord', 'MaintenancePart',
      'Warranty', 'WarrantyClaim', 'Insurance', 'InsuranceClaim',
      'Product', 'Order', 'Promotion', 'Review', 'PopupConfiguration',
      'ConsultationSubmission', 'MaintenancePartToMaintenanceRecord', 'TicketArticles'
    ]

    console.log('📊 Checking database tables...')
    
    for (const model of models) {
      try {
        // @ts-ignore
        const count = await prisma[model].count()
        results.tables[model] = count
        results.totalRecords += count
        
        if (count > 0) {
          console.log(`✅ ${model}: ${count} records`)
        } else {
          console.log(`⚠️  ${model}: 0 records`)
          results.issues.push(`${model} table is empty`)
        }
      } catch (error) {
        console.log(`❌ ${model}: Error - ${(error as Error).message}`)
        results.issues.push(`${model}: ${(error as Error).message}`)
      }
    }

    console.log('\n📈 Summary:')
    console.log(`Total tables checked: ${models.length}`)
    console.log(`Total records: ${results.totalRecords}`)
    console.log(`Issues found: ${results.issues.length}`)

    if (results.issues.length > 0) {
      console.log('\n⚠️ Issues:')
      results.issues.forEach(issue => console.log(`  - ${issue}`))
    }

    // Check critical relationships
    console.log('\n🔗 Checking critical relationships...')
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user exists')
    } else {
      console.log('❌ No admin user found')
      results.issues.push('No admin user found')
    }

    // Check if permissions exist
    const permissionCount = await prisma.permission.count()
    if (permissionCount > 0) {
      console.log(`✅ Permissions exist: ${permissionCount} permissions`)
    } else {
      console.log('❌ No permissions found')
      results.issues.push('No permissions found')
    }

    // Check if role templates exist
    const roleTemplateCount = await prisma.roleTemplate.count()
    if (roleTemplateCount > 0) {
      console.log(`✅ Role templates exist: ${roleTemplateCount} templates`)
    } else {
      console.log('❌ No role templates found')
      results.issues.push('No role templates found')
    }

    // Check if branches exist
    const branchCount = await prisma.branch.count()
    if (branchCount > 0) {
      console.log(`✅ Branches exist: ${branchCount} branches`)
    } else {
      console.log('❌ No branches found')
      results.issues.push('No branches found')
    }

    // Check if vehicles exist
    const vehicleCount = await prisma.vehicle.count()
    if (vehicleCount > 0) {
      console.log(`✅ Vehicles exist: ${vehicleCount} vehicles`)
    } else {
      console.log('❌ No vehicles found')
      results.issues.push('No vehicles found')
    }

    // Check if service types exist
    const serviceTypeCount = await prisma.serviceType.count()
    if (serviceTypeCount > 0) {
      console.log(`✅ Service types exist: ${serviceTypeCount} services`)
    } else {
      console.log('❌ No service types found')
      results.issues.push('No service types found')
    }

    // Check if tax rates exist
    const taxRateCount = await prisma.taxRate.count()
    if (taxRateCount > 0) {
      console.log(`✅ Tax rates exist: ${taxRateCount} tax rates`)
    } else {
      console.log('❌ No tax rates found')
      results.issues.push('No tax rates found')
    }

    console.log('\n🎯 Database validation completed!')
    
    if (results.issues.length === 0) {
      console.log('🎉 All checks passed! Database is properly initialized.')
    } else {
      console.log(`⚠️  Found ${results.issues.length} issues that need attention.`)
    }

    return results

  } catch (error) {
    console.error('❌ Database validation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  validateDatabase()
    .then(() => {
      console.log('✅ Validation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    })
}

export default validateDatabase