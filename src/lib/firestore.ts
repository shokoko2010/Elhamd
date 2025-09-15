import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'

// Collections
const VEHICLES_COLLECTION = 'vehicles'
const USERS_COLLECTION = 'users'
const TEST_DRIVE_BOOKINGS_COLLECTION = 'testDriveBookings'
const SERVICE_BOOKINGS_COLLECTION = 'serviceBookings'
const SERVICE_TYPES_COLLECTION = 'serviceTypes'
const VEHICLE_IMAGES_COLLECTION = 'vehicleImages'

// Types
export interface Vehicle {
  id?: string
  make: string
  model: string
  year: number
  price: number
  stockNumber: string
  vin?: string
  description?: string
  category: VehicleCategory
  fuelType: FuelType
  transmission: TransmissionType
  mileage?: number
  color?: string
  status: VehicleStatus
  featured: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface VehicleImage {
  id?: string
  vehicleId: string
  imageUrl: string
  altText?: string
  isPrimary: boolean
  order: number
  createdAt?: Timestamp
}

export interface User {
  id?: string
  email: string
  name?: string
  role: UserRole
  phone?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface TestDriveBooking {
  id?: string
  customerId: string
  vehicleId: string
  date: Timestamp
  timeSlot: string
  status: BookingStatus
  notes?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface ServiceType {
  id?: string
  name: string
  description?: string
  duration: number
  price?: number
  category: ServiceCategory
  isActive: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface ServiceBooking {
  id?: string
  customerId: string
  vehicleId?: string
  serviceTypeId: string
  date: Timestamp
  timeSlot: string
  status: BookingStatus
  notes?: string
  totalPrice?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// Enums
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
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

// Vehicle Services
export class VehicleService {
  static async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
      ...vehicle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getVehicle(id: string): Promise<Vehicle | null> {
    const docRef = doc(db, VEHICLES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vehicle
    }
    return null
  }

  static async getVehicles(filters?: {
    category?: VehicleCategory
    fuelType?: FuelType
    transmission?: TransmissionType
    status?: VehicleStatus
    featured?: boolean
    minPrice?: number
    maxPrice?: number
    search?: string
  }, sortBy?: string, page: number = 1, pageSize: number = 9): Promise<{ vehicles: Vehicle[], total: number }> {
    let q = collection(db, VEHICLES_COLLECTION)
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      if (filters.fuelType) {
        q = query(q, where('fuelType', '==', filters.fuelType))
      }
      if (filters.transmission) {
        q = query(q, where('transmission', '==', filters.transmission))
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured))
      }
      if (filters.minPrice !== undefined) {
        q = query(q, where('price', '>=', filters.minPrice))
      }
      if (filters.maxPrice !== undefined) {
        q = query(q, where('price', '<=', filters.maxPrice))
      }
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          q = query(q, orderBy('price', 'asc'))
          break
        case 'price-desc':
          q = query(q, orderBy('price', 'desc'))
          break
        case 'year-desc':
          q = query(q, orderBy('year', 'desc'))
          break
        case 'year-asc':
          q = query(q, orderBy('year', 'asc'))
          break
        default:
          q = query(q, orderBy('createdAt', 'desc'))
      }
    } else {
      q = query(q, orderBy('createdAt', 'desc'))
    }

    // Apply pagination
    const snapshot = await getDocs(q)
    let vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle))
    
    // Apply search filter (client-side for now)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      vehicles = vehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.description?.toLowerCase().includes(searchLower)
      )
    }

    const total = vehicles.length
    const start = (page - 1) * pageSize
    const paginatedVehicles = vehicles.slice(start, start + pageSize)

    return { vehicles: paginatedVehicles, total }
  }

  static async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    const docRef = doc(db, VEHICLES_COLLECTION, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async deleteVehicle(id: string): Promise<void> {
    const docRef = doc(db, VEHICLES_COLLECTION, id)
    await deleteDoc(docRef)
  }

  static async getFeaturedVehicles(): Promise<Vehicle[]> {
    const q = query(
      collection(db, VEHICLES_COLLECTION),
      where('featured', '==', true),
      where('status', '==', VehicleStatus.AVAILABLE),
      limit(6)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle))
  }
}

// Vehicle Image Services
export class VehicleImageService {
  static async uploadVehicleImage(
    vehicleId: string, 
    file: File, 
    altText?: string, 
    isPrimary: boolean = false,
    order: number = 0
  ): Promise<string> {
    const fileName = `${vehicleId}/${Date.now()}-${file.name}`
    const storageRef = ref(storage, `vehicle-images/${fileName}`)
    
    await uploadBytes(storageRef, file)
    const imageUrl = await getDownloadURL(storageRef)
    
    await addDoc(collection(db, VEHICLE_IMAGES_COLLECTION), {
      vehicleId,
      imageUrl,
      altText,
      isPrimary,
      order,
      createdAt: serverTimestamp()
    })
    
    return imageUrl
  }

  static async getVehicleImages(vehicleId: string): Promise<VehicleImage[]> {
    const q = query(
      collection(db, VEHICLE_IMAGES_COLLECTION),
      where('vehicleId', '==', vehicleId),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VehicleImage))
  }

  static async deleteVehicleImage(imageId: string, imageUrl: string): Promise<void> {
    // Delete from storage
    const storageRef = ref(storage, imageUrl)
    await deleteObject(storageRef)
    
    // Delete from Firestore
    const docRef = doc(db, VEHICLE_IMAGES_COLLECTION, imageId)
    await deleteDoc(docRef)
  }
}

// User Services
export class UserService {
  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getUser(id: string): Promise<User | null> {
    const docRef = doc(db, USERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as User
    }
    return null
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }
}

// Test Drive Booking Services
export class TestDriveBookingService {
  static async createBooking(booking: Omit<TestDriveBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, TEST_DRIVE_BOOKINGS_COLLECTION), {
      ...booking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getBooking(id: string): Promise<TestDriveBooking | null> {
    const docRef = doc(db, TEST_DRIVE_BOOKINGS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TestDriveBooking
    }
    return null
  }

  static async getUserBookings(userId: string): Promise<TestDriveBooking[]> {
    const q = query(
      collection(db, TEST_DRIVE_BOOKINGS_COLLECTION),
      where('customerId', '==', userId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestDriveBooking))
  }

  static async getVehicleBookings(vehicleId: string): Promise<TestDriveBooking[]> {
    const q = query(
      collection(db, TEST_DRIVE_BOOKINGS_COLLECTION),
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestDriveBooking))
  }

  static async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    const docRef = doc(db, TEST_DRIVE_BOOKINGS_COLLECTION, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    })
  }
}

// Service Type Services
export class ServiceTypeService {
  static async createServiceType(serviceType: Omit<ServiceType, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, SERVICE_TYPES_COLLECTION), {
      ...serviceType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getServiceTypes(): Promise<ServiceType[]> {
    const q = query(
      collection(db, SERVICE_TYPES_COLLECTION),
      where('isActive', '==', true),
      orderBy('category', 'asc'),
      orderBy('name', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceType))
  }

  static async getServiceType(id: string): Promise<ServiceType | null> {
    const docRef = doc(db, SERVICE_TYPES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ServiceType
    }
    return null
  }
}

// Service Booking Services
export class ServiceBookingService {
  static async createBooking(booking: Omit<ServiceBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, SERVICE_BOOKINGS_COLLECTION), {
      ...booking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getBooking(id: string): Promise<ServiceBooking | null> {
    const docRef = doc(db, SERVICE_BOOKINGS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ServiceBooking
    }
    return null
  }

  static async getUserBookings(userId: string): Promise<ServiceBooking[]> {
    const q = query(
      collection(db, SERVICE_BOOKINGS_COLLECTION),
      where('customerId', '==', userId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceBooking))
  }

  static async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    const docRef = doc(db, SERVICE_BOOKINGS_COLLECTION, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    })
  }
}