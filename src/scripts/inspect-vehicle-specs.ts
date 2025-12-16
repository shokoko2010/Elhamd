
import { db } from '../lib/db'

async function main() {
    const vehicle = await db.vehicle.findFirst({
        include: {
            specifications: true
        }
    })

    console.log('Vehicle:', vehicle?.make, vehicle?.model)
    console.log('Specs:', JSON.stringify(vehicle?.specifications, null, 2))
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await db.$disconnect()
    })
