
import { db } from '@/lib/db'

async function main() {
    console.log('--- Debugging Revenue Data ---')

    const invoiceCount = await db.invoice.count()
    console.log(`Total Invoices: ${invoiceCount}`)

    const paymentCount = await db.payment.count()
    console.log(`Total Payments: ${paymentCount}`)

    const completedPayments = await db.payment.count({
        where: { status: 'COMPLETED' }
    })
    console.log(`Completed Payments: ${completedPayments}`)

    const paymentsWithInvoice = await db.payment.count({
        where: {
            status: 'COMPLETED',
            invoiceId: { not: null }
        }
    })
    console.log(`Completed Payments WITH Invoice ID: ${paymentsWithInvoice}`)

    const revenueWithInvoice = await db.payment.aggregate({
        where: {
            status: 'COMPLETED',
            invoiceId: { not: null }
        },
        _sum: { amount: true }
    })
    console.log(`Revenue (Completed + Have Invoice ID): ${revenueWithInvoice._sum.amount}`)

    // Check for orphaned payments (Invoice ID exists but Invoice Record does not)
    // Prisma doesn't support joins in simple queries easily for this interaction without raw query or manual check
    // Let's fetch all payments with invoiceId and check if invoice exists

    const payments = await db.payment.findMany({
        where: {
            status: 'COMPLETED',
            invoiceId: { not: null }
        },
        select: { id: true, invoiceId: true, amount: true }
    })

    let orphanedCount = 0
    let orphanedAmount = 0

    for (const p of payments) {
        if (!p.invoiceId) continue;
        const invoice = await db.invoice.findUnique({
            where: { id: p.invoiceId }
        })
        if (!invoice) {
            orphanedCount++
            orphanedAmount += p.amount
            console.log(`Orphaned Payment Found! ID: ${p.id}, Amount: ${p.amount}, InvoiceId: ${p.invoiceId}`)
        }
    }

    console.log(`--- Orphaned Data Report ---`)
    console.log(`Payments linking to non-existent Invoices: ${orphanedCount}`)
    console.log(`Revenue from Orphans: ${orphanedAmount}`)
    console.log(`TRUE Corrected Revenue (Total - Orphaned): ${(revenueWithInvoice._sum.amount || 0) - orphanedAmount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect())
