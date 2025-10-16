import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  canonicalUrl?: string
  noIndex?: boolean
  structuredData?: any
}

export function generateMetadata({
  title = 'Al-Hamd Cars | TATA Motors Authorized Dealer in Egypt',
  description = 'Al-Hamd Cars is your authorized TATA Motors dealer in Egypt. Explore our wide range of TATA vehicles, book test drives, and get expert service and maintenance.',
  keywords = 'TATA Motors Egypt, Al-Hamd Cars, TATA dealer Egypt, new cars Egypt, car dealership, TATA Nexon, TATA Punch, TATA Tiago, car service Egypt',
  ogImage = '/og-image.jpg',
  ogUrl,
  canonicalUrl,
  noIndex = false,
  structuredData
}: SEOProps = {}): Metadata {
  const currentUrl = ogUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com'}`
  const canonical = canonicalUrl || currentUrl

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": description,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "priceRange": "$$$"
  }

  const finalStructuredData = structuredData || defaultStructuredData

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Al-Hamd Cars' }],
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      type: 'website',
      title,
      description,
      images: [ogImage],
      url: currentUrl,
      siteName: 'Al-Hamd Cars',
      locale: 'en_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    other: {
      'theme-color': '#1e40af',
      'msapplication-TileColor': '#1e40af',
      'geo.region': 'EG-C',
      'geo.placename': 'Cairo',
      'geo.position': '30.0444;31.2357',
      'ICBM': '30.0444, 31.2357',
    },
  }
}

export function generateStructuredData({
  title = 'Al-Hamd Cars | TATA Motors Authorized Dealer in Egypt',
  description = 'Al-Hamd Cars is your authorized TATA Motors dealer in Egypt. Explore our wide range of TATA vehicles, book test drives, and get expert service and maintenance.',
  structuredData
}: {
  title?: string
  description?: string
  structuredData?: any
} = {}): string {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": description,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "priceRange": "$$$"
  }

  const finalStructuredData = structuredData || defaultStructuredData
  return JSON.stringify(finalStructuredData)
}

// Specialized SEO components for different pages
export function HomepageSEO() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": "Your authorized TATA Motors dealer in Egypt offering new vehicles, test drives, and expert service.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "priceRange": "$$$",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "TATA Vehicles",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Vehicle",
            "name": "TATA Nexon",
            "description": "Compact SUV with advanced safety features"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Vehicle",
            "name": "TATA Punch",
            "description": "Compact SUV perfect for city driving"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Vehicle",
            "name": "TATA Tiago",
            "description": "Efficient hatchback with great fuel economy"
          }
        }
      ]
    }
  }

  return {
    metadata: generateMetadata({
      title: "Al-Hamd Cars | TATA Motors Authorized Dealer in Egypt",
      description: "Discover the perfect TATA vehicle at Al-Hamd Cars, Egypt's authorized TATA Motors dealer. Explore new cars, book test drives, and get expert service.",
      keywords: "TATA Motors Egypt, Al-Hamd Cars, TATA dealer Egypt, new cars Egypt, car dealership, TATA Nexon, TATA Punch, TATA Tiago",
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}

export function VehicleSEO({ make, model, year, price }: { make: string; model: string; year: number; price: number }) {
  const title = `${make} ${model} ${year} | Al-Hamd Cars Egypt`
  const description = `Explore the ${make} ${model} ${year} at Al-Hamd Cars. Features, specifications, and pricing for this exceptional vehicle. Book a test drive today!`
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": `${make} ${model}`,
    "model": model,
    "manufacturer": {
      "@type": "Organization",
      "name": "TATA Motors"
    },
    "modelDate": year.toString(),
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "EGP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutomotiveBusiness",
        "name": "Al-Hamd Cars",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Tahrir Street",
          "addressLocality": "Cairo",
          "addressCountry": "EG"
        }
      }
    }
  }

  return {
    metadata: generateMetadata({
      title,
      description,
      keywords: `${make} ${model}, ${make} Egypt, ${model} price, TATA ${model}, buy ${make} ${model}, ${make} dealer Egypt`,
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}

export function ServiceSEO() {
  const title = "Car Service & Maintenance | Al-Hamd Cars Egypt"
  const description = "Expert car service and maintenance at Al-Hamd Cars. Professional TATA vehicle servicing, repairs, and maintenance by certified technicians."
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars Service Center",
    "description": "Professional car service and maintenance center",
    "serviceType": "Car maintenance and repair",
    "provider": {
      "@type": "AutomotiveBusiness",
      "name": "Al-Hamd Cars",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Tahrir Street",
        "addressLocality": "Cairo",
        "addressCountry": "EG"
      }
    }
  }

  return {
    metadata: generateMetadata({
      title,
      description,
      keywords: "car service Egypt, car maintenance Egypt, TATA service center, vehicle repair Egypt, car servicing, TATA maintenance",
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}

export function ContactSEO() {
  const title = "Contact Al-Hamd Cars | TATA Motors Dealer Egypt"
  const description = "Get in touch with Al-Hamd Cars, your authorized TATA Motors dealer in Egypt. Visit our showroom or contact us for inquiries."
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": "Authorized TATA Motors dealer in Egypt",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+20 2 1234 5678",
      "contactType": "customer service",
      "availableLanguage": ["English", "Arabic"]
    }
  }

  return {
    metadata: generateMetadata({
      title,
      description,
      keywords: "contact TATA dealer Egypt, Al-Hamd Cars contact, car dealership Egypt, TATA Motors Egypt contact, visit showroom",
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}

export function VehiclesSEO() {
  const title = "TATA Vehicles for Sale | Al-Hamd Cars Egypt"
  const description = "Browse our complete range of TATA vehicles for sale in Egypt. Find the perfect TATA car, SUV, or commercial vehicle for your needs."
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": "Authorized TATA Motors dealer with complete vehicle inventory",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "makesAvailable": [
      {
        "@type": "Vehicle",
        "name": "TATA Nexon",
        "vehicleType": "SUV"
      },
      {
        "@type": "Vehicle",
        "name": "TATA Punch",
        "vehicleType": "SUV"
      },
      {
        "@type": "Vehicle",
        "name": "TATA Tiago",
        "vehicleType": "Hatchback"
      },
      {
        "@type": "Vehicle",
        "name": "TATA Tigor",
        "vehicleType": "Sedan"
      },
      {
        "@type": "Vehicle",
        "name": "TATA Altroz",
        "vehicleType": "Hatchback"
      },
      {
        "@type": "Vehicle",
        "name": "TATA Harrier",
        "vehicleType": "SUV"
      }
    ]
  }

  return {
    metadata: generateMetadata({
      title,
      description,
      keywords: "TATA vehicles Egypt, TATA cars for sale, buy TATA car Egypt, TATA SUV Egypt, TATA dealer inventory, new TATA vehicles",
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}

export function TestDriveSEO() {
  const title = "Book a Test Drive | Al-Hamd Cars Egypt"
  const description = "Schedule a test drive for any TATA vehicle at Al-Hamd Cars. Experience the performance and comfort of TATA cars firsthand."
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": "Authorized TATA Motors dealer offering test drives",
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@elhamdimport.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tahrir Street",
      "addressLocality": "Cairo",
      "addressCountry": "EG"
    },
    "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
    "service": {
      "@type": "Service",
      "name": "Test Drive Service",
      "description": "Schedule test drives for TATA vehicles"
    }
  }

  return {
    metadata: generateMetadata({
      title,
      description,
      keywords: "TATA test drive Egypt, book test drive, TATA car test drive, schedule test drive, TATA driving experience",
      structuredData
    }),
    structuredData: generateStructuredData({ structuredData })
  }
}