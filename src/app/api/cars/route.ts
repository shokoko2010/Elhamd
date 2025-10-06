import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const brand = searchParams.get('brand')
    const bodyType = searchParams.get('bodyType')
    const fuelType = searchParams.get('fuelType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let filteredCars = [...carsData]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredCars = filteredCars.filter(car => 
        car.name.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower)
      )
    }

    if (brand) {
      filteredCars = filteredCars.filter(car => 
        car.brand.toLowerCase() === brand.toLowerCase()
      )
    }

    if (bodyType) {
      filteredCars = filteredCars.filter(car => 
        car.bodyType.toLowerCase() === bodyType.toLowerCase()
      )
    }

    if (fuelType) {
      filteredCars = filteredCars.filter(car => 
        car.fuelType.toLowerCase() === fuelType.toLowerCase()
      )
    }

    if (minPrice) {
      const min = parseInt(minPrice)
      if (!isNaN(min)) {
        filteredCars = filteredCars.filter(car => car.price >= min)
      }
    }

    if (maxPrice) {
      const max = parseInt(maxPrice)
      if (!isNaN(max)) {
        filteredCars = filteredCars.filter(car => car.price <= max)
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredCars,
      count: filteredCars.length
    })

  } catch (error) {
    console.error('Cars API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carIds } = body

    if (!carIds || !Array.isArray(carIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid car IDs' },
        { status: 400 }
      )
    }

    const selectedCars = carsData.filter(car => carIds.includes(car.id))

    return NextResponse.json({
      success: true,
      data: selectedCars,
      count: selectedCars.length
    })

  } catch (error) {
    console.error('Cars comparison API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to compare cars' },
      { status: 500 }
    )
  }
}