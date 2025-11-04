import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting simple database seed...')

  try {
    // Get existing branches
    const branches = await prisma.branch.findMany()
    if (branches.length === 0) {
      console.log('No branches found. Please run the main seed first.')
      return
    }

    console.log(`Found ${branches.length} branches`)

    // 1. Chart of Accounts (only if not exists)
    const existingAccounts = await prisma.chartOfAccount.count()
    if (existingAccounts === 0) {
      console.log('Creating Chart of Accounts...')
      
      const chartOfAccounts = [
        { code: '1000', name: 'الأصول', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1100', name: 'الأصول المتداولة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1110', name: 'النقدية والبنوك', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1111', name: 'الصندوق', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1112', name: 'البنك - الأهلي', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1120', name: 'الذمم المدينة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1121', name: 'عملاء السيارات', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1200', name: 'الأصول الثابتة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '1210', name: 'المباني والإنشاءات', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
        { code: '2000', name: 'الخصوم', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
        { code: '2100', name: 'الخصوم المتداولة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
        { code: '2110', name: 'الذمم الدائنة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
        { code: '2111', name: 'موردو السيارات', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
        { code: '3000', name: 'حقوق الملكية', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
        { code: '3100', name: 'رأس المال', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
        { code: '4000', name: 'الإيرادات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
        { code: '4100', name: 'إيرادات المبيعات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
        { code: '4110', name: 'مبيعات السيارات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
        { code: '5000', name: 'المصروفات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
        { code: '5100', name: 'تكلفة المبيعات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
        { code: '5110', name: 'تكلفة السيارات المباعة', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
        { code: '5200', name: 'مصروفات الرواتب والأجور', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
        { code: '5210', name: 'رواتب الموظفين', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null }
      ]

      for (const account of chartOfAccounts) {
        await prisma.chartOfAccount.create({
          data: account
        })
      }
      console.log('✓ Chart of Accounts created')
    } else {
      console.log('✓ Chart of Accounts already exists')
    }

    // 2. Tax Rates (only if not exists)
    const existingTaxRates = await prisma.taxRate.count()
    if (existingTaxRates === 0) {
      console.log('Creating Tax Rates...')
      
      const taxRates = [
        {
          name: 'ضريبة القيمة المضافة',
          rate: 14.0,
          type: 'STANDARD',
          description: 'ضريبة القيمة المضافة القياسية في مصر',
          isActive: true,
          effectiveFrom: new Date('2023-01-01')
        },
        {
          name: 'ضريبة القيمة المضافة مخفضة',
          rate: 5.0,
          type: 'REDUCED',
          description: 'ضريبة القيمة المضافة المخفضة للسلع الأساسية',
          isActive: true,
          effectiveFrom: new Date('2023-01-01')
        }
      ]

      for (const tax of taxRates) {
        await prisma.taxRate.create({
          data: tax
        })
      }
      console.log('✓ Tax Rates created')
    } else {
      console.log('✓ Tax Rates already exists')
    }

    // 3. Sample Journal Entries (only if not exists)
    const existingJournalEntries = await prisma.journalEntry.count()
    if (existingJournalEntries === 0) {
      console.log('Creating Sample Journal Entries...')
      
      // Get accounts for journal entries
      const cashAccount = await prisma.chartOfAccount.findUnique({ where: { code: '1111' } })
      const carSalesAccount = await prisma.chartOfAccount.findUnique({ where: { code: '4110' } })
      const carCostAccount = await prisma.chartOfAccount.findUnique({ where: { code: '5110' } })
      const vatAccount = await prisma.chartOfAccount.findUnique({ where: { code: '2131' } })
      const supplierAccount = await prisma.chartOfAccount.findUnique({ where: { code: '2111' } })

      if (cashAccount && carSalesAccount && carCostAccount && vatAccount && supplierAccount) {
        // Sample Journal Entry 1: Car Sale
        const journalEntry1 = await prisma.journalEntry.create({
          data: {
            entryNumber: 'JE-2024-001',
            date: new Date('2024-01-15'),
            description: 'بيع سيارة تاتا نكسون - نقداً',
            reference: 'INV-2024-001',
            totalDebit: 570000,
            totalCredit: 570000,
            status: 'APPROVED',
            createdBy: 'admin@elhamdimport.online',
            approvedBy: 'admin@elhamdimport.online',
            approvedAt: new Date('2024-01-15')
          }
        })

        await prisma.journalEntryItem.createMany({
          data: [
            {
              entryId: journalEntry1.id,
              accountId: cashAccount.id,
              description: 'نقداً من بيع سيارة',
              debit: 570000,
              credit: 0
            },
            {
              entryId: journalEntry1.id,
              accountId: carSalesAccount.id,
              description: 'إيرادات بيع السيارات',
              debit: 0,
              credit: 500000
            },
            {
              entryId: journalEntry1.id,
              accountId: vatAccount.id,
              description: 'ضريبة القيمة المضافة مستحقة',
              debit: 0,
              credit: 70000
            }
          ]
        })
        console.log('✓ Sample Journal Entries created')
      }
    } else {
      console.log('✓ Journal Entries already exist')
    }

    console.log('🎉 Simple database seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })