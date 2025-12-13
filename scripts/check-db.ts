
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected.');

        const count = await prisma.vehicle.count();
        console.log(`Total vehicles: ${count}`);

        const available = await prisma.vehicle.count({
            where: {
                status: { in: ['AVAILABLE', 'SOLD', 'RESERVED', 'COMING_SOON'] }
            }
        });
        console.log(`Vehicles matching query criteria: ${available}`);

        const allVehicles = await prisma.vehicle.findMany({
            take: 5,
            select: { id: true, make: true, model: true, status: true }
        });
        console.log('Sample vehicles:', allVehicles);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
