import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧾 Starting accounting data seed...')

  try {
    // 1. Chart of Accounts Seed Data
    console.log('Creating Chart of Accounts...')
    
    const chartOfAccounts = [
      // Assets (الأصول)
      { code: '1000', name: 'الأصول', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1100', name: 'الأصول المتداولة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1110', name: 'النقدية والبنوك', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1111', name: 'الصندوق', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1112', name: 'البنك - الأهلي', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1113', name: 'البنك - القاهرة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1120', name: 'الذمم المدينة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1121', name: 'عملاء السيارات', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1122', name: 'ذمم أخرى مدينة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1130', name: 'المخزون', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1131', name: 'قطع غيار', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1132', name: 'سيارات للبيع', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1200', name: 'الأصول الثابتة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1210', name: 'المباني والإنشاءات', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1220', name: 'معدات وآلات', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1230', name: 'سيارات خدمة', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1240', name: 'أثاث ومعدات مكتبية', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      { code: '1250', name: 'معدات حاسوبية', type: 'ASSET', normalBalance: 'DEBIT', parentId: null },
      
      // Liabilities (الخصوم)
      { code: '2000', name: 'الخصوم', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2100', name: 'الخصوم المتداولة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2110', name: 'الذمم الدائنة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2111', name: 'موردو السيارات', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2112', name: 'موردو قطع الغيار', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2120', name: 'القروض قصيرة الأجل', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2130', name: 'الضرائب المستحقة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2131', name: 'ضريبة القيمة المضافة', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2132', name: 'ضريبة الدخل', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2200', name: 'القروض طويلة الأجل', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      { code: '2210', name: 'قروض بنكية', type: 'LIABILITY', normalBalance: 'CREDIT', parentId: null },
      
      // Equity (رأس المال)
      { code: '3000', name: 'حقوق الملكية', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      { code: '3100', name: 'رأس المال', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      { code: '3110', name: 'رأس المال المدفوع', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      { code: '3200', name: 'الأرباح المحتجزة', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      { code: '3210', name: 'أرباح محتجزة - سنوات سابقة', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      { code: '3220', name: 'أرباح السنة الحالية', type: 'EQUITY', normalBalance: 'CREDIT', parentId: null },
      
      // Revenue (الإيرادات)
      { code: '4000', name: 'الإيرادات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4100', name: 'إيرادات المبيعات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4110', name: 'مبيعات السيارات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4120', name: 'مبيعات قطع الغيار', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4200', name: 'إيرادات الخدمات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4210', name: 'إيرادات الصيانة', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4220', name: 'إيرادات خدمات أخرى', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4300', name: 'إيرادات أخرى', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4310', name: 'إيرادات تأجير', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      { code: '4320', name: 'عمولات', type: 'REVENUE', normalBalance: 'CREDIT', parentId: null },
      
      // Expenses (المصروفات)
      { code: '5000', name: 'المصروفات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5100', name: 'تكلفة المبيعات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5110', name: 'تكلفة السيارات المباعة', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5120', name: 'تكلفة قطع الغيار المباعة', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5200', name: 'مصروفات الرواتب والأجور', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5210', name: 'رواتب الموظفين', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5220', name: 'عمولات المبيعات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5300', name: 'مصروفات الإيجار', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5310', name: 'إيجار المعرض', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5320', name: 'إيجار المستودعات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5400', name: 'مصروفات الصيانة والتشغيل', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5410', name: 'صيانة المعدات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5420', name: 'وقود وكهرباء', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5500', name: 'مصروفات التسويق والإعلان', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5510', name: 'إعلانات وتسويق', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5520', name: 'حملات ترويجية', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5600', name: 'مصروفات إدارية وعامة', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5610', name: 'مستلزمات مكتبية', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5620', name: 'هاتف وإنترنت', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5630', name: 'تأمينات', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5700', name: 'مصروفات متنوعة', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5710', name: 'مصاريف سفر وإنتقال', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null },
      { code: '5720', name: 'مصاريف بنكية', type: 'EXPENSE', normalBalance: 'DEBIT', parentId: null }
    ]

    for (const account of chartOfAccounts) {
      await prisma.chartOfAccount.upsert({
        where: { code: account.code },
        update: account,
        create: account
      })
    }
    console.log('✓ Chart of Accounts created')

    // 2. Tax Rates Seed Data
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
      },
      {
        name: 'ضريبة الدخل',
        rate: 22.5,
        type: 'STANDARD',
        description: 'ضريبة الدخل على الشركات',
        isActive: true,
        effectiveFrom: new Date('2023-01-01')
      },
      {
        name: 'ضريبة كماليات',
        rate: 25.0,
        type: 'STANDARD',
        description: 'ضريبة على السلع الكمالية',
        isActive: true,
        effectiveFrom: new Date('2023-01-01')
      },
      {
        name: 'رسوم دمغة',
        rate: 0.6,
        type: 'STANDARD',
        description: 'رسوم الدمغة على العقود',
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

    // 3. Sample Journal Entries
    console.log('Creating Sample Journal Entries...')
    
    // Get accounts for journal entries
    const cashAccount = await prisma.chartOfAccount.findUnique({ where: { code: '1111' } })
    const bankAccount = await prisma.chartOfAccount.findUnique({ where: { code: '1112' } })
    const carSalesAccount = await prisma.chartOfAccount.findUnique({ where: { code: '4110' } })
    const carCostAccount = await prisma.chartOfAccount.findUnique({ where: { code: '5110' } })
    const vatAccount = await prisma.chartOfAccount.findUnique({ where: { code: '2131' } })
    const supplierAccount = await prisma.chartOfAccount.findUnique({ where: { code: '2111' } })
    const salaryAccount = await prisma.chartOfAccount.findUnique({ where: { code: '5210' } })
    const rentAccount = await prisma.chartOfAccount.findUnique({ where: { code: '5310' } })

    if (cashAccount && bankAccount && carSalesAccount && carCostAccount && vatAccount && supplierAccount && salaryAccount && rentAccount) {
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

      // Sample Journal Entry 2: Car Purchase
      const journalEntry2 = await prisma.journalEntry.create({
        data: {
          entryNumber: 'JE-2024-002',
          date: new Date('2024-01-10'),
          description: 'شراء سيارات من تاتا موتورز',
          reference: 'PO-2024-001',
          totalDebit: 2000000,
          totalCredit: 2000000,
          status: 'APPROVED',
          createdBy: 'admin@elhamdimport.online',
          approvedBy: 'admin@elhamdimport.online',
          approvedAt: new Date('2024-01-10')
        }
      })

      await prisma.journalEntryItem.createMany({
        data: [
          {
            entryId: journalEntry2.id,
            accountId: carCostAccount.id,
            description: 'تكلفة السيارات المشتراة',
            debit: 1754386,
            credit: 0
          },
          {
            entryId: journalEntry2.id,
            accountId: vatAccount.id,
            description: 'ضريبة القيمة المضافة قابلة للخصم',
            debit: 245614,
            credit: 0
          },
          {
            entryId: journalEntry2.id,
            accountId: supplierAccount.id,
            description: 'ذمم دائنة لـ تاتا موتورز',
            debit: 0,
            credit: 2000000
          }
        ]
      })

      // Sample Journal Entry 3: Salary Payment
      const journalEntry3 = await prisma.journalEntry.create({
        data: {
          entryNumber: 'JE-2024-003',
          date: new Date('2024-01-25'),
          description: 'رواتب يناير 2024',
          reference: 'PAY-2024-001',
          totalDebit: 150000,
          totalCredit: 150000,
          status: 'APPROVED',
          createdBy: 'admin@elhamdimport.online',
          approvedBy: 'admin@elhamdimport.online',
          approvedAt: new Date('2024-01-25')
        }
      })

      await prisma.journalEntryItem.createMany({
        data: [
          {
            entryId: journalEntry3.id,
            accountId: salaryAccount.id,
            description: 'رواتب الموظفين',
            debit: 150000,
            credit: 0
          },
          {
            entryId: journalEntry3.id,
            accountId: bankAccount.id,
            description: 'تحويل رواتب via البنك',
            debit: 0,
            credit: 150000
          }
        ]
      })

      // Sample Journal Entry 4: Rent Payment
      const journalEntry4 = await prisma.journalEntry.create({
        data: {
          entryNumber: 'JE-2024-004',
          date: new Date('2024-01-01'),
          description: 'إيجار المعرض - يناير 2024',
          reference: 'RENT-2024-001',
          totalDebit: 50000,
          totalCredit: 50000,
          status: 'APPROVED',
          createdBy: 'admin@elhamdimport.online',
          approvedBy: 'admin@elhamdimport.online',
          approvedAt: new Date('2024-01-01')
        }
      })

      await prisma.journalEntryItem.createMany({
        data: [
          {
            entryId: journalEntry4.id,
            accountId: rentAccount.id,
            description: 'إيجار المعرض',
            debit: 50000,
            credit: 0
          },
          {
            entryId: journalEntry4.id,
            accountId: bankAccount.id,
            description: 'دفع الإيجار via البنك',
            debit: 0,
            credit: 50000
          }
        ]
      })

      console.log('✓ Sample Journal Entries created')
    }

    console.log('🎉 Accounting data seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding accounting data:', error)
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