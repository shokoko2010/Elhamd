'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { 
  Car, 
  Calendar, 
  Phone, 
  Mail, 
  Fuel, 
  Settings, 
  Gauge, 
  Users, 
  Shield, 
  Heart,
  Share2,
  MapPin,
  DollarSign,
  Wrench
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string
  category: string
  fuelType: string
  transmission: string
  mileage?: number
  color: string
  description: string
  status: string
  featured: boolean
  images: { imageUrl: string; isPrimary: boolean; altText?: string }[]
  specifications?: {
    engine: string
    horsepower: number
    torque: number
    acceleration: string
    topSpeed: string
    fuelEfficiency: string
    seatingCapacity: number
    driveType: string
  }
  features?: string[]
}

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showContactDialog, setShowContactDialog] = useState(false)

  useEffect(() => {
    // Mock data - will be replaced with API call
    const mockVehicle: Vehicle = {
      id: params.id as string,
      make: 'Tata',
      model: 'Nexon',
      year: 2024,
      price: 850000,
      stockNumber: 'TN2024001',
      vin: 'MAT625487K1L5B4321',
      category: 'SUV',
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'White',
      description: 'The Tata Nexon is a premium compact SUV that combines style, performance, and safety. With its bold design, advanced features, and comfortable interior, the Nexon is perfect for both city driving and weekend adventures. This vehicle comes equipped with the latest safety technology, including dual airbags, ABS with EBD, and a robust body structure.',
      status: 'AVAILABLE',
      featured: true,
      images: [
        { imageUrl: '/api/placeholder/800/600', isPrimary: true, altText: 'Tata Nexon Front View' },
        { imageUrl: '/api/placeholder/800/600', isPrimary: false, altText: 'Tata Nexon Side View' },
        { imageUrl: '/api/placeholder/800/600', isPrimary: false, altText: 'Tata Nexon Interior' },
        { imageUrl: '/api/placeholder/800/600', isPrimary: false, altText: 'Tata Nexon Rear View' },
        { imageUrl: '/api/placeholder/800/600', isPrimary: false, altText: 'Tata Nexon Dashboard' }
      ],
      specifications: {
        engine: '1.2L Turbocharged Revotron',
        horsepower: 110,
        torque: 170,
        acceleration: '0-100 km/h in 11.5s',
        topSpeed: '180 km/h',
        fuelEfficiency: '17.57 km/l',
        seatingCapacity: 5,
        driveType: 'FWD'
      },
      features: [
        'Touchscreen Infotainment System',
        'Automatic Climate Control',
        'Rear Parking Camera',
        'Tyre Pressure Monitoring System',
        'Rain Sensing Wipers',
        'Auto Headlamps',
        'Cruise Control',
        'Connected Car Technology',
        'Leather Seat Upholstery',
        'Panoramic Sunroof',
        'Wireless Charging',
        'Multi-drive Modes'
      ]
    }
    
    // Simulate API call
    setTimeout(() => {
      setVehicle(mockVehicle)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              Home
            </button>
            <span className="text-gray-400">/</span>
            <button 
              onClick={() => router.push('/vehicles')}
              className="text-blue-600 hover:text-blue-800"
            >
              Vehicles
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">
              {vehicle.make} {vehicle.model} {vehicle.year}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={vehicle.images[selectedImageIndex]?.imageUrl || '/api/placeholder/800/600'}
                  alt={vehicle.images[selectedImageIndex]?.altText || `${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-4 left-4 ${
                  vehicle.status === 'AVAILABLE' ? 'bg-green-500' : 
                  vehicle.status === 'SOLD' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {vehicle.status}
                </Badge>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-video bg-gray-200 rounded overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altText}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">{vehicle.year}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{vehicle.category}</Badge>
                    <Badge variant="secondary">{vehicle.fuelType}</Badge>
                    <Badge variant="secondary">{vehicle.transmission}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {formatPrice(vehicle.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Stock #{vehicle.stockNumber}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{vehicle.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Fuel Type</div>
                    <div className="font-medium">{vehicle.fuelType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Transmission</div>
                    <div className="font-medium">{vehicle.transmission}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Mileage</div>
                    <div className="font-medium">{vehicle.mileage || 0} km</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Color</div>
                    <div className="font-medium">{vehicle.color}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/test-drive">
                  <Button size="lg" className="flex-1">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Test Drive
                  </Button>
                </Link>
                <Link href="/maintenance">
                  <Button size="lg" variant="outline" className="flex-1">
                    <Wrench className="mr-2 h-5 w-5" />
                    Service Center
                  </Button>
                </Link>
                <Link href="/financing">
                  <Button size="lg" variant="outline" className="flex-1">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Financing Options
                  </Button>
                </Link>

                <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="flex-1">
                      <Phone className="mr-2 h-5 w-5" />
                      Contact Sales
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Contact Sales</DialogTitle>
                      <DialogDescription>
                        Get more information about {vehicle.make} {vehicle.model}
                      </DialogDescription>
                    </DialogHeader>
                    <ContactForm vehicle={vehicle} onSuccess={() => setShowContactDialog(false)} />
                  </DialogContent>
                </Dialog>

                <Button size="lg" variant="outline">
                  <Heart className="mr-2 h-5 w-5" />
                </Button>

                <Button size="lg" variant="outline">
                  <Share2 className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicle.specifications && Object.entries(vehicle.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicle.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-4">
                      The {vehicle.make} {vehicle.model} {vehicle.year} represents the perfect blend of style, performance, and value. 
                      This {vehicle.category.toLowerCase()} is designed to meet the needs of modern drivers with its advanced features, 
                      comfortable interior, and impressive fuel efficiency.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Key highlights include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Advanced safety features with multiple airbags</li>
                      <li>Modern infotainment system with connectivity</li>
                      <li>Comfortable seating for {vehicle.specifications?.seatingCapacity} passengers</li>
                      <li>Efficient {vehicle.fuelType.toLowerCase()} engine</li>
                      <li>Stylish exterior design with premium finish</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ContactForm({ vehicle, onSuccess }: { vehicle: Vehicle; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Contact form:', formData)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="I'm interested in learning more about this vehicle..."
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  )
}