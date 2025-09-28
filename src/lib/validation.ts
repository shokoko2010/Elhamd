import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صالح'),
  
  // Phone validation (Egyptian phone numbers)
  phone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(/^01[0-2,5]\d{8}$/, 'رقم الهاتف غير صالح'),
  
  // Name validation
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .regex(/^[\u0600-\u06FF\sA-Za-z]+$/, 'الاسم يجب أن يحتوي على أحرف فقط'),
  
  // Password validation
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
    .regex(/[^A-Za-z0-9]/, 'كلمة المرور يجب أن تحتوي على رمز واحد على الأقل'),
  
  // License number validation
  licenseNumber: z
    .string()
    .min(1, 'رقم الرخصة مطلوب')
    .min(8, 'رقم الرخصة غير صالح')
    .max(20, 'رقم الرخصة طويل جداً'),
  
  // Price validation
  price: z
    .number()
    .min(0, 'السعر يجب أن يكون رقم موجب')
    .max(10000000, 'السعر مرتفع جداً'),
  
  // Year validation
  year: z
    .number()
    .min(1990, 'السنة يجب أن تكون 1990 أو أحدث')
    .max(new Date().getFullYear() + 1, 'السنة غير صالحة'),
  
  // Mileage validation
  mileage: z
    .number()
    .min(0, 'المسافة يجب أن تكون رقم موجب')
    .max(1000000, 'المسافة طويلة جداً'),
  
  // Message validation
  message: z
    .string()
    .min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل')
    .max(1000, 'الرسالة طويلة جداً'),
  
  // Date validation (future dates only)
  futureDate: z
    .date()
    .min(new Date(), 'التاريخ يجب أن يكون في المستقبل'),
  
  // URL validation
  url: z
    .string()
    .url('الرابط غير صالح'),
  
  // Vehicle category validation
  vehicleCategory: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN'], {
    errorMap: () => ({ message: 'فئة المركبة غير صالحة' })
  }),
  
  // Fuel type validation
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID'], {
    errorMap: () => ({ message: 'نوع الوقود غير صالح' })
  }),
  
  // Transmission validation
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC'], {
    errorMap: () => ({ message: 'نوع ناقل الحركة غير صالح' })
  }),
  
  // Vehicle status validation
  vehicleStatus: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE'], {
    errorMap: () => ({ message: 'حالة المركبة غير صالحة' })
  })
}

// Vehicle validation schemas
export const vehicleSchemas = {
  // Create vehicle
  create: z.object({
    make: z.string().min(1, 'الماركة مطلوبة').max(50, 'الماركة طويلة جداً'),
    model: z.string().min(1, 'الموديل مطلوب').max(50, 'الموديل طويل جداً'),
    year: commonSchemas.year,
    price: commonSchemas.price,
    stockNumber: z.string().min(1, 'رقم المخزون مطلوب').max(20, 'رقم المخزون طويل جداً'),
    vin: z.string().min(17, 'رقم VIN يجب أن يكون 17 حرف').max(17, 'رقم VIN يجب أن يكون 17 حرف'),
    category: commonSchemas.vehicleCategory,
    fuelType: commonSchemas.fuelType,
    transmission: commonSchemas.transmission,
    mileage: commonSchemas.mileage.optional(),
    color: z.string().min(1, 'اللون مطلوب').max(30, 'اللون طويل جداً'),
    description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل').max(2000, 'الوصف طويل جداً'),
    status: commonSchemas.vehicleStatus,
    featured: z.boolean().default(false),
    images: z.array(z.object({
      imageUrl: z.string().url('رابط الصورة غير صالح'),
      isPrimary: z.boolean(),
      altText: z.string().optional()
    })).min(1, 'يجب إضافة صورة واحدة على الأقل')
  }),

  // Update vehicle
  update: z.object({
    make: z.string().min(1, 'الماركة مطلوبة').max(50, 'الماركة طويلة جداً').optional(),
    model: z.string().min(1, 'الموديل مطلوب').max(50, 'الموديل طويل جداً').optional(),
    year: commonSchemas.year.optional(),
    price: commonSchemas.price.optional(),
    stockNumber: z.string().min(1, 'رقم المخزون مطلوب').max(20, 'رقم المخزون طويل جداً').optional(),
    vin: z.string().min(17, 'رقم VIN يجب أن يكون 17 حرف').max(17, 'رقم VIN يجب أن يكون 17 حرف').optional(),
    category: commonSchemas.vehicleCategory.optional(),
    fuelType: commonSchemas.fuelType.optional(),
    transmission: commonSchemas.transmission.optional(),
    mileage: commonSchemas.mileage.optional(),
    color: z.string().min(1, 'اللون مطلوب').max(30, 'اللون طويل جداً').optional(),
    description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل').max(2000, 'الوصف طويل جداً').optional(),
    status: commonSchemas.vehicleStatus.optional(),
    featured: z.boolean().optional(),
    images: z.array(z.object({
      imageUrl: z.string().url('رابط الصورة غير صالح'),
      isPrimary: z.boolean(),
      altText: z.string().optional()
    })).optional()
  })
}

// Booking validation schemas
export const bookingSchemas = {
  // Test drive booking
  testDrive: z.object({
    vehicleId: z.string().min(1, 'معرف المركبة مطلوب'),
    date: commonSchemas.futureDate,
    timeSlot: z.string().min(1, 'الوقت مطلوب'),
    customerInfo: z.object({
      name: commonSchemas.name,
      email: commonSchemas.email,
      phone: commonSchemas.phone,
      licenseNumber: commonSchemas.licenseNumber
    }),
    message: commonSchemas.message.optional()
  }),

  // Service booking
  service: z.object({
    vehicleId: z.string().min(1, 'معرف المركبة مطلوب'),
    serviceType: z.string().min(1, 'نوع الخدمة مطلوب'),
    date: commonSchemas.futureDate,
    timeSlot: z.string().min(1, 'الوقت مطلوب'),
    customerInfo: z.object({
      name: commonSchemas.name,
      email: commonSchemas.email,
      phone: commonSchemas.phone,
      licenseNumber: commonSchemas.licenseNumber
    }),
    message: commonSchemas.message.optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional()
  })
}

// User validation schemas
export const userSchemas = {
  // Register
  register: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    licenseNumber: commonSchemas.licenseNumber.optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword']
  }),

  // Login
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'كلمة المرور مطلوبة')
  }),

  // Update profile
  updateProfile: z.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email.optional(),
    phone: commonSchemas.phone.optional(),
    licenseNumber: commonSchemas.licenseNumber.optional()
  }),

  // Change password
  changePassword: z.object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور الجديدة غير متطابقتين',
    path: ['confirmPassword']
  }).refine((data) => data.newPassword !== data.currentPassword, {
    message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
    path: ['newPassword']
  })
}

// Contact form validation
export const contactSchemas = {
  sendMessage: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    subject: z.string().min(1, 'الموضوع مطلوب').max(100, 'الموضوع طويل جداً'),
    message: commonSchemas.message,
    vehicleInterest: z.string().optional()
  })
}

// Admin validation schemas
export const adminSchemas = {
  // Create admin user
  createUser: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    role: z.enum(['ADMIN', 'BRANCH_MANAGER', 'STAFF'], {
      errorMap: () => ({ message: 'الدور غير صالح' })
    }),
    permissions: z.array(z.string()).optional()
  }),

  // Update settings
  updateSettings: z.object({
    siteTitle: z.string().min(1, 'عنوان الموقع مطلوب').max(100, 'العنوان طويل جداً'),
    siteDescription: z.string().max(500, 'الوصف طويل جداً').optional(),
    contactEmail: commonSchemas.email.optional(),
    contactPhone: commonSchemas.phone.optional(),
    address: z.string().max(200, 'العنوان طويل جداً').optional(),
    workingHours: z.string().max(100, 'ساعات العمل طويلة جداً').optional()
  })
}

// Utility functions
export const validationUtils = {
  // Validate data against schema
  validate: <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message)
        return { success: false, errors }
      }
      return { success: false, errors: ['حدث خطأ في التحقق من البيانات'] }
    }
  },

  // Validate and return formatted errors
  validateWithDetails: <T>(schema: z.ZodSchema<T>, data: unknown) => {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const field = err.path.join('.')
          errors[field] = err.message
        })
        return { success: false, errors, data: null }
      }
      return { 
        success: false, 
        errors: { _form: 'حدث خطأ في التحقق من البيانات' }, 
        data: null 
      }
    }
  },

  // Sanitize string input
  sanitizeString: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ')
  },

  // Sanitize phone number
  sanitizePhone: (phone: string): string => {
    return phone.replace(/[^\d]/g, '')
  },

  // Sanitize email
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim()
  }
}

// Export all validation utilities
const validation = {
  common: commonSchemas,
  vehicle: vehicleSchemas,
  booking: bookingSchemas,
  user: userSchemas,
  contact: contactSchemas,
  admin: adminSchemas,
  utils: validationUtils
}

export default validation