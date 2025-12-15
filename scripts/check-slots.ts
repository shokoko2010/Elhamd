
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.timeSlot.count()
    console.log(`Current TimeSlot count: ${count}`)

    if (count === 0) {
        console.log('Seeding TimeSlots...')
        const slots = []
        // Days 0-6 (Sunday to Saturday)
        // Working days: Sunday(0) to Thursday(4) + Saturday(6). Friday(5) off? 
        // Usually in Egypt/Middle East: Friday is off. Saturday might be work.
        // Let's assume Saturday-Thursday are working days, Friday is off.
        // Frontend says: "Friday: 1:00 PM - 10:00 PM" in Contact Page?
        // Let's stick to standard business hours for now: 9-5.

        // 0=Sunday, 1=Monday, ... 4=Thursday, 5=Friday, 6=Saturday
        const workDays = [0, 1, 2, 3, 4, 6] // Sun, Mon, Tue, Wed, Thu, Sat

        for (const day of workDays) {
            for (let hour = 9; hour < 17; hour++) {
                const startTime = `${hour.toString().padStart(2, '0')}:00`
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

                slots.push({
                    dayOfWeek: day,
                    startTime,
                    endTime,
                    maxBookings: 2, // Allow 2 concurrent bookings per slot?
                    isActive: true
                })
            }
        }

        // Friday - maybe limited hours?
        // Let's skip Friday for now or add afternoon slots.

        await prisma.timeSlot.createMany({
            data: slots
        })
        console.log(`Seeded ${slots.length} TimeSlots.`)
    } else {
        console.log('TimeSlots already exist.')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
