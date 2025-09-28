export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION',
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_SERVICE = 'TIRE_SERVICE',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  BATTERY_SERVICE = 'BATTERY_SERVICE',
  AIR_CONDITIONING = 'AIR_CONDITIONING',
  ENGINE_SERVICE = 'ENGINE_SERVICE',
  TRANSMISSION_SERVICE = 'TRANSMISSION_SERVICE',
  OTHER = 'OTHER'
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum PartStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDERED = 'ORDERED',
  RESERVED = 'RESERVED'
}

export enum PartCategory {
  ENGINE = 'ENGINE',
  TRANSMISSION = 'TRANSMISSION',
  BRAKE = 'BRAKE',
  SUSPENSION = 'SUSPENSION',
  ELECTRICAL = 'ELECTRICAL',
  BODY = 'BODY',
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  TIRE = 'TIRE',
  BATTERY = 'BATTERY',
  OIL = 'OIL',
  FILTER = 'FILTER',
  OTHER = 'OTHER'
}

export interface MaintenanceSchedule {
  id: string
  vehicleId: string
  type: MaintenanceType
  title: string
  description?: string
  interval: number // in days
  intervalKm?: number // in kilometers
  lastService?: Date
  nextService: Date
  estimatedCost?: number
  priority: MaintenanceStatus
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  scheduleId?: string
  type: MaintenanceType
  title: string
  description: string
  cost: number
  technician: string
  startDate: Date
  endDate?: Date
  status: MaintenanceStatus
  notes?: string
  parts?: string
  laborHours?: number
  odometer?: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MaintenanceReminder {
  id: string
  scheduleId: string
  vehicleId: string
  title: string
  message: string
  reminderDate: Date
  sentDate?: Date
  status: MaintenanceStatus
  type: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MaintenancePart {
  id: string
  partNumber: string
  name: string
  category: PartCategory
  description?: string
  cost: number
  price: number
  quantity: number
  minStock: number
  maxStock?: number
  location?: string
  supplier?: string
  status: PartStatus
  barcode?: string
  imageUrl?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}