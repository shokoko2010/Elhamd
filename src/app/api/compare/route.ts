import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface Car {
  id: string
  name: string
  brand: string
  price: number
  year: number
  fuelType: string
  transmission: string
  engine: string
  mileage: number
  power: number
  torque: number
  seats: number
  bodyType: string
  features: string[]
  safetyRating: number
}

const carsData: Car[] = [
  {
    id: '1',
    name: 'Nexon',
    brand: 'TATA',
    price: 800000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engine: '1.2L Turbo',
    mileage: 18,
    power: 110,
    torque: 170,
    seats: 5,
    bodyType: 'SUV',
    features: ['Touchscreen', 'Automatic Climate Control', 'Reverse Camera', 'ABS', 'Airbags'],
    safetyRating: 5
  },
  {
    id: '2',
    name: 'Punch',
    brand: 'TATA',
    price: 600000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engine: '1.2L',
    mileage: 20,
    power: 86,
    torque: 113,
    seats: 5,
    bodyType: 'SUV',
    features: ['Touchscreen', 'Manual AC', 'Reverse Camera', 'ABS', 'Airbags'],
    safetyRating: 5
  },
  {
    id: '3',
    name: 'Swift',
    brand: 'Maruti',
    price: 650000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engine: '1.2L',
    mileage: 23,
    power: 83,
    torque: 113,
    seats: 5,
    bodyType: 'Hatchback',
    features: ['Touchscreen', 'Manual AC', 'Reverse Camera', 'ABS', 'Airbags'],
    safetyRating: 4
  },
  {
    id: '4',
    name: 'Venue',
    brand: 'Hyundai',
    price: 750000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engine: '1.2L',
    mileage: 19,
    power: 83,
    torque: 114,
    seats: 5,
    bodyType: 'SUV',
    features: ['Touchscreen', 'Automatic Climate Control', 'Reverse Camera', 'ABS', 'Airbags'],
    safetyRating: 4
  },
  {
    id: '5',
    name: 'Creta',
    brand: 'Hyundai',
    price: 1100000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engine: '1.5L',
    mileage: 17,
    power: 115,
    torque: 144,
    seats: 5,
    bodyType: 'SUV',
    features: ['Large Touchscreen', 'Automatic Climate Control', '360° Camera', 'ABS', '6 Airbags', 'Sunroof'],
    safetyRating: 5
  },
  {
    id: '6',
    name: 'Baleno',
    brand: 'Maruti',
    price: 700000,
    year: 2024,
    fuelType: 'Petrol',
    transmission: 'Manual',
    engine: '1.2L',
    mileage: 22,
    power: 83,
    torque: 113,
    seats: 5,
    bodyType: 'Hatchback',
    features: ['Touchscreen', 'Manual AC', 'Reverse Camera', 'ABS', 'Airbags'],
    safetyRating: 4
  },
  {
    id: '7',
    name: 'Thar',
    brand: 'Mahindra',
    price: 1500000,
    year: 2024,
    fuelType: 'Diesel',
    transmission: 'Manual',
    engine: '2.0L',
    mileage: 15,
    power: 132,
    torque: 300,
    seats: 4,
    bodyType: 'SUV',
    features: ['Touchscreen', 'Manual AC', '4WD', 'ABS', 'Airbags', 'Convertible Top'],
    safetyRating: 4
  },
  {
    id: '8',
    name: 'XUV700',
    brand: 'Mahindra',
    price: 1800000,
    year: 2024,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    engine: '2.0L',
    mileage: 16,
    power: 155,
    torque: 360,
    seats: 7,
    bodyType: 'SUV',
    features: ['Large Touchscreen', 'Automatic Climate Control', '360° Camera', 'ABS', '7 Airbags', 'ADAS'],
    safetyRating: 5
  }
]

function generateComparisonAnalysis(cars: Car[]): string {
  if (cars.length < 2) {
    return "Please select at least 2 cars for comparison."
  }

  let analysis = `# Car Comparison Analysis\n\n`
  
  cars.forEach((car, index) => {
    analysis += `## ${index + 1}. ${car.brand} ${car.name}\n`
    analysis += `- **Price**: ₹${car.price.toLocaleString('en-IN')}\n`
    analysis += `- **Engine**: ${car.engine} (${car.power} bhp, ${car.torque} Nm)\n`
    analysis += `- **Mileage**: ${car.mileage} km/l\n`
    analysis += `- **Fuel Type**: ${car.fuelType}\n`
    analysis += `- **Transmission**: ${car.transmission}\n`
    analysis += `- **Safety Rating**: ${car.safetyRating}/5\n`
    analysis += `- **Key Features**: ${car.features.join(', ')}\n\n`
  })

  analysis += `## Detailed Comparison\n\n`

  const priceRange = Math.max(...cars.map(c => c.price)) - Math.min(...cars.map(c => c.price))
  const mostExpensive = cars.find(c => c.price === Math.max(...cars.map(c => c.price)))
  const mostAffordable = cars.find(c => c.price === Math.min(...cars.map(c => c.price)))
  
  analysis += `### Price Analysis\n`
  analysis += `- **Most Affordable**: ${mostAffordable?.brand} ${mostAffordable?.name} (₹${mostAffordable?.price.toLocaleString('en-IN')})\n`
  analysis += `- **Most Expensive**: ${mostExpensive?.brand} ${mostExpensive?.name} (₹${mostExpensive?.price.toLocaleString('en-IN')})\n`
  analysis += `- **Price Range**: ₹${priceRange.toLocaleString('en-IN')}\n\n`

  const bestMileage = cars.reduce((prev, current) => (prev.mileage > current.mileage) ? prev : current)
  const mostPowerful = cars.reduce((prev, current) => (prev.power > current.power) ? prev : current)
  const highestSafety = cars.reduce((prev, current) => (prev.safetyRating > current.safetyRating) ? prev : current)

  analysis += `### Key Winners\n`
  analysis += `- **Best Mileage**: ${bestMileage.brand} ${bestMileage.name} (${bestMileage.mileage} km/l)\n`
  analysis += `- **Most Powerful**: ${mostPowerful.brand} ${mostPowerful.name} (${mostPowerful.power} bhp)\n`
  analysis += `- **Highest Safety**: ${highestSafety.brand} ${highestSafety.name} (${highestSafety.safetyRating}/5)\n\n`

  analysis += `### Recommendations\n\n`
  
  if (mostAffordable && bestMileage.id === mostAffordable.id) {
    analysis += `🏆 **Best Value for Money**: ${mostAffordable.brand} ${mostAffordable.name} - Most affordable with best mileage\n\n`
  }

  if (mostPowerful.safetyRating >= 4) {
    analysis += `🚀 **Performance & Safety**: ${mostPowerful.brand} ${mostPowerful.name} - Great performance with good safety rating\n\n`
  }

  analysis += `### Final Verdict\n`
  
  if (cars.length === 2) {
    const car1 = cars[0]
    const car2 = cars[1]
    
    if (car1.price < car2.price && car1.mileage > car2.mileage) {
      analysis += `${car1.brand} ${car1.name} offers better value with lower price and better mileage.`
    } else if (car2.price < car1.price && car2.mileage > car1.mileage) {
      analysis += `${car2.brand} ${car2.name} offers better value with lower price and better mileage.`
    } else if (car1.power > car2.power && car1.safetyRating >= car2.safetyRating) {
      analysis += `${car1.brand} ${car1.name} is better for performance enthusiasts with good safety.`
    } else if (car2.power > car1.power && car2.safetyRating >= car1.safetyRating) {
      analysis += `${car2.brand} ${car2.name} is better for performance enthusiasts with good safety.`
    } else {
      analysis += `Both cars have their strengths. Choose based on your priorities - budget, mileage, performance, or safety.`
    }
  } else {
    analysis += `With multiple options, consider your primary need:\n`
    analysis += `- For budget-conscious buyers: ${mostAffordable?.brand} ${mostAffordable?.name}\n`
    analysis += `- For performance: ${mostPowerful.brand} ${mostPowerful.name}\n`
    analysis += `- For fuel efficiency: ${bestMileage.brand} ${bestMileage.name}\n`
    analysis += `- For safety: ${highestSafety.brand} ${highestSafety.name}\n`
  }

  return analysis
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carIds, useAI = false } = body

    if (!carIds || !Array.isArray(carIds) || carIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please select at least 2 cars for comparison' },
        { status: 400 }
      )
    }

    const selectedCars = carsData.filter(car => carIds.includes(car.id))

    if (selectedCars.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Valid cars not found' },
        { status: 404 }
      )
    }

    let analysis = generateComparisonAnalysis(selectedCars)

    if (useAI) {
      try {
        const zai = await ZAI.create()
        
        const carDetails = selectedCars.map(car => 
          `${car.brand} ${car.name}: Price ₹${car.price}, ${car.engine}, ${car.power}bhp, ${car.mileage}km/l, ${car.fuelType}, Safety ${car.safetyRating}/5`
        ).join('\n')

        const aiPrompt = `As an automotive expert, provide a detailed comparison analysis for these cars:\n${carDetails}\n\nPlease provide:\n1. Overall comparison summary\n2. Pros and cons of each car\n3. Best use case for each car\n4. Final recommendation\n\nKeep it concise and practical for Indian car buyers.`

        const aiCompletion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an automotive expert specializing in Indian cars. Provide practical, unbiased advice.'
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })

        const aiAnalysis = aiCompletion.choices[0]?.message?.content
        if (aiAnalysis) {
          analysis += `\n\n---\n\n## AI Expert Analysis\n\n${aiAnalysis}`
        }
      } catch (aiError) {
        console.error('AI Analysis failed:', aiError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        cars: selectedCars,
        analysis,
        comparison: {
          count: selectedCars.length,
          priceRange: {
            min: Math.min(...selectedCars.map(c => c.price)),
            max: Math.max(...selectedCars.map(c => c.price))
          },
          bestMileage: selectedCars.reduce((prev, current) => (prev.mileage > current.mileage) ? prev : current),
          mostPowerful: selectedCars.reduce((prev, current) => (prev.power > current.power) ? prev : current),
          highestSafety: selectedCars.reduce((prev, current) => (prev.safetyRating > current.safetyRating) ? prev : current)
        }
      }
    })

  } catch (error) {
    console.error('Comparison API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate comparison' },
      { status: 500 }
    )
  }
}