import { db } from '@/lib/db'

export default async function TestPage() {
  let testResult = 'Loading...'
  
  try {
    // Test database connection
    await db.$connect()
    const userCount = await db.user.count()
    const vehicleCount = await db.vehicle.count()
    
    testResult = `Database connected successfully! Users: ${userCount}, Vehicles: ${vehicleCount}`
    
    await db.$disconnect()
  } catch (error) {
    console.error('Database test failed:', error)
    testResult = `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <h1 className="text-2xl font-bold">Database Connection Test</h1>
      <p className="text-lg">{testResult}</p>
      <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
    </div>
  )
}