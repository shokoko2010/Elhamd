export interface PublicVehicleImage {
  imageUrl: string
  isPrimary?: boolean
  altText?: string
}

export interface PublicVehicle {
  id: string
  make: string
  model: string
  year: number
  price?: number
  category?: string
  fuelType?: string
  transmission?: string
  mileage?: number
  stockNumber?: string
  description?: string
  images: PublicVehicleImage[]
}
