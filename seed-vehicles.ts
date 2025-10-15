import { db } from '@/lib/db'
import { VehicleStatus } from '@prisma/client'

async function seedVehicles() {
  try {
    console.log('🚗 Starting vehicle seeding...')

    // Create sample vehicles
    const vehicles = [
      {
        make: 'Tata',
        model: 'PRIMA 3328.K',
        year: 2024,
        price: 1500000,
        stockNumber: 'TAT-001',
        vin: 'TATPRIMA3328K2024001',
        description: 'شاحنة قوية صُممت للتعامل مع أصعب المهام، مما يضمن سرعة في الإنجاز وتقليل تكاليف الصيانة.',
        category: 'TRUCK',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: VehicleStatus.AVAILABLE,
        featured: true,
      },
      {
        make: 'Tata',
        model: 'LP 613',
        year: 2024,
        price: 850000,
        stockNumber: 'TAT-002',
        vin: 'TATLP6132024002',
        description: 'حافلة مصممة لتناسب تنقلات الموظفين والمدارس والرحلات داخل المدينة.',
        category: 'VAN',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أصفر',
        status: VehicleStatus.AVAILABLE,
        featured: true,
      },
      {
        make: 'Tata',
        model: 'LPT 1618',
        year: 2024,
        price: 650000,
        stockNumber: 'TAT-003',
        vin: 'TATLPT16182024003',
        description: 'مركبة تجارية قوية ومتعددة الاستخدامات مصممة لإعادة تعريف الأداء والموثوقية.',
        category: 'COMMERCIAL',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أزرق',
        status: VehicleStatus.AVAILABLE,
        featured: true,
      },
      {
        make: 'Tata',
        model: 'ULTRA T.7',
        year: 2024,
        price: 450000,
        stockNumber: 'TAT-004',
        vin: 'TATULTRAT72024004',
        description: 'شاحنة خفيفة مثالية للخدمات اللوجستية والنقل داخل المدن.',
        category: 'COMMERCIAL',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'رمادي',
        status: VehicleStatus.AVAILABLE,
        featured: false,
      },
      {
        make: 'Tata',
        model: 'XENON SC',
        year: 2024,
        price: 380000,
        stockNumber: 'TAT-005',
        vin: 'TATXENONSC2024005',
        description: 'بيك أب يجمع بين القوة والمتانة، يوفر أداءً معززًا ويساهم في زيادة الأرباح.',
        category: 'TRUCK',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أسود',
        status: VehicleStatus.AVAILABLE,
        featured: false,
      },
      {
        make: 'Tata',
        model: 'LPT 613',
        year: 2024,
        price: 420000,
        stockNumber: 'TAT-006',
        vin: 'TATLPT6132024006',
        description: 'شاحنة صندوق قلاب استثنائية مصممة لتعزيز قدراتك في النقل.',
        category: 'COMMERCIAL',
        fuelType: 'DIESEL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: VehicleStatus.AVAILABLE,
        featured: false,
      }
    ]

    // Insert vehicles
    const createdVehicles = []
    for (const vehicleData of vehicles) {
      const vehicle = await db.vehicle.upsert({
        where: { stockNumber: vehicleData.stockNumber },
        update: vehicleData,
        create: vehicleData,
      })
      createdVehicles.push(vehicle)
      console.log(`✅ Created vehicle: ${vehicle.make} ${vehicle.model}`)
    }

    // Add sample images for vehicles
    const sampleImages = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
        altText: 'Tata PRIMA 3328.K - أمامية',
        isPrimary: true,
        order: 0
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop',
        altText: 'Tata PRIMA 3328.K - جانبية',
        isPrimary: false,
        order: 1
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1570207590283-061c953098ea?w=800&h=600&fit=crop',
        altText: 'Tata LP 613 - أمامية',
        isPrimary: true,
        order: 0
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
        altText: 'Tata LP 613 - داخلية',
        isPrimary: false,
        order: 1
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
        altText: 'Tata LPT 1618 - أمامية',
        isPrimary: true,
        order: 0
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1549399832-1efa567f5c6b?w=800&h=600&fit=crop',
        altText: 'Tata LPT 1618 - خلفية',
        isPrimary: false,
        order: 1
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1563720224035-4ce6165e9c71?w=800&h=600&fit=crop',
        altText: 'Tata Ultra T.7 - أمامية',
        isPrimary: true,
        order: 0
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
        altText: 'Tata Xenon SC - أمامية',
        isPrimary: true,
        order: 0
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
        altText: 'Tata LPT 613 Tipper - أمامية',
        isPrimary: true,
        order: 0
      }
    ]

    // Add images to vehicles
    for (let i = 0; i < createdVehicles.length && i < sampleImages.length; i++) {
      const vehicle = createdVehicles[i]
      const imageData = sampleImages[i]
      
      await db.vehicleImage.create({
        data: {
          vehicleId: vehicle.id,
          ...imageData
        }
      })
      
      console.log(`📸 Added image for: ${vehicle.make} ${vehicle.model}`)
    }

    console.log('🎉 Vehicle seeding completed successfully!')
    console.log(`Created ${createdVehicles.length} vehicles with images`)

  } catch (error) {
    console.error('❌ Error seeding vehicles:', error)
  } finally {
    await db.$disconnect()
  }
}

seedVehicles()