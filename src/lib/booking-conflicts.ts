import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'
import { addHours, addMinutes, isAfter, isBefore, isWithinInterval, parseISO, setHours, setMinutes } from 'date-fns'

interface ConflictCheckOptions {
  vehicleId?: string
  serviceTypeIds?: string[]
  date: Date
  timeSlot: string
  excludeBookingId?: string
  bufferMinutes?: number
}

interface ConflictResult {
  hasConflicts: boolean
  conflicts: Array<{
    type: 'VEHICLE_UNAVAILABLE' | 'SERVICE_OVERLAP' | 'STAFF_UNAVAILABLE' | 'TIME_SLOT_FULL'
    bookingId?: string
    message: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
    suggestedAlternatives?: Array<{
      date: string
      timeSlot: string
      reason: string
    }>
  }>
  availableAlternatives: Array<{
    date: string
    timeSlots: string[]
    reason: string
  }>
}

interface SchedulingRules {
  maxConcurrentBookings: number
  minBufferMinutes: number
  maxBookingsPerDay: number
  workingHours: {
    start: string // HH:mm
    end: string // HH:mm
  }
  breakTimes: Array<{
    start: string // HH:mm
    end: string // HH:mm
  }>
  blockedDates: Array<{
    date: string // YYYY-MM-DD
    reason: string
  }>
}

export class BookingConflictManager {
  private static instance: BookingConflictManager
  private schedulingRules: SchedulingRules

  private constructor() {
    this.schedulingRules = {
      maxConcurrentBookings: 3,
      minBufferMinutes: 15,
      maxBookingsPerDay: 20,
      workingHours: {
        start: '08:00',
        end: '18:00'
      },
      breakTimes: [
        { start: '13:00', end: '14:00' } // Lunch break
      ],
      blockedDates: [] // Will be populated from database or config
    }
  }

  static getInstance(): BookingConflictManager {
    if (!BookingConflictManager.instance) {
      BookingConflictManager.instance = new BookingConflictManager()
    }
    return BookingConflictManager.instance
  }

  /**
   * Comprehensive conflict checking for bookings
   */
  async checkConflicts(options: ConflictCheckOptions): Promise<ConflictResult> {
    const {
      vehicleId,
      serviceTypeIds = [],
      date,
      timeSlot,
      excludeBookingId,
      bufferMinutes = 15
    } = options

    const conflicts: ConflictResult['conflicts'] = []
    const availableAlternatives: ConflictResult['availableAlternatives'] = []

    // 1. Check if date is blocked
    const dateStr = date.toISOString().split('T')[0]
    if (this.isDateBlocked(dateStr)) {
      conflicts.push({
        type: 'TIME_SLOT_FULL',
        message: 'هذا التاريخ غير متاح للحجز',
        severity: 'HIGH'
      })
      return {
        hasConflicts: true,
        conflicts,
        availableAlternatives: await this.findAlternativeDates(date, 7)
      }
    }

    // 2. Check if within working hours
    if (!this.isWithinWorkingHours(timeSlot)) {
      conflicts.push({
        type: 'TIME_SLOT_FULL',
        message: 'هذا الوقت خارج أوقات العمل',
        severity: 'HIGH'
      })
      return {
        hasConflicts: true,
        conflicts,
        availableAlternatives: await this.getAvailableTimeSlots(date, serviceTypeIds)
      }
    }

    // 3. Check if during break time
    if (this.isDuringBreak(timeSlot)) {
      conflicts.push({
        type: 'TIME_SLOT_FULL',
        message: 'هذا الوقت خلال فترة الاستراحة',
        severity: 'MEDIUM'
      })
      return {
        hasConflicts: true,
        conflicts,
        availableAlternatives: await this.getAvailableTimeSlots(date, serviceTypeIds)
      }
    }

    // 4. Check vehicle conflicts (for test drives)
    if (vehicleId) {
      const vehicleConflict = await this.checkVehicleConflicts(
        vehicleId,
        date,
        timeSlot,
        excludeBookingId,
        bufferMinutes
      )
      if (vehicleConflict.hasConflicts) {
        conflicts.push(...vehicleConflict.conflicts)
      }
    }

    // 5. Check service capacity conflicts (for service bookings)
    if (serviceTypeIds.length > 0) {
      const serviceConflict = await this.checkServiceConflicts(
        serviceTypeIds,
        date,
        timeSlot,
        excludeBookingId,
        bufferMinutes
      )
      if (serviceConflict.hasConflicts) {
        conflicts.push(...serviceConflict.conflicts)
      }
    }

    // 6. Check daily booking limit
    const dailyLimitConflict = await this.checkDailyBookingLimit(date, excludeBookingId)
    if (dailyLimitConflict.hasConflicts) {
      conflicts.push(...dailyLimitConflict.conflicts)
    }

    // 7. Check resource availability (staff, equipment)
    const resourceConflict = await this.checkResourceAvailability(
      date,
      timeSlot,
      serviceTypeIds,
      excludeBookingId
    )
    if (resourceConflict.hasConflicts) {
      conflicts.push(...resourceConflict.conflicts)
    }

    // If no conflicts, return success
    if (conflicts.length === 0) {
      return {
        hasConflicts: false,
        conflicts: [],
        availableAlternatives: []
      }
    }

    // Find alternatives if there are conflicts
    const alternatives = await this.findAlternatives(options, conflicts)

    return {
      hasConflicts: true,
      conflicts,
      availableAlternatives: alternatives
    }
  }

  /**
   * Check vehicle availability conflicts
   */
  private async checkVehicleConflicts(
    vehicleId: string,
    date: Date,
    timeSlot: string,
    excludeBookingId?: string,
    bufferMinutes: number = 15
  ): Promise<{ hasConflicts: boolean; conflicts: ConflictResult['conflicts'] }> {
    const conflicts: ConflictResult['conflicts'] = []

    // Check if vehicle is available
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { status: true }
    })

    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      conflicts.push({
        type: 'VEHICLE_UNAVAILABLE',
        message: 'المركبة غير متاحة حالياً',
        severity: 'HIGH'
      })
      return { hasConflicts: true, conflicts }
    }

    // Check for existing bookings
    const existingBookings = await db.testDriveBooking.findMany({
      where: {
        vehicleId,
        date: date,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        ...(excludeBookingId && { id: { not: excludeBookingId } })
      },
      select: {
        id: true,
        timeSlot: true,
        status: true
      }
    })

    // Check for time slot conflicts with buffer
    const bookingTime = this.parseTimeSlot(timeSlot)
    const bookingStart = bookingTime.start
    const bookingEnd = bookingTime.end

    for (const existingBooking of existingBookings) {
      const existingTime = this.parseTimeSlot(existingBooking.timeSlot)
      const existingStart = addMinutes(existingTime.start, -bufferMinutes)
      const existingEnd = addMinutes(existingTime.end, bufferMinutes)

      // Check if time ranges overlap
      if (
        isBefore(bookingStart, existingEnd) &&
        isAfter(bookingEnd, existingStart)
      ) {
        conflicts.push({
          type: 'VEHICLE_UNAVAILABLE',
          bookingId: existingBooking.id,
          message: `يوجد حجز آخر للمركبة في نفس الوقت تقريباً (${existingBooking.timeSlot})`,
          severity: 'HIGH',
          suggestedAlternatives: await this.getSuggestedTimeSlots(date, [existingBooking.timeSlot])
        })
      }
    }

    return { hasConflicts: conflicts.length > 0, conflicts }
  }

  /**
   * Check service capacity conflicts
   */
  private async checkServiceConflicts(
    serviceTypeIds: string[],
    date: Date,
    timeSlot: string,
    excludeBookingId?: string,
    bufferMinutes: number = 15
  ): Promise<{ hasConflicts: boolean; conflicts: ConflictResult['conflicts'] }> {
    const conflicts: ConflictResult['conflicts'] = []

    // Get service types with their durations
    const serviceTypes = await db.serviceType.findMany({
      where: {
        id: {
          in: serviceTypeIds
        }
      },
      select: {
        id: true,
        name: true,
        duration: true
      }
    })

    // Calculate total duration needed
    const totalDuration = serviceTypes.reduce((sum, service) => sum + service.duration, 0)
    const bookingTime = this.parseTimeSlot(timeSlot)
    const bookingEnd = addMinutes(bookingTime.start, totalDuration)

    // Check concurrent bookings for each service type
    for (const serviceType of serviceTypes) {
      const existingBookings = await db.serviceBooking.findMany({
        where: {
          serviceTypeId: serviceType.id,
          date: date,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          ...(excludeBookingId && { id: { not: excludeBookingId } })
        },
        select: {
          id: true,
          timeSlot: true,
          serviceType: {
            select: {
              duration: true
            }
          }
        }
      })

      let concurrentBookings = 0
      const conflictingBookings: string[] = []

      for (const existingBooking of existingBookings) {
        const existingTime = this.parseTimeSlot(existingBooking.timeSlot)
        const existingStart = addMinutes(existingTime.start, -bufferMinutes)
        const existingEnd = addMinutes(existingTime.end, bufferMinutes)

        // Check if time ranges overlap
        if (
          isBefore(bookingTime.start, existingEnd) &&
          isAfter(bookingEnd, existingStart)
        ) {
          concurrentBookings++
          conflictingBookings.push(existingBooking.timeSlot)
        }
      }

      // Check if exceeds maximum concurrent bookings
      if (concurrentBookings >= this.schedulingRules.maxConcurrentBookings) {
        conflicts.push({
          type: 'SERVICE_OVERLAP',
          message: `تم الوصول إلى الحد الأقصى للحجوزات المتزامنة لخدمة ${serviceType.name}`,
          severity: 'MEDIUM',
          suggestedAlternatives: await this.getSuggestedTimeSlots(date, conflictingBookings)
        })
      }
    }

    return { hasConflicts: conflicts.length > 0, conflicts }
  }

  /**
   * Check daily booking limit
   */
  private async checkDailyBookingLimit(
    date: Date,
    excludeBookingId?: string
  ): Promise<{ hasConflicts: boolean; conflicts: ConflictResult['conflicts'] }> {
    const conflicts: ConflictResult['conflicts'] = []

    const totalBookings = await db.$transaction(async (tx) => {
      const testDriveCount = await tx.testDriveBooking.count({
        where: {
          date: date,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          ...(excludeBookingId && { id: { not: excludeBookingId } })
        }
      })

      const serviceCount = await tx.serviceBooking.count({
        where: {
          date: date,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          ...(excludeBookingId && { id: { not: excludeBookingId } })
        }
      })

      return testDriveCount + serviceCount
    })

    if (totalBookings >= this.schedulingRules.maxBookingsPerDay) {
      conflicts.push({
        type: 'TIME_SLOT_FULL',
        message: 'تم الوصول إلى الحد الأقصى للحجوزات في هذا اليوم',
        severity: 'HIGH',
        suggestedAlternatives: await this.findAlternativeDates(date, 3)
      })
    }

    return { hasConflicts: conflicts.length > 0, conflicts }
  }

  /**
   * Check resource availability (staff, equipment)
   */
  private async checkResourceAvailability(
    date: Date,
    timeSlot: string,
    serviceTypeIds: string[],
    excludeBookingId?: string
  ): Promise<{ hasConflicts: boolean; conflicts: ConflictResult['conflicts'] }> {
    const conflicts: ConflictResult['conflicts'] = []

    // This is a simplified version - in a real system, you would check:
    // - Staff availability
    // - Equipment availability
    // - Bay availability
    
    // For now, we'll simulate staff availability
    const bookingTime = this.parseTimeSlot(timeSlot)
    
    // Check if we have enough staff for the requested services
    const staffAvailable = await this.checkStaffAvailability(date, bookingTime, serviceTypeIds.length)
    
    if (!staffAvailable.available) {
      conflicts.push({
        type: 'STAFF_UNAVAILABLE',
        message: 'لا يوجد فنيون متاحون في هذا الوقت',
        severity: 'MEDIUM',
        suggestedAlternatives: await this.getSuggestedTimeSlots(date, [])
      })
    }

    return { hasConflicts: conflicts.length > 0, conflicts }
  }

  /**
   * Find alternative dates and time slots
   */
  private async findAlternatives(
    options: ConflictCheckOptions,
    conflicts: ConflictResult['conflicts']
  ): Promise<ConflictResult['availableAlternatives']> {
    const alternatives: ConflictResult['availableAlternatives'] = []

    // Get available time slots for the same date
    const sameDateAlternatives = await this.getAvailableTimeSlots(
      options.date,
      options.serviceTypeIds,
      options.excludeBookingId
    )

    if (sameDateAlternatives.timeSlots.length > 0) {
      alternatives.push({
        date: options.date.toISOString().split('T')[0],
        timeSlots: sameDateAlternatives.timeSlots,
        reason: 'أوقات متاحة في نفس اليوم'
      })
    }

    // Get alternative dates
    const alternativeDates = await this.findAlternativeDates(options.date, 3)
    for (const altDate of alternativeDates) {
      const altTimeSlots = await this.getAvailableTimeSlots(
        new Date(altDate.date),
        options.serviceTypeIds,
        options.excludeBookingId
      )

      if (altTimeSlots.timeSlots.length > 0) {
        alternatives.push({
          date: altDate.date,
          timeSlots: altTimeSlots.timeSlots,
          reason: altDate.reason
        })
      }
    }

    return alternatives.slice(0, 5) // Limit to 5 alternatives
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimeSlots(
    date: Date,
    serviceTypeIds: string[] = [],
    excludeBookingId?: string
  ): Promise<{ timeSlots: string[]; reason?: string }> {
    const dateStr = date.toISOString().split('T')[0]
    
    // Check if date is blocked
    if (this.isDateBlocked(dateStr)) {
      return { timeSlots: [], reason: 'التاريخ غير متاح' }
    }

    // Generate all possible time slots
    const allTimeSlots = this.generateTimeSlots()
    const availableTimeSlots: string[] = []

    for (const timeSlot of allTimeSlots) {
      // Check if within working hours
      if (!this.isWithinWorkingHours(timeSlot)) {
        continue
      }

      // Check if during break time
      if (this.isDuringBreak(timeSlot)) {
        continue
      }

      // Check conflicts
      const conflictCheck = await this.checkConflicts({
        date,
        timeSlot,
        serviceTypeIds,
        excludeBookingId
      })

      if (!conflictCheck.hasConflicts) {
        availableTimeSlots.push(timeSlot)
      }
    }

    return { timeSlots: availableTimeSlots }
  }

  /**
   * Find alternative dates
   */
  private async findAlternativeDates(
    currentDate: Date,
    daysAhead: number
  ): Promise<Array<{ date: string; reason: string }>> {
    const alternatives: Array<{ date: string; reason: string }> = []
    
    for (let i = 1; i <= daysAhead; i++) {
      const alternativeDate = new Date(currentDate)
      alternativeDate.setDate(alternativeDate.getDate() + i)
      
      const dateStr = alternativeDate.toISOString().split('T')[0]
      
      // Skip weekends
      const dayOfWeek = alternativeDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue
      }
      
      // Check if date is blocked
      if (this.isDateBlocked(dateStr)) {
        continue
      }
      
      // Check if date has available slots
      const availableSlots = await this.getAvailableTimeSlots(alternativeDate)
      if (availableSlots.timeSlots.length > 0) {
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        alternatives.push({
          date: dateStr,
          reason: `${dayNames[dayOfWeek]} ${alternativeDate.toLocaleDateString('ar-EG')}`
        })
      }
    }
    
    return alternatives
  }

  /**
   * Get suggested time slots avoiding conflicts
   */
  private async getSuggestedTimeSlots(
    date: Date,
    conflictingSlots: string[]
  ): Promise<Array<{ date: string; timeSlot: string; reason: string }>> {
    const suggestions: Array<{ date: string; timeSlot: string; reason: string }> = []
    const allTimeSlots = this.generateTimeSlots()
    
    for (const timeSlot of allTimeSlots) {
      // Skip conflicting slots
      if (conflictingSlots.includes(timeSlot)) {
        continue
      }
      
      // Check if slot is available
      const conflictCheck = await this.checkConflicts({
        date,
        timeSlot
      })
      
      if (!conflictCheck.hasConflicts) {
        suggestions.push({
          date: date.toISOString().split('T')[0],
          timeSlot,
          reason: 'وقت متاح'
        })
        
        // Return first 3 suggestions
        if (suggestions.length >= 3) {
          break
        }
      }
    }
    
    return suggestions
  }

  // Helper methods
  private isDateBlocked(dateStr: string): boolean {
    return this.schedulingRules.blockedDates.some(blocked => blocked.date === dateStr)
  }

  private isWithinWorkingHours(timeSlot: string): boolean {
    const { start, end } = this.schedulingRules.workingHours
    return timeSlot >= start && timeSlot < end
  }

  private isDuringBreak(timeSlot: string): boolean {
    return this.schedulingRules.breakTimes.some(breakTime => 
      timeSlot >= breakTime.start && timeSlot < breakTime.end
    )
  }

  private parseTimeSlot(timeSlot: string): { start: Date; end: Date } {
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const baseDate = new Date()
    const start = setMinutes(setHours(baseDate, hours), minutes)
    const end = addMinutes(start, 60) // Default 1 hour slots
    return { start, end }
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = []
    const { start, end } = this.schedulingRules.workingHours
    
    const [startHour, startMinute] = start.split(':').map(Number)
    const [endHour, endMinute] = end.split(':').map(Number)
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 60) { // 1 hour intervals
        if (hour === endHour && minute >= endMinute) break
        
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Skip break times
        if (!this.isDuringBreak(timeSlot)) {
          slots.push(timeSlot)
        }
      }
    }
    
    return slots
  }

  private async checkStaffAvailability(
    date: Date,
    bookingTime: { start: Date; end: Date },
    requiredStaff: number
  ): Promise<{ available: boolean; reason?: string }> {
    // This is a simplified version
    // In a real system, you would check staff schedules, time off, etc.
    
    // Simulate staff availability
    const totalStaff = 5 // Total available staff
    const bookedStaff = Math.floor(Math.random() * 3) // Random booked staff
    
    const availableStaff = totalStaff - bookedStaff
    
    return {
      available: availableStaff >= requiredStaff,
      reason: availableStaff < requiredStaff 
        ? `متوفر ${availableStaff} فنيون فقط، مطلوب ${requiredStaff}`
        : undefined
    }
  }

  /**
   * Optimize booking schedule to minimize conflicts
   */
  async optimizeSchedule(bookings: Array<{
    id?: string
    vehicleId?: string
    serviceTypeIds: string[]
    preferredDate: Date
    preferredTimeSlot: string
    duration?: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }>): Promise<Array<{
    original: any
    optimized: {
      date: string
      timeSlot: string
      confidence: number
    }
    conflicts: string[]
  }>> {
    const results = []
    
    // Sort by priority
    const sortedBookings = bookings.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    
    for (const booking of sortedBookings) {
      const conflicts: string[] = []
      let optimizedSlot = { date: booking.preferredDate.toISOString().split('T')[0], timeSlot: booking.preferredTimeSlot, confidence: 1 }
      
      // Check preferred slot
      const conflictCheck = await this.checkConflicts({
        vehicleId: booking.vehicleId,
        serviceTypeIds: booking.serviceTypeIds,
        date: booking.preferredDate,
        timeSlot: booking.preferredTimeSlot,
        excludeBookingId: booking.id
      })
      
      if (conflictCheck.hasConflicts) {
        conflicts.push(...conflictCheck.conflicts.map(c => c.message))
        
        // Try to find alternative
        if (conflictCheck.availableAlternatives.length > 0) {
          const firstAlternative = conflictCheck.availableAlternatives[0]
          if (firstAlternative.timeSlots.length > 0) {
            optimizedSlot = {
              date: firstAlternative.date,
              timeSlot: firstAlternative.timeSlots[0],
              confidence: 0.8
            }
          }
        }
      }
      
      results.push({
        original: booking,
        optimized: optimizedSlot,
        conflicts
      })
    }
    
    return results
  }
}

// Export utility functions
export const bookingConflictUtils = {
  /**
   * Calculate optimal buffer time between bookings
   */
  calculateBufferTime(serviceDuration: number, complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' = 'MEDIUM'): number {
    const baseBuffer = 15
    const complexityMultiplier = {
      'SIMPLE': 1,
      'MEDIUM': 1.5,
      'COMPLEX': 2
    }
    
    return Math.ceil(baseBuffer * complexityMultiplier[complexity] * (serviceDuration / 60))
  },

  /**
   * Check if two time slots overlap
   */
  doTimeSlotsOverlap(slot1: string, slot2: string, bufferMinutes: number = 0): boolean {
    const parseSlot = (slot: string) => {
      const [hours, minutes] = slot.split(':').map(Number)
      const baseDate = new Date()
      return {
        start: setMinutes(setHours(baseDate, hours), minutes),
        end: addMinutes(setMinutes(setHours(baseDate, hours), minutes), 60)
      }
    }
    
    const time1 = parseSlot(slot1)
    const time2 = parseSlot(slot2)
    
    const start1 = addMinutes(time1.start, -bufferMinutes)
    const end1 = addMinutes(time1.end, bufferMinutes)
    const start2 = addMinutes(time2.start, -bufferMinutes)
    const end2 = addMinutes(time2.end, bufferMinutes)
    
    return isBefore(start1, end2) && isAfter(end1, start2)
  },

  /**
   * Generate time-efficient booking sequence
   */
  optimizeBookingSequence(bookings: Array<{ timeSlot: string; duration: number }>): string[] {
    // Sort bookings by time to minimize gaps
    return bookings
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
      .map(b => b.timeSlot)
  }
}