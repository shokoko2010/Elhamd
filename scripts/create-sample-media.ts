import { db } from '@/lib/db'

async function createSampleMedia() {
  try {
    // Get admin user
    const admin = await db.user.findFirst({
      where: { email: 'admin@elhamdimports.com' }
    })

    if (!admin) {
      console.error('Admin user not found')
      return
    }

    // Sample media data
    const sampleMedia = [
      {
        filename: 'luxury-sedan-1.jpg',
        originalName: 'Mercedes-Benz S-Class.jpg',
        path: '/uploads/vehicles/optimized/luxury-sedan-1.webp',
        url: '/uploads/vehicles/optimized/luxury-sedan-1.webp',
        thumbnailUrl: '/uploads/thumbnails/luxury-sedan-1_thumbnail.webp',
        mimeType: 'image/jpeg',
        size: 245760,
        width: 1920,
        height: 1080,
        altText: 'Luxury Mercedes-Benz S-Class sedan',
        title: 'Mercedes-Benz S-Class',
        description: 'Premium luxury sedan with advanced features',
        tags: JSON.stringify(['luxury', 'sedan', 'mercedes', 'premium']),
        category: 'vehicle',
        entityId: null,
        isPublic: true,
        isFeatured: true,
        order: 1,
        metadata: JSON.stringify({
          make: 'Mercedes-Benz',
          model: 'S-Class',
          year: 2024,
          price: 85000,
          features: ['leather seats', 'sunroof', 'premium audio']
        }),
        createdBy: admin.id
      },
      {
        filename: 'sports-car-1.jpg',
        originalName: 'BMW M4 Competition.jpg',
        path: '/uploads/vehicles/optimized/sports-car-1.webp',
        url: '/uploads/vehicles/optimized/sports-car-1.webp',
        thumbnailUrl: '/uploads/thumbnails/sports-car-1_thumbnail.webp',
        mimeType: 'image/jpeg',
        size: 314572,
        width: 1920,
        height: 1080,
        altText: 'BMW M4 Competition sports car',
        title: 'BMW M4 Competition',
        description: 'High-performance sports coupe',
        tags: JSON.stringify(['sports', 'bmw', 'performance', 'coupe']),
        category: 'vehicle',
        entityId: null,
        isPublic: true,
        isFeatured: true,
        order: 2,
        metadata: JSON.stringify({
          make: 'BMW',
          model: 'M4 Competition',
          year: 2024,
          price: 75000,
          features: ['twin-turbo', 'sport exhaust', 'M sport package']
        }),
        createdBy: admin.id
      },
      {
        filename: 'service-1.jpg',
        originalName: 'Premium Car Service.jpg',
        path: '/uploads/services/optimized/service-1.webp',
        url: '/uploads/services/optimized/service-1.webp',
        thumbnailUrl: '/uploads/thumbnails/service-1_thumbnail.webp',
        mimeType: 'image/jpeg',
        size: 163840,
        width: 1200,
        height: 800,
        altText: 'Professional car service',
        title: 'Premium Service',
        description: 'Professional maintenance and service',
        tags: JSON.stringify(['service', 'maintenance', 'professional']),
        category: 'service',
        entityId: null,
        isPublic: true,
        isFeatured: false,
        order: 1,
        metadata: JSON.stringify({
          serviceType: 'maintenance',
          duration: '2 hours',
          price: 150
        }),
        createdBy: admin.id
      },
      {
        filename: 'showroom-1.jpg',
        originalName: 'Elhamd Showroom.jpg',
        path: '/uploads/gallery/optimized/showroom-1.webp',
        url: '/uploads/gallery/optimized/showroom-1.webp',
        thumbnailUrl: '/uploads/thumbnails/showroom-1_thumbnail.webp',
        mimeType: 'image/jpeg',
        size: 393216,
        width: 1920,
        height: 1080,
        altText: 'Elhamd Imports showroom',
        title: 'Our Showroom',
        description: 'Modern showroom with latest models',
        tags: JSON.stringify(['showroom', 'gallery', 'facility']),
        category: 'gallery',
        entityId: null,
        isPublic: true,
        isFeatured: false,
        order: 1,
        metadata: JSON.stringify({
          location: 'Main Branch',
          area: '5000 sq ft',
          capacity: '50 vehicles'
        }),
        createdBy: admin.id
      },
      {
        filename: 'banner-1.jpg',
        originalName: 'Summer Sale Banner.jpg',
        path: '/uploads/banners/optimized/banner-1.webp',
        url: '/uploads/banners/optimized/banner-1.webp',
        thumbnailUrl: '/uploads/thumbnails/banner-1_thumbnail.webp',
        mimeType: 'image/jpeg',
        size: 524288,
        width: 1920,
        height: 600,
        altText: 'Summer sale promotion banner',
        title: 'Summer Sale',
        description: 'Special offers on selected models',
        tags: JSON.stringify(['banner', 'promotion', 'sale', 'summer']),
        category: 'banner',
        entityId: null,
        isPublic: true,
        isFeatured: true,
        order: 1,
        metadata: JSON.stringify({
          promotion: 'Summer Sale 2024',
          discount: 'Up to 20% off',
          validUntil: '2024-08-31'
        }),
        createdBy: admin.id
      }
    ]

    // Insert sample media
    for (const media of sampleMedia) {
      await db.media.create({
        data: media
      })
    }

    console.log('Sample media created successfully')
  } catch (error) {
    console.error('Error creating sample media:', error)
  }
}

// Run the function
createSampleMedia()
  .then(() => {
    console.log('Sample media creation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Sample media creation failed:', error)
    process.exit(1)
  })