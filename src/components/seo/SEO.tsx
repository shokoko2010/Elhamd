import Head from 'next/head'
import { useRouter } from 'next/router'

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

export default function SEO({
  title = 'Al-Hamd Cars | TATA Motors Authorized Dealer in Egypt',
  description = 'Al-Hamd Cars is your authorized TATA Motors dealer in Egypt. Explore our wide range of TATA vehicles, book test drives, and get expert service and maintenance.',
  keywords = 'TATA Motors Egypt, Al-Hamd Cars, TATA dealer Egypt, new cars Egypt, car dealership, TATA Nexon, TATA Punch, TATA Tiago, car service Egypt',
  ogImage = '/og-image.jpg',
  ogUrl,
  canonicalUrl,
  noIndex = false,
  structuredData
}: SEOProps) {
  const router = useRouter()
  const currentUrl = ogUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com'}${router.asPath}`
  const canonical = canonicalUrl || currentUrl

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": "Al-Hamd Cars",
    "description": description,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com',
    "telephone": "+20 2 1234 5678",
    "email": "info@alhamdcars.com",
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

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Al-Hamd Cars" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Al-Hamd Cars" />
      <meta property="og:locale" content="en_EG" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData)
        }}
      />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="EG-C" />
      <meta name="geo.placename" content="Cairo" />
      <meta name="geo.position" content="30.0444;31.2357" />
      <meta name="ICBM" content="30.0444, 31.2357" />
    </Head>
  )
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
    "email": "info@alhamdcars.com",
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

  return (
    <SEO
      title="Al-Hamd Cars | TATA Motors Authorized Dealer in Egypt"
      description="Discover the perfect TATA vehicle at Al-Hamd Cars, Egypt's authorized TATA Motors dealer. Explore new cars, book test drives, and get expert service."
      keywords="TATA Motors Egypt, Al-Hamd Cars, TATA dealer Egypt, new cars Egypt, car dealership, TATA Nexon, TATA Punch, TATA Tiago"
      structuredData={structuredData}
    />
  )
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

  return (
    <SEO
      title={title}
      description={description}
      keywords={`${make} ${model}, ${make} Egypt, ${model} price, TATA ${model}, buy ${make} ${model}, ${make} dealer Egypt`}
      structuredData={structuredData}
    />
  )
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

  return (
    <SEO
      title={title}
      description={description}
      keywords="car service Egypt, car maintenance Egypt, TATA service center, vehicle repair Egypt, car servicing, TATA maintenance"
      structuredData={structuredData}
    />
  )
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
    "email": "info@alhamdcars.com",
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

  return (
    <SEO
      title={title}
      description={description}
      keywords="contact TATA dealer Egypt, Al-Hamd Cars contact, car dealership Egypt, TATA Motors Egypt contact, visit showroom"
      structuredData={structuredData}
    />
  )
}