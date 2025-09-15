'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Car,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { VehicleService, Vehicle, VehicleCategory, FuelType, TransmissionType, VehicleStatus } from '@/lib/firestore'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function AdminModelsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const result = await VehicleService.getVehicles()
      setVehicles(result.vehicles)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (editingVehicle?.id) {
        // Update existing vehicle
        await VehicleService.updateVehicle(editingVehicle.id, vehicleData)
      } else {
        // Create new vehicle
        await VehicleService.createVehicle(vehicleData as Omit<Vehicle, 'id'>)
      }
      
      await loadVehicles()
      setIsDialogOpen(false)
      setEditingVehicle(null)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await VehicleService.deleteVehicle(vehicleId)
        await loadVehicles()
      } catch (error) {
        console.error('Error deleting vehicle:', error)
      }
    }
  }

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE:
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
      case VehicleStatus.SOLD:
        return <Badge variant="destructive">Sold</Badge>
      case VehicleStatus.RESERVED:
        return <Badge className="bg-yellow-500">Reserved</Badge>
      case VehicleStatus.MAINTENANCE:
        return <Badge className="bg-blue-500">Maintenance</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Models</h1>
          <p className="text-gray-600">Manage your vehicle inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingVehicle(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update vehicle information' : 'Add a new vehicle to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              vehicle={editingVehicle}
              onSave={handleSaveVehicle}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingVehicle(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Inventory</CardTitle>
          <CardDescription>
            {filteredVehicles.length} vehicles found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Car className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.year}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(vehicle.price)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(vehicle.status)}
                    </TableCell>
                    <TableCell>
                      {vehicle.featured ? (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            // View vehicle details
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface VehicleFormProps {
  vehicle?: Partial<Vehicle> | null
  onSave: (vehicle: Partial<Vehicle>) => Promise<void>
  onCancel: () => void
}

function VehicleForm({ vehicle, onSave, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    price: vehicle?.price || 0,
    stockNumber: vehicle?.stockNumber || '',
    vin: vehicle?.vin || '',
    description: vehicle?.description || '',
    category: vehicle?.category || VehicleCategory.SUV,
    fuelType: vehicle?.fuelType || FuelType.PETROL,
    transmission: vehicle?.transmission || TransmissionType.MANUAL,
    mileage: vehicle?.mileage || 0,
    color: vehicle?.color || '',
    status: vehicle?.status || VehicleStatus.AVAILABLE,
    featured: vehicle?.featured || false
  })
  const [loading, setLoading] = useState(false)
  const [currentImages, setCurrentImages] = useState<Array<{ id: string; url: string; path: string; isPrimary: boolean; order: number }>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({...formData, make: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (EGP) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            required
          />
        </div>
        <div>
          <Label htmlFor="stockNumber">Stock Number *</Label>
          <Input
            id="stockNumber"
            value={formData.stockNumber}
            onChange={(e) => setFormData({...formData, stockNumber: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="vin">VIN</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => setFormData({...formData, vin: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as VehicleCategory})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VehicleCategory.SEDAN}>Sedan</SelectItem>
              <SelectItem value={VehicleCategory.SUV}>SUV</SelectItem>
              <SelectItem value={VehicleCategory.HATCHBACK}>Hatchback</SelectItem>
              <SelectItem value={VehicleCategory.TRUCK}>Truck</SelectItem>
              <SelectItem value={VehicleCategory.VAN}>Van</SelectItem>
              <SelectItem value={VehicleCategory.COMMERCIAL}>Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type *</Label>
          <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value as FuelType})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FuelType.PETROL}>Petrol</SelectItem>
              <SelectItem value={FuelType.DIESEL}>Diesel</SelectItem>
              <SelectItem value={FuelType.ELECTRIC}>Electric</SelectItem>
              <SelectItem value={FuelType.HYBRID}>Hybrid</SelectItem>
              <SelectItem value={FuelType.CNG}>CNG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="transmission">Transmission *</Label>
          <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value as TransmissionType})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TransmissionType.MANUAL}>Manual</SelectItem>
              <SelectItem value={TransmissionType.AUTOMATIC}>Automatic</SelectItem>
              <SelectItem value={TransmissionType.CVT}>CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as VehicleStatus})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={VehicleStatus.AVAILABLE}>Available</SelectItem>
              <SelectItem value={VehicleStatus.SOLD}>Sold</SelectItem>
              <SelectItem value={VehicleStatus.RESERVED}>Reserved</SelectItem>
              <SelectItem value={VehicleStatus.MAINTENANCE}>Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          placeholder="Vehicle description..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
          className="rounded border-gray-300"
        />
        <Label htmlFor="featured">Featured Vehicle</Label>
      </div>

      {/* Image Upload */}
      {vehicle?.id && (
        <div>
          <Label>Vehicle Images</Label>
          <ImageUpload
            vehicleId={vehicle.id!}
            currentImages={currentImages}
            onImagesChange={setCurrentImages}
            maxImages={8}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Vehicle'}
        </Button>
      </div>
    </form>
  )
}