'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, X, Car, Gauge, Fuel, Calendar, Settings, Sparkles, Loader2 } from 'lucide-react'

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
  image?: string
}

export default function CarComparisonPage() {
  const [selectedCars, setSelectedCars] = useState<Car[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [allCars, setAllCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisonAnalysis, setComparisonAnalysis] = useState<string>('')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars')
      const result = await response.json()
      if (result.success) {
        setAllCars(result.data)
        setFilteredCars(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredCars(allCars)
    } else {
      const filtered = allCars.filter(car => 
        car.name.toLowerCase().includes(term.toLowerCase()) ||
        car.brand.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredCars(filtered)
    }
  }

  const addCarToComparison = (car: Car) => {
    if (selectedCars.length < 3 && !selectedCars.find(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car])
    }
  }

  const removeCarFromComparison = (carId: string) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId))
    if (selectedCars.length <= 2) {
      setShowAnalysis(false)
      setComparisonAnalysis('')
    }
  }

  const generateComparison = async (useAI = false) => {
    if (selectedCars.length < 2) return
    
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carIds: selectedCars.map(car => car.id),
          useAI
        }),
      })
      
      const result = await response.json()
      if (result.success) {
        setComparisonAnalysis(result.data.analysis)
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error('Failed to generate comparison:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getCarImage = (car: Car) => {
    if (car.image) {
      return car.image
    }
    // Use generated placeholder images
    return `/uploads/car-comparison/${car.brand.toLowerCase()}-${car.name.toLowerCase()}.svg`
  }

  const getComparisonData = () => {
    if (selectedCars.length === 0) return []

    return [
      { label: 'Brand & Model', key: 'name' },
      { label: 'Price', key: 'price', format: formatPrice },
      { label: 'Year', key: 'year' },
      { label: 'Fuel Type', key: 'fuelType' },
      { label: 'Transmission', key: 'transmission' },
      { label: 'Engine', key: 'engine' },
      { label: 'Mileage', key: 'mileage', suffix: ' km/l' },
      { label: 'Power', key: 'power', suffix: ' bhp' },
      { label: 'Torque', key: 'torque', suffix: ' Nm' },
      { label: 'Seats', key: 'seats' },
      { label: 'Body Type', key: 'bodyType' },
      { label: 'Safety Rating', key: 'safetyRating', suffix: '/5' }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Comparison</h1>
          <p className="text-gray-600">Compare up to 3 cars side by side to make the best choice</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Search and Add Cars Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Cars
                </CardTitle>
                <CardDescription>Find cars to compare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Search by brand or model</Label>
                    <Input
                      id="search"
                      placeholder="e.g., TATA, Swift, SUV..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : filteredCars.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No cars found</p>
                      </div>
                    ) : (
                      filteredCars.map((car) => {
                        const isSelected = selectedCars.find(c => c.id === car.id)
                        return (
                          <Card key={car.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{car.brand} {car.name}</h4>
                                <p className="text-sm text-gray-600">{formatPrice(car.price)}</p>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant="secondary" className="text-xs">{car.fuelType}</Badge>
                                  <Badge variant="outline" className="text-xs">{car.bodyType}</Badge>
                                  <Badge variant="outline" className="text-xs">⭐ {car.safetyRating}</Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addCarToComparison(car)}
                                disabled={isSelected || selectedCars.length >= 3}
                                className="ml-2"
                              >
                                {isSelected ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Cars Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Selected Cars ({selectedCars.length}/3)
                  </span>
                  {selectedCars.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCars([])}
                    >
                      Clear All
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedCars.length === 0 
                    ? 'Select cars to start comparing' 
                    : 'Great! You can now compare your selected cars'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No cars selected for comparison</p>
                    <p className="text-sm">Search and add cars from the left panel</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCars.map((car) => (
                      <Card key={car.id} className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => removeCarFromComparison(car.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <CardContent className="p-4">
                          <div className="text-center mb-4">
                            <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={getCarImage(car)} 
                                alt={`${car.brand} ${car.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">Car</text></svg>`
                                }}
                              />
                            </div>
                            <h3 className="font-bold text-lg">{car.brand} {car.name}</h3>
                            <p className="text-xl font-bold text-primary">{formatPrice(car.price)}</p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Year:</span>
                              <span>{car.year}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fuel:</span>
                              <span>{car.fuelType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transmission:</span>
                              <span>{car.transmission}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Engine:</span>
                              <span>{car.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Safety:</span>
                              <span>⭐ {car.safetyRating}/5</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedCars.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Comparison Analysis</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateComparison(false)}
                    disabled={analysisLoading}
                  >
                    {analysisLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Quick Analysis
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => generateComparison(true)}
                    disabled={analysisLoading}
                  >
                    {analysisLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Analysis
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showAnalysis && (
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {comparisonAnalysis}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Comparison Table */}
        {selectedCars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>Compare specifications side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Feature</TableHead>
                      {selectedCars.map((car) => (
                        <TableHead key={car.id} className="text-center">
                          {car.brand} {car.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getComparisonData().map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        {selectedCars.map((car) => (
                          <TableCell key={car.id} className="text-center">
                            {row.format 
                              ? row.format(car[row.key as keyof Car] as number)
                              : `${car[row.key as keyof Car]}${row.suffix || ''}`
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}