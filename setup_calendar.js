const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupCalendarData() {
  try {
    // Check if time slots exist
    const existingTimeSlots = await prisma.timeSlot.count();
    if (existingTimeSlots === 0) {
      console.log('Creating time slots...');
      
      const timeSlots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true }, // Monday
        { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '12:00', endTime: '13:00', maxBookings: 2, isActive: true },
        { dayOfWeek: 1, startTime: '14:00', endTime: '15:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '15:00', endTime: '16:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '16:00', endTime: '17:00', maxBookings: 3, isActive: true },
        
        { dayOfWeek: 2, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true }, // Tuesday
        { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '12:00', endTime: '13:00', maxBookings: 2, isActive: true },
        { dayOfWeek: 2, startTime: '14:00', endTime: '15:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '15:00', endTime: '16:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '16:00', endTime: '17:00', maxBookings: 3, isActive: true },
        
        { dayOfWeek: 3, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true }, // Wednesday
        { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 3, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 3, startTime: '12:00', endTime: '13:00', maxBookings: 2, isActive: true },
        { dayOfWeek: 3, startTime: '14:00', endTime: '15:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 3, startTime: '15:00', endTime: '16:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 3, startTime: '16:00', endTime: '17:00', maxBookings: 3, isActive: true },
        
        { dayOfWeek: 4, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true }, // Thursday
        { dayOfWeek: 4, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 4, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 4, startTime: '12:00', endTime: '13:00', maxBookings: 2, isActive: true },
        { dayOfWeek: 4, startTime: '14:00', endTime: '15:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 4, startTime: '15:00', endTime: '16:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 4, startTime: '16:00', endTime: '17:00', maxBookings: 3, isActive: true },
        
        { dayOfWeek: 5, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true }, // Friday
        { dayOfWeek: 5, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 5, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 5, startTime: '12:00', endTime: '13:00', maxBookings: 2, isActive: true },
        { dayOfWeek: 5, startTime: '14:00', endTime: '15:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 5, startTime: '15:00', endTime: '16:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 5, startTime: '16:00', endTime: '17:00', maxBookings: 3, isActive: true },
      ];
      
      for (const slot of timeSlots) {
        await prisma.timeSlot.create({
          data: slot
        });
      }
      console.log('✅ Time slots created');
    }
    
    // Check if holidays exist
    const existingHolidays = await prisma.holiday.count();
    if (existingHolidays === 0) {
      console.log('Creating holidays...');
      
      const currentYear = new Date().getFullYear();
      const holidays = [
        {
          name: 'رأس السنة الميلادية',
          date: new Date(currentYear, 0, 1), // January 1st
          isRecurring: true,
          description: 'بداية العام الجديد'
        },
        {
          name: 'عيد الميلاد المجيد',
          date: new Date(currentYear, 11, 25), // December 25th
          isRecurring: true,
          description: 'عيد ميلاد السيد المسيح'
        },
        {
          name: 'عيد الفطر',
          date: new Date(currentYear, 3, 10), // Approximate date
          isRecurring: false,
          description: 'عيد الفطر المبارك'
        },
        {
          name: 'عيد الأضحى',
          date: new Date(currentYear, 5, 17), // Approximate date
          isRecurring: false,
          description: 'عيد الأضحى المبارك'
        },
        {
          name: 'رأس السنة الهجرية',
          date: new Date(currentYear, 6, 21), // Approximate date
          isRecurring: false,
          description: 'بداية العام الهجري الجديد'
        },
        {
          name: 'عيد تحرير سيناء',
          date: new Date(currentYear, 3, 25), // April 25th
          isRecurring: true,
          description: 'ذكرى تحرير سيناء'
        },
        {
          name: 'عيد العمال',
          date: new Date(currentYear, 4, 1), // May 1st
          isRecurring: true,
          description: 'عيد العمال العالمي'
        },
        {
          name: 'عيد الثورة',
          date: new Date(currentYear, 6, 23), // July 23rd
          isRecurring: true,
          description: 'ذكرى ثورة 23 يوليو'
        },
        {
          name: 'عيد القوات المسلحة',
          date: new Date(currentYear, 9, 6), // October 6th
          isRecurring: true,
          description: 'ذكرى نصر أكتوبر'
        },
        {
          name: 'عيد الشرطة',
          date: new Date(currentYear, 0, 24), // January 24th
          isRecurring: true,
          description: 'عيد الشرطة المصرية'
        }
      ];
      
      for (const holiday of holidays) {
        await prisma.holiday.create({
          data: holiday
        });
      }
      console.log('✅ Holidays created');
    }
    
    console.log('\n✅ Calendar data setup completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCalendarData();