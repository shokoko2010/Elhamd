export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  stockNumber: string;
  vin?: string;
  description?: string;
  category: VehicleCategory;
  fuelType: FuelType;
  transmission: TransmissionType;
  mileage?: number;
  color?: string;
  status: VehicleStatus;
  featured: boolean;
  images: VehicleImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}

export interface TestDriveBooking {
  id: string;
  customerId: string;
  vehicleId: string;
  date: Date;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  category: ServiceCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceBooking {
  id: string;
  customerId: string;
  vehicleId?: string;
  serviceTypeId: string;
  date: Date;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum VehicleCategory {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  HATCHBACK = 'HATCHBACK',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  COMMERCIAL = 'COMMERCIAL'
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  CNG = 'CNG'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  CVT = 'CVT'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export enum ServiceCategory {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  DETAILING = 'DETAILING',
  CUSTOM = 'CUSTOM'
}